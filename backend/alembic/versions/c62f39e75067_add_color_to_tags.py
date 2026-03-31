"""add_color_to_tags

Revision ID: c62f39e75067
Revises: a1b2c3d4e5f6
Create Date: 2026-03-31 18:27:46.205168

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c62f39e75067'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tags', sa.Column('color', sa.String(), nullable=False, server_default='#E8EAED'))


def downgrade() -> None:
    op.drop_column('tags', 'color')
