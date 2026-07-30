from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from models import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # 'student' | 'admin' | 'superadmin'
    role = db.Column(db.String(20), nullable=False, default='student')
    department = db.Column(db.String(100), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    issues_created = db.relationship(
        'Issue', foreign_keys='Issue.created_by', backref='creator', lazy=True
    )
    issues_assigned = db.relationship(
        'Issue', foreign_keys='Issue.assigned_to', backref='assignee', lazy=True
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'department': self.department,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
