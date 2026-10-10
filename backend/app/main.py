"""
FinSense main application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.routes import health, upload, documents, invoices, suppliers, reminders, charts, export, demo, auth
from app.middleware.monitoring import MonitoringMiddleware
from app.core.database import create_tables


# Setup logging
setup_logging()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="FinSense AI-powered GST invoice intelligence backend",
    version="0.1.0",
    debug=settings.DEBUG
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add monitoring middleware
app.add_middleware(MonitoringMiddleware)

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(invoices.router, prefix="/api", tags=["invoices"])
app.include_router(suppliers.router, prefix="/api", tags=["suppliers"])
app.include_router(reminders.router, prefix="/api", tags=["reminders"])
app.include_router(charts.router, prefix="/api", tags=["charts"])
app.include_router(export.router, prefix="/api", tags=["export"])
app.include_router(demo.router, prefix="/api", tags=["demo"])


# Database and background task initialization on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables and workers on startup."""
    try:
        create_tables()
    except Exception as e:
        print(f"Warning: automatic table creation deferred: {e}")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to FinSense API",
        "version": "0.1.0",
        "status": "operational"
    }


# Monitoring endpoint
@app.get("/monitoring/metrics")
async def get_metrics():
    """Get current application metrics."""
    from app.services.monitoring_service import get_current_metrics
    return get_current_metrics()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )