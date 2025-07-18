# schemas/transaction.py
from pydantic import BaseModel
from datetime import date
from typing import Optional

class TransactionOut(BaseModel):
    id: int
    date: date
    item: str
    type: str
    primary_category: Optional[str]  # ✅ Correct
    subcategory: Optional[str]       # ✅ Correct
    amount: float
    account_name: str
    account_type: str
    balance_before: float
    balance_after: float
    is_virtual: bool
    tags: Optional[str]

    class Config:
        from_attributes = True  # using SQLAlchemy


class TransactionUpdate(BaseModel):
    item: Optional[str]
    primary_category: Optional[str]
    subcategory: Optional[str]


class TransactionCreate(BaseModel):
    user_id: int
    date: date
    item: str
    type: str
    primary_category: str
    subcategory: Optional[str]
    amount: float
    account_name: str
    account_type: str
