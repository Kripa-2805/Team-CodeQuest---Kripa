import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))


def _normalize_db_url(url):
    # Render (and some other providers) give a URL starting with "postgres://",
    # but modern SQLAlchemy requires "postgresql://". Auto-fix it here.
    if url and url.startswith('postgres://'):
        return url.replace('postgres://', 'postgresql://', 1)
    return url


class Config:
    # General
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-this')

    # Database
    SQLALCHEMY_DATABASE_URI = _normalize_db_url(os.environ.get(
        'DATABASE_URL',
        'sqlite:///' + os.path.join(basedir, 'database', 'app.db')
    ))
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret-change-this')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)

    # File uploads
    UPLOAD_FOLDER = os.path.join(basedir, 'static', 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB max upload size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

    # SLA - hours after which a pending/in_progress issue gets auto-escalated
    SLA_HOURS = int(os.environ.get('SLA_HOURS', 24))
