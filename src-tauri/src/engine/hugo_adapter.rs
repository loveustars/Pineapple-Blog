use async_trait::async_trait;
use std::path::{Path, PathBuf};
use std::time::Instant;
use crate::engine::traits::SiteEngine;
use crate::error::{AppError, Result};
use crate::models::{BuildOptions, BuildResult, EngineType};
use crate::utils::{get_hugo_binary_path, execute_command};

pub struct HugoAdapter {
    binary_path: PathBuf,
}

impl HugoAdapter {
    pub fn new() -> Result<Self> {
        let binary_path = get_hugo_binary_path()?;
        Ok(Self { binary_path })
    }
}

#[async_trait]
impl SiteEngine for HugoAdapter {
    fn engine_type(&self) -> EngineType {
        EngineType::Hugo
    }

    async fn init(&self, path: &Path, site_name: &str) -> Result<()> {
        let output = execute_command(
            &self.binary_path,
            &["new", "site", site_name, "--force"],
            path,
        )
        .await?;

        if !output.status.success() {
            return Err(AppError::EngineError(
                String::from_utf8_lossy(&output.stderr).to_string(),
            ));
        }

        Ok(())
    }

    async fn build(&self, path: &Path, options: &BuildOptions) -> Result<BuildResult> {
        let start = Instant::now();
        let mut args = vec![];

        if options.minify {
            args.push("--minify");
        }
        if options.clean {
            args.push("--gc");
        }
        if options.draft {
            args.push("-D");
        }

        let output = execute_command(&self.binary_path, &args, path).await?;

        let duration = start.elapsed().as_secs_f64();
        let success = output.status.success();
        let output_str = String::from_utf8_lossy(&output.stdout).to_string();
        let errors = if !success {
            vec![String::from_utf8_lossy(&output.stderr).to_string()]
        } else {
            vec![]
        };

        Ok(BuildResult {
            success,
            duration,
            output: output_str,
            errors,
        })
    }

    async fn serve(&self, path: &Path, port: u16) -> Result<()> {
        use std::process::Command;

        Command::new(&self.binary_path)
            .args(&[
                "server",
                "-D",
                "--bind",
                "127.0.0.1",
                "--port",
                &port.to_string(),
                "--navigateToChanged",
            ])
            .current_dir(path)
            .spawn()
            .map_err(|e| AppError::EngineError(e.to_string()))?;

        Ok(())
    }

    async fn new_post(&self, path: &Path, title: &str) -> Result<String> {
        let post_path = format!("content/posts/{}.md", title.replace(" ", "-").to_lowercase());
        
        let output = execute_command(
            &self.binary_path,
            &["new", &post_path],
            path,
        )
        .await?;

        if !output.status.success() {
            return Err(AppError::EngineError(
                String::from_utf8_lossy(&output.stderr).to_string(),
            ));
        }

        Ok(post_path)
    }

    fn version(&self) -> Result<String> {
        let output = std::process::Command::new(&self.binary_path)
            .arg("version")
            .output()
            .map_err(|e| AppError::EngineError(e.to_string()))?;

        Ok(String::from_utf8_lossy(&output.stdout)
            .lines()
            .next()
            .unwrap_or("unknown")
            .to_string())
    }
}
