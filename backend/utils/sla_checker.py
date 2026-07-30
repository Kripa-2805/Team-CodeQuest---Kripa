from datetime import datetime
from models import db
from models.issue import Issue
from models.status_log import StatusLog


def check_and_escalate_issues(system_user_id=None):
    """
    Scans all pending/in_progress issues.
    If sla_deadline has passed, marks them as 'escalated' and logs it.

    system_user_id: the user id to attribute the auto-escalation change to.
                     If None, we just skip logging the 'changed_by' with a valid FK
                     (falls back to the issue creator's id).

    Returns list of escalated issue ids.
    """
    now = datetime.utcnow()
    overdue_issues = Issue.query.filter(
        Issue.status.in_(['pending', 'in_progress']),
        Issue.sla_deadline < now
    ).all()

    escalated_ids = []

    for issue in overdue_issues:
        old_status = issue.status
        issue.status = 'escalated'

        actor_id = system_user_id or issue.created_by

        log = StatusLog(
            issue_id=issue.id,
            old_status=old_status,
            new_status='escalated',
            changed_by=actor_id,
            remark='Auto-escalated: SLA deadline exceeded'
        )
        db.session.add(log)
        escalated_ids.append(issue.id)

    if escalated_ids:
        db.session.commit()

    return escalated_ids
