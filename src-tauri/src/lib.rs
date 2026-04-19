mod engram;

use engram::{engram_list_projects, engram_read_notes, engram_validate_db};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Workaround for WebKitGTK DMABUF renderer crash on Wayland
    // (https://bugs.webkit.org/show_bug.cgi?id=261874). Must be set
    // before the webview initializes.
    #[cfg(target_os = "linux")]
    // SAFETY: called at process start before any threads spawn.
    unsafe {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            engram_validate_db,
            engram_list_projects,
            engram_read_notes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
