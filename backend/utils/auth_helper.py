from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request


def role_required(*allowed_roles):
    """
    Decorator to restrict a route to specific roles.
    Usage: @role_required('admin', 'superadmin')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get('role')
            if role not in allowed_roles:
                return jsonify({
                    'error': f'Access denied. Requires one of roles: {", ".join(allowed_roles)}'
                }), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
