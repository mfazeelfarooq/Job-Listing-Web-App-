from flask import Blueprint, request, jsonify
from .models import Job
from . import db, cache
from datetime import datetime
from sqlalchemy import or_
from functools import wraps
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

jobs_bp = Blueprint('jobs', __name__)

def cache_with_args(*args, **kwargs):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            cache_key = f"{request.path}?{request.query_string.decode()}"
            rv = cache.get(cache_key)
            if rv is not None:
                return rv
            rv = f(*args, **kwargs)
            cache.set(cache_key, rv, timeout=300)  # Cache for 5 minutes
            return rv
        return decorated_function
    return decorator

def handle_error(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}")
            return jsonify({'error': str(e)}), 500
    return decorated_function

@jobs_bp.route('/jobs', methods=['GET'])
@cache_with_args()
@handle_error
def get_jobs():
    # Get query parameters for filtering
    filters = {
        'title': request.args.get('title', ''),
        'company': request.args.get('company', ''),
        'location': request.args.get('location', ''),
        'job_type': request.args.get('job_type', ''),
        'tags': request.args.getlist('tags')
    }
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Get sort parameters
    sort_by = request.args.get('sort_by', 'posting_date')
    sort_order = request.args.get('sort_order', 'desc')
    
    # Validate sort_by parameter
    valid_sort_fields = ['posting_date', 'title', 'company']
    if sort_by not in valid_sort_fields:
        sort_by = 'posting_date'
    
    # Build and execute query
    query = Job.search(None, filters)
    
    # Apply sorting
    if sort_order == 'desc':
        query = query.order_by(getattr(Job, sort_by).desc())
    else:
        query = query.order_by(getattr(Job, sort_by).asc())
    
    # Apply pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    jobs = pagination.items
    
    return jsonify({
        'jobs': [job.to_dict() for job in jobs],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@jobs_bp.route('/jobs/<int:job_id>', methods=['GET'])
@cache_with_args()
@handle_error
def get_job(job_id):
    job = Job.query.get_or_404(job_id)
    return jsonify(job.to_dict())

@jobs_bp.route('/jobs', methods=['POST'])
@handle_error
def create_job():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'company', 'location', 'job_type']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Create new job
    try:
        job = Job(
            title=data['title'],
            company=data['company'],
            location=data['location'],
            job_type=data['job_type'],
            tags=data.get('tags', []),
            description=data.get('description'),
            url=data.get('url'),
            posting_date=datetime.fromisoformat(data['posting_date']) if 'posting_date' in data else datetime.utcnow()
        )
        
        db.session.add(job)
        db.session.commit()
        
        # Clear relevant cache
        cache.delete_memoized(get_jobs)
        
        return jsonify(job.to_dict()), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@jobs_bp.route('/jobs/<int:job_id>', methods=['PUT'])
@handle_error
def update_job(job_id):
    job = Job.query.get_or_404(job_id)
    data = request.get_json()
    
    # Update job fields
    for field in ['title', 'company', 'location', 'job_type', 'description', 'url']:
        if field in data:
            setattr(job, field, data[field])
    
    # Update tags if provided
    if 'tags' in data:
        job.set_tags(data['tags'])
    
    # Update the updated_at timestamp
    job.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify(job.to_dict())
    except Exception as e:
        db.session.rollback()
        raise e

@jobs_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
@handle_error
def delete_job(job_id):
    job = Job.query.get_or_404(job_id)
    
    try:
        db.session.delete(job)
        db.session.commit()
        return jsonify({'message': 'Job deleted successfully'})
    except Exception as e:
        db.session.rollback()
        raise e 