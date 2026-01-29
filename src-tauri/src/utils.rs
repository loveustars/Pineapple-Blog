use std::path::{Path, PathBuf};
use std::process::{Command, Output, Stdio};
use std::env;
use crate::error::{AppError, Result};

pub fn get_hugo_binary_path() -> Result<PathBuf> {
    #[cfg(target_os = "windows")]
    let binary_name = "hugo.exe";
    
    #[cfg(not(target_os = "windows"))]
    let binary_name = "hugo";

    // 1. 首先检查应用程序目录下的 bin 文件夹
    if let Ok(exe_path) = env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            // 开发模式：检查项目根目录的 bin
            let dev_bin_path = exe_dir
                .ancestors()
                .find(|p| p.join("bin").join(binary_name).exists())
                .map(|p| p.join("bin").join(binary_name));
            
            if let Some(path) = dev_bin_path {
                if path.exists() {
                    return Ok(path);
                }
            }

            // 生产模式：检查应用程序同级的 bin 目录
            let prod_bin_path = exe_dir.join("bin").join(binary_name);
            if prod_bin_path.exists() {
                return Ok(prod_bin_path);
            }
        }
    }

    // 2. 检查当前工作目录的 bin 文件夹
    if let Ok(cwd) = env::current_dir() {
        let cwd_bin_path = cwd.join("bin").join(binary_name);
        if cwd_bin_path.exists() {
            return Ok(cwd_bin_path);
        }
    }

    // 3. 在 Windows 上使用 where 命令查找
    #[cfg(target_os = "windows")]
    {
        if let Ok(output) = Command::new("where").arg("hugo").output() {
            if output.status.success() {
                let path = String::from_utf8_lossy(&output.stdout)
                    .lines()
                    .next()
                    .unwrap_or("")
                    .trim()
                    .to_string();
                if !path.is_empty() {
                    return Ok(PathBuf::from(path));
                }
            }
        }
    }

    // 4. 在 Unix 系统上使用 which 命令
    #[cfg(not(target_os = "windows"))]
    {
        if let Ok(output) = Command::new("which").arg("hugo").output() {
            if output.status.success() {
                let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if !path.is_empty() {
                    return Ok(PathBuf::from(path));
                }
            }
        }
    }

    // 5. 检查常见安装路径
    #[cfg(target_os = "windows")]
    {
        let common_paths = [
            "C:\\Program Files\\Hugo\\hugo.exe",
            "C:\\Hugo\\hugo.exe",
        ];
        for path in common_paths {
            let p = PathBuf::from(path);
            if p.exists() {
                return Ok(p);
            }
        }
    }

    Err(AppError::EngineError(
        "Hugo binary not found. Please install Hugo or place hugo.exe in the bin folder.".to_string(),
    ))
}

pub fn get_zola_binary_path() -> Result<PathBuf> {
    #[cfg(target_os = "windows")]
    let binary_name = "zola.exe";
    
    #[cfg(not(target_os = "windows"))]
    let binary_name = "zola";

    // 1. 检查应用程序目录下的 bin 文件夹
    if let Ok(exe_path) = env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let dev_bin_path = exe_dir
                .ancestors()
                .find(|p| p.join("bin").join(binary_name).exists())
                .map(|p| p.join("bin").join(binary_name));
            
            if let Some(path) = dev_bin_path {
                if path.exists() {
                    return Ok(path);
                }
            }

            let prod_bin_path = exe_dir.join("bin").join(binary_name);
            if prod_bin_path.exists() {
                return Ok(prod_bin_path);
            }
        }
    }

    // 2. 检查当前工作目录的 bin 文件夹
    if let Ok(cwd) = env::current_dir() {
        let cwd_bin_path = cwd.join("bin").join(binary_name);
        if cwd_bin_path.exists() {
            return Ok(cwd_bin_path);
        }
    }

    // 3. 在系统 PATH 中查找
    #[cfg(target_os = "windows")]
    {
        if let Ok(output) = Command::new("where").arg("zola").output() {
            if output.status.success() {
                let path = String::from_utf8_lossy(&output.stdout)
                    .lines()
                    .next()
                    .unwrap_or("")
                    .trim()
                    .to_string();
                if !path.is_empty() {
                    return Ok(PathBuf::from(path));
                }
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        if let Ok(output) = Command::new("which").arg("zola").output() {
            if output.status.success() {
                let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if !path.is_empty() {
                    return Ok(PathBuf::from(path));
                }
            }
        }
    }

    Err(AppError::EngineError(
        "Zola binary not found. Please install Zola or place zola.exe in the bin folder.".to_string(),
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
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| AppError::EngineError(e.to_string()))?;

    Ok(output)
}
