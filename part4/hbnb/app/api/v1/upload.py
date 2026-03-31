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


@upload_bp.route('/api/v1/upload', methods=['POST'])
@jwt_required()
def upload_photo():
    if 'photo' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['photo']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    return jsonify({'photo_url': f'http://127.0.0.1:8000/uploads/{filename}'}), 201
