use async_trait::async_trait;
use std::path::{Path, PathBuf};
use std::time::Instant;
use crate::engine::traits::SiteEngine;
use crate::error::{AppError, Result};
use crate::models::{BuildOptions, BuildResult, EngineType};
use crate::utils::{get_zola_binary_path, execute_command};

pub struct ZolaAdapter {
    binary_path: PathBuf,
}

impl ZolaAdapter {
    pub fn new() -> Result<Self> {
        let binary_path = get_zola_binary_path()?;
        Ok(Self { binary_path })
    }
}

#[async_trait]
impl SiteEngine for ZolaAdapter {
    fn engine_type(&self) -> EngineType {
        EngineType::Zola
    }

    async fn init(&self, path: &Path, site_name: &str) -> Result<()> {
        let target_path = path.join(site_name);
        
        // Use --force to skip confirmation prompt
        let output = execute_command(
            &self.binary_path,
            &["init", "--force", site_name],
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
        let mut args = vec!["build"];

        if options.draft {
            args.push("--drafts");
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
                "serve",
                "--interface",
                "127.0.0.1",
                "--port",
                &port.to_string(),
                "--drafts",
            ])
            .current_dir(path)
            .spawn()
            .map_err(|e| AppError::EngineError(e.to_string()))?;

        Ok(())
    }

    async fn new_post(&self, path: &Path, title: &str) -> Result<String> {
        let post_filename = format!("{}.md", title.replace(" ", "-").to_lowercase());
        let post_path = path.join("content").join(&post_filename);
        
        let content = format!(
            r#"+++
title = "{}"
date = {}
draft = true

[taxonomies]
tags = []
categories = []
+++

Write your content here...
"#,
            title,
            chrono::Utc::now().to_rfc3339()
        );

        std::fs::write(&post_path, content)
            .map_err(|e| AppError::FileOperationFailed(e.to_string()))?;

        Ok(post_path.display().to_string())
    }

    fn version(&self) -> Result<String> {
        let output = std::process::Command::new(&self.binary_path)
            .arg("--version")
            .output()
            .map_err(|e| AppError::EngineError(e.to_string()))?;

        Ok(String::from_utf8_lossy(&output.stdout)
            .lines()
            .next()
            .unwrap_or("unknown")
            .to_string())
    }
}
