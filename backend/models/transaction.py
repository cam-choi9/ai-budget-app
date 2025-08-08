from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
from models.account import Account

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    account_id = Column(Integer, ForeignKey("accounts.id"))    
    date = Column(Date)
    item = Column(String)
    type = Column(String)  # 'income' or 'expense'
    primary_category = Column(String, nullable=True)
    subcategory = Column(String, nullable=True)
    amount = Column(Float)
    account_name = Column(String)
    account_type = Column(String)  # checking, credit, etc.
    balance_before = Column(Float)
    balance_after = Column(Float)
    is_virtual = Column(Boolean, default=False)
    tags = Column(String)  # optional, comma-separated
    transaction_id = Column(String, unique=True, nullable=True)    
    
    account = relationship("Account", back_populates="transactions")
    