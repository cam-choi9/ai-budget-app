# api/transactions.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models.transaction import Transaction
from schemas.transaction import TransactionOut, TransactionUpdate, TransactionCreate
from typing import List

router = APIRouter()

@router.get("/transactions", response_model=List[TransactionOut])
def get_transactions(include_virtual: bool = Query(False), db: Session = Depends(get_db)):
    if include_virtual:
        return db.query(Transaction).order_by(Transaction.date.desc()).all()
    else:
        return db.query(Transaction).filter_by(is_virtual=False).order_by(Transaction.date.desc()).all()


@router.patch("/transactions/{transaction_id}")
def update_transaction(transaction_id: int, update: TransactionUpdate, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if update.item is not None:
        tx.item = update.item
    if update.primary_category is not None:
        tx.primary_category = update.primary_category
    if update.subcategory is not None:
        tx.subcategory = update.subcategory

    db.commit()
    db.refresh(tx)
    return {"message": "Transaction updated", "transaction": tx.id}

@router.post("/transactions")
def add_transaction(tx: TransactionCreate, db: Session = Depends(get_db)):
    new_tx = Transaction(
        user_id=tx.user_id,
        date=tx.date,
        item=tx.item,
        type=tx.type,
        primary_category=tx.primary_category,
        subcategory=tx.subcategory,
        amount=tx.amount,
        account_name=tx.account_name,
        account_type=tx.account_type,
        balance_before=0.0,  # Can be computed later
        balance_after=0.0,
        is_virtual=True,
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx
