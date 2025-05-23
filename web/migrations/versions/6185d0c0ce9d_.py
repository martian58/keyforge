"""empty message

Revision ID: 6185d0c0ce9d
Revises: fb27e8471424
Create Date: 2025-05-10 23:41:25.209848

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6185d0c0ce9d'
down_revision = 'fb27e8471424'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('message', schema=None) as batch_op:
        batch_op.alter_column('sender_id',
               existing_type=sa.INTEGER(),
               type_=sa.String(length=150),
               existing_nullable=True)
        batch_op.alter_column('receiver_id',
               existing_type=sa.INTEGER(),
               type_=sa.String(length=150),
               existing_nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('message', schema=None) as batch_op:
        batch_op.alter_column('receiver_id',
               existing_type=sa.String(length=150),
               type_=sa.INTEGER(),
               existing_nullable=True)
        batch_op.alter_column('sender_id',
               existing_type=sa.String(length=150),
               type_=sa.INTEGER(),
               existing_nullable=True)

    # ### end Alembic commands ###
