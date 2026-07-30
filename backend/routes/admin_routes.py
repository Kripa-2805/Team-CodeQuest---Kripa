from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db
from models.issue import Issue
from models.status_log import StatusLog
from models.user import User
from utils.auth_helper import role_required
from utils.sla_checker import check_and_escalate_issues

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/issues/<int:issue_id>/assign', methods=['PUT'])
@jwt_required()
@role_required('admin', 'superadmin')
def assign_issue(issue_id):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    assignee_id = data.get('assigned_to')
    if not assignee_id:
        return jsonify({'error': 'assigned_to (staff user id) is required'}), 400

    staff = User.query.get(assignee_id)
    if not staff or staff.role not in ('admin', 'superadmin'):
        return jsonify({'error': 'Invalid staff user'}), 400

    issue = Issue.query.get_or_404(issue_id)
    issue.assigned_to = assignee_id

    old_status = issue.status
    if issue.status == 'pending':
        issue.status = 'in_progress'

    log = StatusLog(
        issue_id=issue.id,
        old_status=old_status,
        new_status=issue.status,
        changed_by=user_id,
        remark=f'Assigned to {staff.name}'
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({'message': 'Issue assigned', 'issue': issue.to_dict()}), 200


@admin_bp.route('/issues/escalated', methods=['GET'])
@jwt_required()
@role_required('admin', 'superadmin')
def get_escalated_issues():
    check_and_escalate_issues()

    issues = Issue.query.filter_by(status='escalated') \
        .order_by(Issue.sla_deadline.asc()).all()

    return jsonify({'issues': [i.to_dict() for i in issues]}), 200


@admin_bp.route('/staff', methods=['GET'])
@jwt_required()
@role_required('admin', 'superadmin')
def get_staff_list():
    staff = User.query.filter(User.role.in_(['admin', 'superadmin'])).all()
    return jsonify({'staff': [s.to_dict() for s in staff]}), 200


@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@role_required('admin', 'superadmin')
def get_stats():
    """Quick counts for dashboard charts (Recharts on the frontend)."""
    check_and_escalate_issues()

    total = Issue.query.count()
    pending = Issue.query.filter_by(status='pending').count()
    in_progress = Issue.query.filter_by(status='in_progress').count()
    resolved = Issue.query.filter_by(status='resolved').count()
    escalated = Issue.query.filter_by(status='escalated').count()

    category_counts = {}
    for cat, count in db.session.query(Issue.category, db.func.count(Issue.id)) \
            .group_by(Issue.category).all():
        category_counts[cat] = count

    return jsonify({
        'total': total,
        'by_status': {
            'pending': pending,
            'in_progress': in_progress,
            'resolved': resolved,
            'escalated': escalated
        },
        'by_category': category_counts
    }), 200
