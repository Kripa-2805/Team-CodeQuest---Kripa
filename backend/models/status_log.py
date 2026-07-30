from datetime import datetime
from models import db


class StatusLog(db.Model):
    __tablename__ = 'status_logs'

    id = db.Column(db.Integer, primary_key=True)
    issue_id = db.Column(db.Integer, db.ForeignKey('issues.id'), nullable=False)

    old_status = db.Column(db.String(20), nullable=True)
    new_status = db.Column(db.String(20), nullable=False)

    changed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    remark = db.Column(db.String(255), nullable=True)

    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    changer = db.relationship('User', foreign_keys=[changed_by])

    def to_dict(self):
        return {
            'id': self.id,
            'issue_id': self.issue_id,
            'old_status': self.old_status,
            'new_status': self.new_status,
            'changed_by': self.changed_by,
            'changed_by_name': self.changer.name if self.changer else None,
            'remark': self.remark,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
