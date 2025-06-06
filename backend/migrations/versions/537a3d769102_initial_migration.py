"""Initial migration

Revision ID: 537a3d769102
Revises: 
Create Date: 2025-05-31 21:16:50.730093

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '537a3d769102'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('jobs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('company', sa.String(length=200), nullable=False),
    sa.Column('location', sa.String(length=200), nullable=False),
    sa.Column('posting_date', sa.DateTime(), nullable=False),
    sa.Column('job_type', sa.String(length=50), nullable=False),
    sa.Column('tags', sa.Text(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('url', sa.String(length=500), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('jobs')
    # ### end Alembic commands ###
