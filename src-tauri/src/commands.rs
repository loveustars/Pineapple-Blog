use std::path::PathBuf;
use std::fs;
use crate::engine::create_engine;
use crate::models::{BuildOptions, BuildResult, EngineType, Project, Post};
use crate::utils::{ensure_directory_exists, validate_path};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostInfo {
    pub title: String,
    pub path: String,
    pub date: Option<String>,
}

#[tauri::command]
pub async fn create_project(
    name: String,
    path: String,
    engine: EngineType,
) -> Result<Project, String> {
    let project_path = PathBuf::from(&path);
    
    // Ensure parent directory exists
    if let Some(parent) = project_path.parent() {
        ensure_directory_exists(parent).map_err(|e| e.to_string())?;
    }

    // Create engine adapter
    let engine_adapter = create_engine(engine.clone()).map_err(|e| e.to_string())?;

    // Initialize the site
    let site_path = if let Some(parent) = project_path.parent() {
        engine_adapter
            .init(parent, &name)
            .await
            .map_err(|e| e.to_string())?;
        parent.join(&name)
    } else {
        project_path.clone()
    };

    // Create project model
    let project = Project::new(name, site_path, engine);

    Ok(project)
}

#[tauri::command]
pub async fn open_project(path: String) -> Result<Project, String> {
    let project_path = PathBuf::from(&path);
    let validated_path = validate_path(&project_path).map_err(|e| e.to_string())?;

    // Detect engine type by checking config files
    let engine = if validated_path.join("config.toml").exists()
        || validated_path.join("config.yaml").exists()
        || validated_path.join("hugo.toml").exists()
    {
        EngineType::Hugo
    } else if validated_path.join("config.toml").exists() {
        // Zola also uses config.toml, need better detection
        EngineType::Zola
    } else {
        return Err("Unable to detect project type".to_string());
    };

    let name = validated_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Unknown")
        .to_string();

    let project = Project::new(name, validated_path, engine);

    Ok(project)
}

#[tauri::command]
pub async fn build_project(
    project_path: String,
    engine: EngineType,
    options: BuildOptions,
) -> Result<BuildResult, String> {
    let path = PathBuf::from(&project_path);
    let engine_adapter = create_engine(engine).map_err(|e| e.to_string())?;

    let result = engine_adapter
        .build(&path, &options)
        .await
        .map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub async fn serve_project(
    project_path: String,
    engine: EngineType,
    port: u16,
) -> Result<(), String> {
    let path = PathBuf::from(&project_path);
    let engine_adapter = create_engine(engine).map_err(|e| e.to_string())?;

    engine_adapter
        .serve(&path, port)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn create_post(
    project_path: String,
    engine: EngineType,
    title: String,
) -> Result<String, String> {
    let path = PathBuf::from(&project_path);
    let engine_adapter = create_engine(engine).map_err(|e| e.to_string())?;

    let post_path = engine_adapter
        .new_post(&path, &title)
        .await
        .map_err(|e| e.to_string())?;

    Ok(post_path)
}

#[tauri::command]
pub async fn get_engine_version(engine: EngineType) -> Result<String, String> {
    let engine_adapter = create_engine(engine).map_err(|e| e.to_string())?;
    let version = engine_adapter.version().map_err(|e| e.to_string())?;
    Ok(version)
}

#[tauri::command]
pub async fn list_posts(
    project_path: String,
    engine: EngineType,
) -> Result<Vec<PostInfo>, String> {
    let path = PathBuf::from(&project_path);
    let content_dir = match engine {
        EngineType::Hugo => path.join("content"),
        EngineType::Zola => path.join("content"),
    };

    if !content_dir.exists() {
        return Ok(vec![]);
    }

    let mut posts = Vec::new();
    
    // Recursively scan for markdown files
    fn scan_dir(dir: &PathBuf, posts: &mut Vec<PostInfo>) -> Result<(), String> {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    scan_dir(&path, posts)?;
                } else if let Some(ext) = path.extension() {
                    if ext == "md" || ext == "markdown" {
                        if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                            // Skip _index.md files
                            if file_name.starts_with('_') {
                                continue;
                            }
                            
                            let title = file_name
                                .trim_end_matches(".md")
                                .trim_end_matches(".markdown")
                                .replace('-', " ")
                                .replace('_', " ");
                            
                            posts.push(PostInfo {
                                title,
                                path: path.to_string_lossy().to_string(),
                                date: None,
                            });
                        }
                    }
                }
            }
        }
        Ok(())
    }

    scan_dir(&content_dir, &mut posts)?;
    
    // Sort by path (newest first, assuming date-based naming)
    posts.sort_by(|a, b| b.path.cmp(&a.path));
    
    Ok(posts)
}
