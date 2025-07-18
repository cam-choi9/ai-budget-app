from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plaid_item_id = Column(Integer, ForeignKey("plaid_items.id"), nullable=False)
    plaid_account_id = Column(String, unique=True, nullable=False)  # from Plaid
    official_name = Column(String)
    account_type = Column(String)  # e.g., checking, credit
    last_four = Column(String)     # from `mask`
    custom_name = Column(String, nullable=True)

    transactions = relationship("Transaction", back_populates="account")
