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
        // 根据项目结构确定文章目录
        // 优先检查是否存在 content/posts/ 或 content/post/ 目录
        let content_dir = path.join("content");
        let posts_dir = if content_dir.join("posts").exists() {
            content_dir.join("posts")
        } else if content_dir.join("post").exists() {
            content_dir.join("post")
        } else {
            // 默认创建 content/posts/ 目录
            let posts = content_dir.join("posts");
            std::fs::create_dir_all(&posts).map_err(|e| AppError::EngineError(e.to_string()))?;
            posts
        };
        
        // 生成文件名
        let filename = format!("{}.md", title.replace(" ", "-").to_lowercase());
        let file_path = posts_dir.join(&filename);
        
        // 检查文件是否已存在
        if file_path.exists() {
            return Err(AppError::EngineError(format!("文件已存在: {}", file_path.display())));
        }
        
        // 生成 Front Matter（使用 YAML 格式，与大多数主题兼容）
        let now = chrono::Local::now();
        let date_str = now.format("%Y-%m-%dT%H:%M:%S%:z").to_string();
        
        let content = format!(
r#"---
title: "{}"
date: {}
draft: true
tags: []
categories: []
---

在这里开始写作...
"#, title, date_str);
        
        // 写入文件
        std::fs::write(&file_path, content).map_err(|e| AppError::EngineError(e.to_string()))?;
        
        // 返回相对路径
        let relative_path = file_path.strip_prefix(path)
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|_| file_path.to_string_lossy().to_string());
        
        Ok(relative_path)
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
