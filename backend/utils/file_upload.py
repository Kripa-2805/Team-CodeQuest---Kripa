import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app


def allowed_file(filename):
    return (
        '.' in filename and
        filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']
    )


def save_attachment(file_storage):
    """
    Saves an uploaded file with a unique name.
    Returns the relative URL path to store in DB, or None if invalid/no file.
    """
    if not file_storage or file_storage.filename == '':
        return None

    if not allowed_file(file_storage.filename):
        raise ValueError('File type not allowed')

    original_name = secure_filename(file_storage.filename)
    ext = original_name.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"

    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)

    filepath = os.path.join(upload_folder, unique_name)
    file_storage.save(filepath)

    # Relative URL served via /static/uploads/<filename>
    return f"/static/uploads/{unique_name}"
