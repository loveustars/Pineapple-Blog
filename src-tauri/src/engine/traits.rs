use async_trait::async_trait;
use std::path::Path;
use crate::error::Result;
use crate::models::{BuildOptions, BuildResult, EngineType};

#[async_trait]
pub trait SiteEngine: Send + Sync {
    fn engine_type(&self) -> EngineType;
    async fn init(&self, path: &Path, site_name: &str) -> Result<()>;
    async fn build(&self, path: &Path, options: &BuildOptions) -> Result<BuildResult>;
    async fn serve(&self, path: &Path, port: u16) -> Result<()>;
    async fn new_post(&self, path: &Path, title: &str) -> Result<String>;
    fn version(&self) -> Result<String>;
}
