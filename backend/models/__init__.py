from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models so they're registered with SQLAlchemy metadata
from models.user import User        # noqa: E402, F401
from models.issue import Issue      # noqa: E402, F401
from models.status_log import StatusLog  # noqa: E402, F401
