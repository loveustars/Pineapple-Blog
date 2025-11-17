use std::path::{Path, PathBuf};
use std::process::{Command, Output, Stdio};
use crate::error::{AppError, Result};

pub fn get_hugo_binary_path() -> Result<PathBuf> {
    #[cfg(target_os = "windows")]
    let binary_name = "hugo.exe";
    
    #[cfg(target_os = "macos")]
    let binary_name = "hugo";
    
    #[cfg(target_os = "linux")]
    let binary_name = "hugo";

    // Try to find Hugo in PATH
    if let Ok(output) = Command::new("which").arg("hugo").output() {
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            return Ok(PathBuf::from(path));
        }
    }

    // Fallback to bundled binary (not implemented in this example)
    Err(AppError::EngineError(
        "Hugo binary not found. Please install Hugo.".to_string(),
    ))
}

pub fn get_zola_binary_path() -> Result<PathBuf> {
    #[cfg(target_os = "windows")]
    let binary_name = "zola.exe";
    
    #[cfg(target_os = "macos")]
    let binary_name = "zola";
    
    #[cfg(target_os = "linux")]
    let binary_name = "zola";

    // Try to find Zola in PATH
    if let Ok(output) = Command::new("which").arg("zola").output() {
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            return Ok(PathBuf::from(path));
        }
    }

    Err(AppError::EngineError(
        "Zola binary not found. Please install Zola.".to_string(),
    ))
}

pub fn validate_path(path: &Path) -> Result<PathBuf> {
    let canonical = path
        .canonicalize()
        .map_err(|_| AppError::InvalidPath(path.display().to_string()))?;

    if !canonical.exists() {
        return Err(AppError::PathNotFound(canonical.display().to_string()));
    }

    Ok(canonical)
}

pub fn ensure_directory_exists(path: &Path) -> Result<()> {
    if !path.exists() {
        std::fs::create_dir_all(path)
            .map_err(|e| AppError::FileOperationFailed(e.to_string()))?;
    }
    Ok(())
}

pub async fn execute_command(
    program: &Path,
    args: &[&str],
    working_dir: &Path,
) -> Result<Output> {
    let output = Command::new(program)
        .args(args)
        .current_dir(working_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| AppError::EngineError(e.to_string()))?;

    Ok(output)
}
