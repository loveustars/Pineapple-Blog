pub mod traits;
pub mod hugo_adapter;

pub use traits::SiteEngine;
pub use hugo_adapter::HugoAdapter;

use crate::error::Result;
use crate::models::EngineType;
use std::sync::Arc;

pub fn create_engine(engine_type: EngineType) -> Result<Arc<dyn SiteEngine>> {
    match engine_type {
        EngineType::Hugo => Ok(Arc::new(HugoAdapter::new()?)),
    }
}
