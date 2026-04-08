#!/usr/bin/python3
"""
Module handling file upload for place photos
"""

import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_file(file):
    from flask import request as flask_request
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    base = flask_request.host_url.rstrip('/')
    return f'{base}/uploads/{filename}'


@upload_bp.route('/api/v1/upload', methods=['POST'])
@jwt_required()
def upload_photos():
    files = request.files.getlist('photos[]')

    if not files or all(f.filename == '' for f in files):
        return jsonify({'error': 'No files provided'}), 400

    urls = []
    for file in files:
        if file and file.filename != '' and allowed_file(file.filename):
            urls.append(save_file(file))

    if not urls:
        return jsonify({'error': 'No valid files'}), 400

    return jsonify({'photo_urls': urls}), 201
