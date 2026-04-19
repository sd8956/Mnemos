use rusqlite::{Connection, OpenFlags};
use serde::Serialize;
use std::path::Path;

const PERSONAL_CATEGORY_ID: &str = "personal";

// Types we consider "meaningful" for display — telemetry types
// (tool_use, command, file_read, file_change, search) are filtered out.
const MEANINGFUL_TYPES: &[&str] = &[
    "decision",
    "architecture",
    "bugfix",
    "discovery",
    "learning",
    "pattern",
    "manual",
    "config",
    "session_summary",
];

#[derive(Serialize)]
pub struct EngramProject {
    pub id: String,
    pub name: String,
    pub scope: String,
    pub note_count: usize,
    pub last_modified: Option<String>,
}

#[derive(Serialize)]
pub struct EngramNote {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub content: String,
    #[serde(rename = "type")]
    pub kind: Option<String>,
    pub topic_key: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize)]
pub struct EngramDbInfo {
    pub exists: bool,
    pub readable: bool,
    pub project_count: usize,
    pub total_observations: usize,
    pub error: Option<String>,
}

fn open_readonly(db_path: &str) -> Result<Connection, String> {
    let path = Path::new(db_path);
    if !path.exists() {
        return Err(format!("Path does not exist: {}", db_path));
    }
    if !path.is_file() {
        return Err(format!("Path is not a file: {}", db_path));
    }
    Connection::open_with_flags(
        path,
        OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX,
    )
    .map_err(|e| format!("Failed to open database: {}", e))
}

fn slugify(input: &str) -> String {
    input
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() {
                c.to_ascii_lowercase()
            } else {
                '_'
            }
        })
        .collect::<String>()
        .trim_matches('_')
        .to_string()
}

fn build_type_filter() -> String {
    let placeholders = MEANINGFUL_TYPES
        .iter()
        .map(|_| "?")
        .collect::<Vec<_>>()
        .join(",");
    format!("type IN ({})", placeholders)
}

#[tauri::command]
pub async fn engram_validate_db(db_path: String) -> Result<EngramDbInfo, String> {
    let path = Path::new(&db_path);
    if !path.exists() {
        return Ok(EngramDbInfo {
            exists: false,
            readable: false,
            project_count: 0,
            total_observations: 0,
            error: Some("Path does not exist".into()),
        });
    }

    let conn = match open_readonly(&db_path) {
        Ok(c) => c,
        Err(e) => {
            return Ok(EngramDbInfo {
                exists: true,
                readable: false,
                project_count: 0,
                total_observations: 0,
                error: Some(e),
            });
        }
    };

    let type_filter = build_type_filter();
    let params: Vec<&dyn rusqlite::ToSql> = MEANINGFUL_TYPES
        .iter()
        .map(|t| t as &dyn rusqlite::ToSql)
        .collect();

    let project_count: usize = conn
        .query_row(
            &format!(
                "SELECT COUNT(DISTINCT project) FROM observations \
                 WHERE deleted_at IS NULL AND scope = 'project' \
                 AND project IS NOT NULL AND project != '' AND {}",
                type_filter
            ),
            params.as_slice(),
            |row| row.get(0),
        )
        .map_err(|e| format!("Failed to count projects: {}", e))?;

    let total: usize = conn
        .query_row(
            &format!(
                "SELECT COUNT(*) FROM observations \
                 WHERE deleted_at IS NULL AND {}",
                type_filter
            ),
            params.as_slice(),
            |row| row.get(0),
        )
        .map_err(|e| format!("Failed to count observations: {}", e))?;

    Ok(EngramDbInfo {
        exists: true,
        readable: true,
        project_count,
        total_observations: total,
        error: None,
    })
}

