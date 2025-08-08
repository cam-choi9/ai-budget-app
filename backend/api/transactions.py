# api/transactions.py
from sqlalchemy import func
from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.transaction import Transaction
from models.account import Account
from schemas.transaction import TransactionOut, TransactionUpdate, TransactionCreate, SpendingCategoryOut
from utils.balance import recalculate_balances_for_user, recalculate_virtual_transactions_for_user
from typing import Dict, Any, List
from auth.utils import get_current_user
from models.user import User

router = APIRouter()

@router.post("/transactions")
def get_transactions(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    include_virtual: bool = payload.get("include_virtual", False)
    starting_balances: dict = payload.get("starting_balances", {})

    print("✅ Received starting_balances:", starting_balances)

    try:
        # ✅ Step 1: Always recalculate REAL transactions
        real_balances = recalculate_balances_for_user(
            user_id=current_user.id,
            db=db,
            starting_balances=starting_balances,
            include_virtual=False  # Only real transactions
        )

        # ✅ Step 2: Recalculate VIRTUAL transactions on top of real balances
        if include_virtual:
            recalculate_virtual_transactions_for_user(
                user_id=current_user.id,
                db=db,
                base_balances=real_balances
            )

    except Exception as e:
        print("❌ Failed to recalculate balances:", str(e))

    # ✅ Step 3: Fetch transactions
    query = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .outerjoin(Account)
        .order_by(Transaction.date.desc())
    )

    if not include_virtual:
        query = query.filter(Transaction.is_virtual == False)

    transactions = query.all()

    # ✅ Step 4: Format response
    result = []
    for tx in transactions:
        result.append({
            "id": tx.id,
            "item": tx.item,
            "type": tx.type,
            "date": tx.date,
            "amount": tx.amount,
            "primary_category": tx.primary_category,
            "subcategory": tx.subcategory,
            "balance_before": tx.balance_before,
            "balance_after": tx.balance_after,
            "is_virtual": tx.is_virtual,
            "account_name": (
                tx.account.custom_name if tx.account and tx.account.custom_name
                else tx.account_name
            ),
            "account_type": (
                tx.account.account_type if tx.account else tx.account_type
            ),
            "tags": tx.tags,
            "transaction_id": tx.transaction_id,
        })

    return result


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
    recalculate_balances_for_user(tx.user_id, db)
    db.refresh(tx)
    return {"message": "Transaction updated", "transaction": tx.id}


@router.post("/transactions/new")
def add_transaction(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx_data = payload.get("transaction")

    if tx_data is None:
        raise HTTPException(status_code=400, detail="Missing transaction data")

    new_tx = Transaction(
        user_id=current_user.id,
        date=tx_data["date"],
        item=tx_data["item"],
        type=tx_data["type"],
        primary_category=tx_data["primary_category"],
        subcategory=tx_data.get("subcategory"),
        amount=tx_data["amount"],
        account_id=tx_data["account_id"],
        balance_before=0.0,
        balance_after=0.0,
        is_virtual=True,
    )

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    return new_tx

@router.get("/transactions/top-categories", response_model=List[SpendingCategoryOut])
def get_top_spending_categories(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = (
        db.query(Transaction.primary_category, func.sum(Transaction.amount).label("total"))
        .filter(Transaction.user_id == user.id, Transaction.type == "expense")
        .group_by(Transaction.primary_category)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(5)
        .all()
    )

    return [{"category": r[0], "total": r[1]} for r in results]
