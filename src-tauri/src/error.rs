use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Path not found: {0}")]
    PathNotFound(String),

    #[error("Invalid path: {0}")]
    InvalidPath(String),

    #[error("Project already exists: {0}")]
    ProjectExists(String),

    #[error("Engine error: {0}")]
    EngineError(String),

    #[error("Build failed: {0}")]
    BuildFailed(String),

    #[error("File operation failed: {0}")]
    FileOperationFailed(String),

    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),

    #[error("Database error: {0}")]
    DatabaseError(String),
}

pub type Result<T> = std::result::Result<T, AppError>;

// Convert AppError to String for Tauri
impl From<AppError> for String {
    fn from(error: AppError) -> Self {
        error.to_string()
    }
}
