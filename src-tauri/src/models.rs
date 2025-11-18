use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: PathBuf,
    pub engine: EngineType,
    pub theme: Option<String>,
    pub config: ProjectConfig,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EngineType {
    Hugo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectConfig {
    pub title: String,
    pub base_url: String,
    pub language: String,
    pub description: Option<String>,
}

impl Project {
    pub fn new(name: String, path: PathBuf, engine: EngineType) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.clone(),
            path,
            engine,
            theme: None,
            config: ProjectConfig {
                title: name,
                base_url: "http://localhost:1313".to_string(),
                language: "zh-CN".to_string(),
                description: None,
            },
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Post {
    pub title: String,
    pub path: PathBuf,
    pub content: String,
    pub front_matter: FrontMatter,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrontMatter {
    pub title: String,
    pub date: DateTime<Utc>,
    pub draft: bool,
    pub tags: Vec<String>,
    pub categories: Vec<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildOptions {
    pub minify: bool,
    pub clean: bool,
    pub draft: bool,
}

impl Default for BuildOptions {
    fn default() -> Self {
        Self {
            minify: true,
            clean: true,
            draft: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildResult {
    pub success: bool,
    pub duration: f64,
    pub output: String,
    pub errors: Vec<String>,
}
