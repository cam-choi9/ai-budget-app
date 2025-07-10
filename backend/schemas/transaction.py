# schemas/transaction.py
from pydantic import BaseModel
from datetime import date
from typing import Optional

class TransactionOut(BaseModel):
    id: int
    date: date
    item: str
    type: str
    category: str
    amount: float
    account_name: str
    account_type: str
    balance_before: float
    balance_after: float
    is_virtual: bool
    tags: Optional[str]

    class Config:
        from_attributes = True  # using SQLAlchemy
