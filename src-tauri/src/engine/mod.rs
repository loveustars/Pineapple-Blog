pub mod traits;
pub mod hugo_adapter;
pub mod zola_adapter;

pub use traits::SiteEngine;
pub use hugo_adapter::HugoAdapter;
pub use zola_adapter::ZolaAdapter;

use crate::error::Result;
use crate::models::EngineType;
use std::sync::Arc;

pub fn create_engine(engine_type: EngineType) -> Result<Arc<dyn SiteEngine>> {
    match engine_type {
        EngineType::Hugo => Ok(Arc::new(HugoAdapter::new()?)),
        EngineType::Zola => Ok(Arc::new(ZolaAdapter::new()?)),
    }
}
