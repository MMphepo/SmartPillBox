import os

from dotenv import load_dotenv
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    Text,
)
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured. "
        "Add your Neon PostgreSQL connection string to .env"
    )

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1
    )


# ==========================================
# DATABASE ENGINE
# ==========================================

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
    )


# ==========================================
# SESSION
# ==========================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ==========================================
# BASE MODEL
# ==========================================

Base = declarative_base()


# ==========================================
# EVENTS TABLE
# ==========================================

class Event(Base):

    __tablename__ = "pillbox_events"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    device_id = Column(
        String(100),
        nullable=False,
        index=True,
    )

    event = Column(
        String(100),
        nullable=False,
        index=True,
    )

    status = Column(
        String(50),
        nullable=True,
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    details = Column(
        Text,
        nullable=True,
    )


# ==========================================
# INITIALIZE DATABASE
# ==========================================

def init_db():

    print("Checking database tables...")

    Base.metadata.create_all(
        bind=engine
    )

    print("Database tables are ready.")