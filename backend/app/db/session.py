"""
Database session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings


# Normalize database URL (e.g. Supabase postgres:// -> postgresql://)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Create engine with appropriate pooling and connection arguments
connect_args = {}
engine_kwargs = {"echo": settings.DEBUG}

if "sqlite" in db_url:
    connect_args["check_same_thread"] = False
else:
    # Supabase / PostgreSQL configuration
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all database tables."""
    from app.models.base import Base
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """Drop all database tables."""
    from app.models.base import Base
    Base.metadata.drop_all(bind=engine)
