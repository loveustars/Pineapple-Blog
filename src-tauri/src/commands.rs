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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileToWrite {
    pub path: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlogInitResult {
    pub success: bool,
    pub files_created: Vec<String>,
    pub errors: Vec<String>,
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

    // Always use Hugo as the engine
    let engine = EngineType::Hugo;

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
pub async fn read_file(file_path: String) -> Result<String, String> {
    fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub async fn save_file(file_path: String, content: String) -> Result<(), String> {
    fs::write(&file_path, content)
        .map_err(|e| format!("Failed to save file: {}", e))
}

#[tauri::command]
pub async fn list_posts(
    project_path: String,
    _engine: EngineType,
) -> Result<Vec<PostInfo>, String> {
    let path = PathBuf::from(&project_path);
    // Hugo uses content directory
    let content_dir = path.join("content");

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

/// 初始化博客项目 - 批量写入多个文件
#[tauri::command]
pub async fn init_blog(
    project_path: String,
    files: Vec<FileToWrite>,
) -> Result<BlogInitResult, String> {
    let base_path = PathBuf::from(&project_path);
    let mut files_created = Vec::new();
    let mut errors = Vec::new();

    // 确保基础目录存在
    if !base_path.exists() {
        if let Err(e) = fs::create_dir_all(&base_path) {
            return Err(format!("无法创建项目目录: {}", e));
        }
    }

    for file in files {
        let file_path = base_path.join(&file.path);
        
        // 确保父目录存在
        if let Some(parent) = file_path.parent() {
            if !parent.exists() {
                if let Err(e) = fs::create_dir_all(parent) {
                    errors.push(format!("创建目录失败 {}: {}", parent.display(), e));
                    continue;
                }
            }
        }

        // 写入文件
        match fs::write(&file_path, &file.content) {
            Ok(_) => {
                files_created.push(file.path);
            }
            Err(e) => {
                errors.push(format!("写入文件失败 {}: {}", file.path, e));
            }
        }
    }

    Ok(BlogInitResult {
        success: errors.is_empty(),
        files_created,
        errors,
    })
}

/// 检查目录是否存在
#[tauri::command]
pub async fn check_directory_exists(path: String) -> Result<bool, String> {
    let dir_path = PathBuf::from(&path);
    Ok(dir_path.exists() && dir_path.is_dir())
}

/// 创建目录
#[tauri::command]
pub async fn create_directory(path: String) -> Result<(), String> {
    let dir_path = PathBuf::from(&path);
    fs::create_dir_all(&dir_path)
        .map_err(|e| format!("创建目录失败: {}", e))
}

#[derive(Debug, Serialize)]
pub struct BuildSiteResult {
    pub success: bool,
    pub output: String,
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ServeSiteResult {
    pub success: bool,
    pub url: Option<String>,
    pub error: Option<String>,
}

/// 构建网站（简化版本）
#[tauri::command]
pub async fn build_site(
    project_path: String,
    engine_type: String,
) -> Result<BuildSiteResult, String> {
    let path = PathBuf::from(&project_path);
    
    // 只支持 Hugo
    let engine = EngineType::Hugo;
    
    let engine_adapter = create_engine(engine).map_err(|e| e.to_string())?;
    
    let options = BuildOptions {
        minify: false,
        clean: true,
        draft: true,
    };
    
    match engine_adapter.build(&path, &options).await {
        Ok(result) => Ok(BuildSiteResult {
            success: result.success,
            output: result.output,
            error: if result.errors.is_empty() {
                None
            } else {
                Some(result.errors.join("\n"))
            },
        }),
        Err(e) => Ok(BuildSiteResult {
            success: false,
            output: String::new(),
            error: Some(e.to_string()),
        }),
    }
}

/// 预览网站
#[tauri::command]
pub async fn serve_site(
    project_path: String,
    engine_type: String,
    port: u16,
) -> Result<ServeSiteResult, String> {
    let path = PathBuf::from(&project_path);
    
    // 只支持 Hugo
    let engine = EngineType::Hugo;
    
    let engine_adapter = create_engine(engine).map_err(|e| e.to_string())?;
    
    match engine_adapter.serve(&path, port).await {
        Ok(_) => Ok(ServeSiteResult {
            success: true,
            url: Some(format!("http://127.0.0.1:{}", port)),
            error: None,
        }),
        Err(e) => Ok(ServeSiteResult {
            success: false,
            url: None,
            error: Some(e.to_string()),
        }),
    }
}

/// 停止预览服务器
#[tauri::command]
pub async fn stop_serve(_project_path: String) -> Result<(), String> {
    // 在Windows上，我们需要终止hugo进程
    // 这是一个简化实现，实际中可能需要跟踪进程ID
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("taskkill")
            .args(&["/F", "/IM", "hugo.exe"])
            .output();
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = std::process::Command::new("pkill")
            .args(&["-f", "hugo server"])
            .output();
    }
    Ok(())
}

/// 检查路径是否存在
#[tauri::command]
pub async fn check_path_exists(path: String) -> Result<bool, String> {
    let p = PathBuf::from(&path);
    Ok(p.exists())
}

/// 删除文章
#[tauri::command]
pub async fn delete_post(file_path: String) -> Result<(), String> {
    let path = PathBuf::from(&file_path);
    
    if !path.exists() {
        return Err("文件不存在".to_string());
    }
    
    // 检查是否是 markdown 文件
    if path.extension().map(|e| e != "md").unwrap_or(true) {
        return Err("只能删除 Markdown 文件".to_string());
    }
    
    fs::remove_file(&path)
        .map_err(|e| format!("删除文件失败: {}", e))?;
    
    Ok(())
}
