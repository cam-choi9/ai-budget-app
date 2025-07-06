from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class PlaidItem(Base):
    __tablename__ = "plaid_items"

    id = Column(Integer, primary_key=True, index=True)
    access_token = Column(String, nullable=False)
    item_id = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    institution_id = Column(String)          
    institution_name = Column(String)        

    user = relationship("User", back_populates="plaid_items")
