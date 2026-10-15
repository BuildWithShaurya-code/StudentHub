import os
from pathlib import Path
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Explicitly load .env file from backend/ or workspace root
backend_dir = Path(__file__).resolve().parent
env_candidates = [
    backend_dir / '.env',
    backend_dir.parent / '.env',
]

for env_path in env_candidates:
    if env_path.is_file():
        load_dotenv(dotenv_path=env_path, override=False)
        break


class Config:
    """Base application configuration loaded strictly from environment variables."""

    DB_HOST = os.getenv('DB_HOST', '127.0.0.1').strip()
    DB_PORT = int(os.getenv('DB_PORT', '3306').strip() or 3306)
    DB_NAME = os.getenv('DB_NAME', 'studenthub_db').strip()
    DB_USER = os.getenv('DB_USER', 'root').strip()
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')

    FLASK_PORT = int(os.getenv('FLASK_PORT', '5001').strip() or 5001)
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() in ('true', '1', 'yes')
    FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN', 'http://localhost:3000').strip()

    # Construct SQLAlchemy Database URI with URL-encoded credentials
    encoded_user = quote_plus(DB_USER)
    encoded_password = quote_plus(DB_PASSWORD)
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{encoded_user}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,
        'pool_pre_ping': True,
        'connect_args': {'connect_timeout': 5},
    }

    @classmethod
    def safe_db_summary(cls):
        """Returns safe connection summary with password masked."""
        masked_pwd = '****' if cls.DB_PASSWORD else '(empty)'
        return f"mysql+pymysql://{cls.DB_USER}:{masked_pwd}@{cls.DB_HOST}:{cls.DB_PORT}/{cls.DB_NAME}"
