from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from models import db
from models.issue import Issue
from models.status_log import StatusLog
from utils.file_upload import save_attachment
from utils.sla_checker import check_and_escalate_issues

issue_bp = Blueprint('issues', __name__)

VALID_CATEGORIES = {'electrical', 'plumbing', 'it', 'hostel', 'furniture', 'other'}
VALID_STATUSES = {'pending', 'in_progress', 'resolved', 'escalated'}


@issue_bp.route('/issues', methods=['POST'])
@jwt_required()
def create_issue():
    user_id = int(get_jwt_identity())

    # Support both JSON and multipart/form-data (for file upload)
    if request.content_type and 'multipart/form-data' in request.content_type:
        title = request.form.get('title')
        description = request.form.get('description')
        category = request.form.get('category', 'other')
        file_storage = request.files.get('attachment')
    else:
        data = request.get_json(silent=True) or {}
        title = data.get('title')
        description = data.get('description')
        category = data.get('category', 'other')
        file_storage = None

    if not title or not description:
        return jsonify({'error': 'title and description are required'}), 400

    if category not in VALID_CATEGORIES:
        category = 'other'

    attachment_url = None
    if file_storage:
        try:
            attachment_url = save_attachment(file_storage)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    sla_hours = current_app.config.get('SLA_HOURS', 24)

    issue = Issue(
        title=title,
        description=description,
        category=category,
        attachment_url=attachment_url,
        created_by=user_id,
        sla_hours=sla_hours
    )
    db.session.add(issue)
    db.session.flush()  # get issue.id before commit

    log = StatusLog(
        issue_id=issue.id,
        old_status=None,
        new_status='pending',
        changed_by=user_id,
        remark='Issue created'
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({'message': 'Issue created', 'issue': issue.to_dict()}), 201


@issue_bp.route('/issues', methods=['GET'])
@jwt_required()
def get_issues():
    """
    Students see only their own issues.
    Admin/superadmin see all issues.
    Optional query params: status, category
    """
    # Run SLA check first so lists are always fresh
    check_and_escalate_issues()

    claims = get_jwt()
    role = claims.get('role')
    user_id = int(get_jwt_identity())

    query = Issue.query

    if role == 'student':
        query = query.filter_by(created_by=user_id)

    status_filter = request.args.get('status')
    category_filter = request.args.get('category')

    if status_filter and status_filter in VALID_STATUSES:
        query = query.filter_by(status=status_filter)

    if category_filter and category_filter in VALID_CATEGORIES:
        query = query.filter_by(category=category_filter)

    issues = query.order_by(Issue.created_at.desc()).all()

    return jsonify({'issues': [i.to_dict() for i in issues]}), 200


@issue_bp.route('/issues/<int:issue_id>', methods=['GET'])
@jwt_required()
def get_issue_detail(issue_id):
    check_and_escalate_issues()

    claims = get_jwt()
    role = claims.get('role')
    user_id = int(get_jwt_identity())

    issue = Issue.query.get_or_404(issue_id)

    if role == 'student' and issue.created_by != user_id:
        return jsonify({'error': 'Access denied'}), 403

    issue_data = issue.to_dict()
    issue_data['logs'] = [log.to_dict() for log in issue.logs]

    return jsonify({'issue': issue_data}), 200


@issue_bp.route('/issues/<int:issue_id>/status', methods=['PUT'])
@jwt_required()
def update_status(issue_id):
    """
    Update issue status. Students can only cancel/reopen their own (optional),
    but primarily this is used by admin/staff. We keep it open to assigned staff too.
    """
    claims = get_jwt()
    role = claims.get('role')
    user_id = int(get_jwt_identity())

    issue = Issue.query.get_or_404(issue_id)

    data = request.get_json(silent=True) or {}
    new_status = data.get('status')
    remark = data.get('remark', '')

    if new_status not in VALID_STATUSES:
        return jsonify({'error': f'Invalid status. Must be one of {VALID_STATUSES}'}), 400

    # Only admin/superadmin or the assigned staff member can change status
    if role == 'student':
        return jsonify({'error': 'Students cannot update issue status'}), 403

    if role == 'admin' and issue.assigned_to not in (None, user_id):
        return jsonify({'error': 'You are not assigned to this issue'}), 403

    old_status = issue.status
    issue.status = new_status

    log = StatusLog(
        issue_id=issue.id,
        old_status=old_status,
        new_status=new_status,
        changed_by=user_id,
        remark=remark
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({'message': 'Status updated', 'issue': issue.to_dict()}), 200
