from datetime import datetime
from . import db
import json
from sqlalchemy import Index
from sqlalchemy.orm import validates

class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    company = db.Column(db.String(200), nullable=False, index=True)
    location = db.Column(db.String(200), nullable=False, index=True)
    posting_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)
    job_type = db.Column(db.String(50), nullable=False, index=True)
    tags = db.Column(db.Text, nullable=False, default='[]')  # Store as JSON string
    description = db.Column(db.Text)
    url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Create composite indexes for common search patterns
    __table_args__ = (
        Index('idx_job_search', 'title', 'company', 'location'),
        Index('idx_job_type_date', 'job_type', 'posting_date'),
    )

    @validates('title', 'company', 'location', 'job_type')
    def validate_not_empty(self, key, value):
        if not value or not value.strip():
            raise ValueError(f"{key} cannot be empty")
        return value.strip()

    @validates('url')
    def validate_url(self, key, value):
        if value and not value.startswith(('http://', 'https://')):
            raise ValueError("URL must start with http:// or https://")
        return value

    def set_tags(self, tags_list):
        if not isinstance(tags_list, (list, str)):
            raise ValueError("Tags must be a list or JSON string")
        if isinstance(tags_list, str):
            try:
                # Validate that it's a valid JSON string
                json.loads(tags_list)
                self.tags = tags_list
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON string for tags")
        else:
            self.tags = json.dumps(tags_list)

    def get_tags(self):
        try:
            return json.loads(self.tags)
        except json.JSONDecodeError:
            return []

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'posting_date': self.posting_date.isoformat(),
            'job_type': self.job_type,
            'tags': self.get_tags(),
            'description': self.description,
            'url': self.url,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @classmethod
    def search(cls, query, filters=None):
        """Optimized search method with filters"""
        search_query = cls.query

        if filters:
            if filters.get('title'):
                search_query = search_query.filter(cls.title.ilike(f'%{filters["title"]}%'))
            if filters.get('company'):
                search_query = search_query.filter(cls.company.ilike(f'%{filters["company"]}%'))
            if filters.get('location'):
                search_query = search_query.filter(cls.location.ilike(f'%{filters["location"]}%'))
            if filters.get('job_type'):
                search_query = search_query.filter(cls.job_type == filters['job_type'])
            if filters.get('tags'):
                search_query = search_query.filter(cls.tags.ilike(f'%{filters["tags"]}%'))

        if query:
            search_query = search_query.filter(
                db.or_(
                    cls.title.ilike(f'%{query}%'),
                    cls.company.ilike(f'%{query}%'),
                    cls.location.ilike(f'%{query}%'),
                    cls.description.ilike(f'%{query}%')
                )
            )

        return search_query 