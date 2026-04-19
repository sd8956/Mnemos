import { invoke } from "@tauri-apps/api/core";
import type {
  CanvasPosition,
  Category,
  Note,
  NoteCategory,
  Section,
} from "../types";

const ACCENT_CYCLE = [
  "#7aa2f7",
  "#bb9af7",
  "#7dcfff",
  "#9ece6a",
  "#ff9e64",
  "#f7768e",
];

const GRID_COLS = 3;
const GRID_X = 400;
const GRID_Y = 350;

type EngramProject = {
  id: string;
  name: string;
  scope: "project" | "personal";
  note_count: number;
  last_modified: string | null;
};

type EngramNote = {
  id: string;
  project_id: string;
  title: string;
  content: string;
  type: string | null;
  topic_key: string | null;
  created_at: string;
  updated_at: string;
};

type EngramDbInfo = {
  exists: boolean;
  readable: boolean;
  project_count: number;
  total_observations: number;
  error: string | null;
};

export async function validateEngramDb(dbPath: string): Promise<EngramDbInfo> {
  return invoke<EngramDbInfo>("engram_validate_db", { dbPath });
}

async function listProjects(dbPath: string): Promise<EngramProject[]> {
  return invoke<EngramProject[]>("engram_list_projects", { dbPath });
}

async function readNotes(
  dbPath: string,
  project: string,
  scope: string,
): Promise<EngramNote[]> {
  return invoke<EngramNote[]>("engram_read_notes", {
    dbPath,
    project,
    scope,
  });
}

function toNoteCategory(kind: string | null): NoteCategory | undefined {
  if (!kind) return undefined;
  const allowed: NoteCategory[] = [
    "logic",
    "data",
    "ui",
    "issues",
    "config",
    "architecture",
    "bugfix",
    "decision",
    "discovery",
    "learning",
    "pattern",
    "manual",
    "session_summary",
  ];
  return (allowed as string[]).includes(kind)
    ? (kind as NoteCategory)
    : undefined;
}

function buildTags(kind: string | null, topicKey: string | null): string[] {
  const tags: string[] = [];
  if (topicKey) tags.push(`#${topicKey}`);
  if (kind && !toNoteCategory(kind)) tags.push(`#${kind}`);
  return tags;
}

export async function loadEngramSection(
  dbPath: string,
  savedPositions: Record<string, CanvasPosition> = {},
): Promise<Section> {
  const projects = await listProjects(dbPath);

  const categories: Category[] = [];
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const notes = await readNotes(
      dbPath,
      project.scope === "personal" ? project.id : project.name,
      project.scope,
    );

    const categoryKey =
      project.scope === "personal" ? "personal" : project.name;
    const categoryId = `engram:${categoryKey}`;
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const defaultPosition = {
      x: 100 + col * GRID_X,
      y: 100 + row * GRID_Y,
    };
    const position = savedPositions[categoryId] ?? defaultPosition;

    const mappedNotes: Note[] = notes.map((n) => ({
      id: `engram_note_${n.id}`,
      categoryId,
      title: n.title,
      content: n.content,
      tags: buildTags(n.type, n.topic_key),
      type: toNoteCategory(n.type),
      createdAt: n.created_at,
      updatedAt: n.updated_at,
      source: "engram",
    }));

    categories.push({
      id: categoryId,
      sectionId: "engram",
      name: project.name,
      accentColor: ACCENT_CYCLE[i % ACCENT_CYCLE.length],
      position,
      notes: mappedNotes,
    });
  }

  return {
    id: "engram",
    name: "Engram",
    type: "engram",
    readOnly: true,
    categories,
  };
}
