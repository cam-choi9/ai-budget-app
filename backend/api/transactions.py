# api/transactions.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.transaction import Transaction
from schemas.transaction import TransactionOut
from typing import List

router = APIRouter()

@router.get("/transactions", response_model=List[TransactionOut])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).order_by(Transaction.date.desc()).all()
