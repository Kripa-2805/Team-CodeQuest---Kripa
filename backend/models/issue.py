from datetime import datetime, timedelta
from models import db


class Issue(db.Model):
    __tablename__ = 'issues'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)

    # electrical | plumbing | it | hostel | furniture | other
    category = db.Column(db.String(50), nullable=False, default='other')

    attachment_url = db.Column(db.String(255), nullable=True)

    # pending | in_progress | resolved | escalated
    status = db.Column(db.String(20), nullable=False, default='pending')

    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sla_deadline = db.Column(db.DateTime, nullable=False)

    logs = db.relationship(
        'StatusLog', backref='issue', lazy=True,
        cascade='all, delete-orphan', order_by='StatusLog.timestamp'
    )

    def __init__(self, **kwargs):
        sla_hours = kwargs.pop('sla_hours', 24)
        super().__init__(**kwargs)
        if not self.sla_deadline:
            self.sla_deadline = datetime.utcnow() + timedelta(hours=sla_hours)

    student_name = db.Column(db.String(120))
    reg_no = db.Column(db.String(50))
    block_no = db.Column(db.String(50))
    location_type = db.Column(db.String(30))

    
    def is_overdue(self):
        return (
            self.status in ('pending', 'in_progress')
            and datetime.utcnow() > self.sla_deadline
        )

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'attachment_url': self.attachment_url,
            'status': self.status,
            'created_by': self.created_by,
            'creator_name': self.creator.name if self.creator else None,
            'assigned_to': self.assigned_to,
            'assignee_name': self.assignee.name if self.assignee else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'sla_deadline': self.sla_deadline.isoformat() if self.sla_deadline else None,
            'is_overdue': self.is_overdue()
        }