#[tauri::command]
pub async fn engram_list_projects(db_path: String) -> Result<Vec<EngramProject>, String> {
    let conn = open_readonly(&db_path)?;
    let type_filter = build_type_filter();
    let params: Vec<&dyn rusqlite::ToSql> = MEANINGFUL_TYPES
        .iter()
        .map(|t| t as &dyn rusqlite::ToSql)
        .collect();

    let mut projects: Vec<EngramProject> = Vec::new();

    // Project-scoped observations grouped by project column.
    let mut stmt = conn
        .prepare(&format!(
            "SELECT project, COUNT(*) as note_count, MAX(updated_at) as last_modified \
             FROM observations \
             WHERE deleted_at IS NULL AND scope = 'project' \
             AND project IS NOT NULL AND project != '' AND {} \
             GROUP BY project \
             ORDER BY last_modified DESC",
            type_filter
        ))
        .map_err(|e| format!("Prepare failed: {}", e))?;

    let rows = stmt
        .query_map(params.as_slice(), |row| {
            let project: String = row.get(0)?;
            let count: usize = row.get(1)?;
            let last_modified: Option<String> = row.get(2)?;
            Ok(EngramProject {
                id: slugify(&project),
                name: project,
                scope: "project".to_string(),
                note_count: count,
                last_modified,
            })
        })
        .map_err(|e| format!("Query failed: {}", e))?;

    for row in rows {
        if let Ok(project) = row {
            projects.push(project);
        }
    }

    // Personal scope as one synthetic category.
    let mut personal_stmt = conn
        .prepare(&format!(
            "SELECT COUNT(*), MAX(updated_at) FROM observations \
             WHERE deleted_at IS NULL AND scope = 'personal' AND {}",
            type_filter
        ))
        .map_err(|e| format!("Prepare failed: {}", e))?;

    let personal_info: Option<(usize, Option<String>)> = personal_stmt
        .query_row(params.as_slice(), |row| Ok((row.get(0)?, row.get(1)?)))
        .ok();

    if let Some((count, last_modified)) = personal_info {
        if count > 0 {
            projects.push(EngramProject {
                id: PERSONAL_CATEGORY_ID.to_string(),
                name: "Personal".to_string(),
                scope: "personal".to_string(),
                note_count: count,
                last_modified,
            });
        }
    }

    Ok(projects)
}

#[tauri::command]
pub async fn engram_read_notes(
    db_path: String,
    project: String,
    scope: String,
) -> Result<Vec<EngramNote>, String> {
    let conn = open_readonly(&db_path)?;
    let type_filter = build_type_filter();

    let (query, params): (String, Vec<Box<dyn rusqlite::ToSql>>) = if scope == "personal" {
        let mut p: Vec<Box<dyn rusqlite::ToSql>> = MEANINGFUL_TYPES
            .iter()
            .map(|t| Box::new(t.to_string()) as Box<dyn rusqlite::ToSql>)
            .collect();
        (
            format!(
                "SELECT id, type, title, content, topic_key, created_at, updated_at \
                 FROM observations \
                 WHERE deleted_at IS NULL AND scope = 'personal' AND {} \
                 ORDER BY updated_at DESC LIMIT 500",
                type_filter
            ),
            {
                p.reverse();
                p.reverse();
                p
            },
        )
    } else {
        let mut p: Vec<Box<dyn rusqlite::ToSql>> = MEANINGFUL_TYPES
            .iter()
            .map(|t| Box::new(t.to_string()) as Box<dyn rusqlite::ToSql>)
            .collect();
        p.push(Box::new(project.clone()));
        (
            format!(
                "SELECT id, type, title, content, topic_key, created_at, updated_at \
                 FROM observations \
                 WHERE deleted_at IS NULL AND scope = 'project' AND {} AND project = ? \
                 ORDER BY updated_at DESC LIMIT 500",
                type_filter
            ),
            p,
        )
    };

    let project_id = if scope == "personal" {
        PERSONAL_CATEGORY_ID.to_string()
    } else {
        slugify(&project)
    };

    let mut stmt = conn
        .prepare(&query)
        .map_err(|e| format!("Prepare failed: {}", e))?;

    let param_refs: Vec<&dyn rusqlite::ToSql> =
        params.iter().map(|p| p.as_ref()).collect();

    // For project scope, we need types params FIRST, then project last — rebuild ordering.
    let ordered_params: Vec<&dyn rusqlite::ToSql> = if scope == "personal" {
        param_refs
    } else {
        // types + project. params was built types-then-project; that order matches the SQL.
        param_refs
    };

    let rows = stmt
        .query_map(ordered_params.as_slice(), |row| {
            let id: i64 = row.get(0)?;
            let kind: Option<String> = row.get(1)?;
            let title: String = row.get(2)?;
            let content: String = row.get(3)?;
            let topic_key: Option<String> = row.get(4)?;
            let created_at: String = row.get(5)?;
            let updated_at: String = row.get(6)?;
            Ok(EngramNote {
                id: format!("engram_obs_{}", id),
                project_id: project_id.clone(),
                title,
                content,
                kind,
                topic_key,
                created_at,
                updated_at,
            })
        })
        .map_err(|e| format!("Query failed: {}", e))?;

    let mut notes = Vec::new();
    for row in rows {
        match row {
            Ok(n) => notes.push(n),
            Err(e) => eprintln!("Failed to map engram row: {}", e),
        }
    }

    Ok(notes)
}
