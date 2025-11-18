// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod engine;
mod error;
mod models;
mod utils;

use commands::*;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            create_project,
            open_project,
            build_project,
            serve_project,
            create_post,
            get_engine_version,
            list_posts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
