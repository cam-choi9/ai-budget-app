# api/transactions.py
from sqlalchemy import func
from fastapi import APIRouter, Depends, Body, HTTPException, Request
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
async def get_transactions(  # ← async because we await request.body()
    request: Request,        # ← lets us log the raw incoming HTTP body
    payload: Any = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --- Debug logs to see exactly what the server received ---
    raw_bytes = await request.body()
    print("🔎 RAW BODY BYTES:", raw_bytes)
    try:
        print("🔎 RAW BODY TEXT:", raw_bytes.decode("utf-8"))
    except Exception:
        pass
    print("🔎 CONTENT-TYPE:", request.headers.get("content-type"))
    print("🔎 PYTHON TYPE(payload):", type(payload).__name__, "VALUE:", payload)

    # --- Normalize to a dict (fix double-encoded JSON) ---
    if isinstance(payload, (bytes, bytearray)):
        try:
            payload = json.loads(payload.decode("utf-8"))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON bytes body")
    elif isinstance(payload, str):
        try:
            payload = json.loads(payload)  # handle "{\"a\":1}" → {"a":1}
            print("🔧 Fixed double-encoded payload → dict")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON string body")
    elif not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Body must be a JSON object")

    include_virtual: bool = bool(payload.get("include_virtual", False))

    raw_balances: Dict[str, float] = payload.get("starting_balances", {}) or {}
    starting_balances: Dict[int, float] = {}
    for k, v in raw_balances.items():
        try:
            starting_balances[int(k)] = float(v)
        except (TypeError, ValueError):
            pass

    print("✅ starting_balances (int keys):", starting_balances)
    
    try:
        real_balances = recalculate_balances_for_user(
            user_id=current_user.id,
            db=db,
            starting_balances=starting_balances,
            include_virtual=False,
        )
        if include_virtual:
            recalculate_virtual_transactions_for_user(
                user_id=current_user.id,
                db=db,
                base_balances=real_balances,
            )
    except Exception as e:
        print("❌ Failed to recalculate balances:", str(e))

    query = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .outerjoin(Account)
        .order_by(Transaction.date.desc())
    )
    if not include_virtual:
        query = query.filter(Transaction.is_virtual == False)

    transactions: List[Transaction] = query.all()

    result = []
    for tx in transactions:
        result.append({
            "id": tx.id,
            "item": tx.item,
            "type": tx.type,
            "date": tx.date,  # FastAPI will serialize date
            "amount": float(tx.amount) if hasattr(tx.amount, "__float__") else tx.amount,
            "primary_category": tx.primary_category,
            "subcategory": tx.subcategory,
            "balance_before": tx.balance_before,
            "balance_after": tx.balance_after,
            "is_virtual": tx.is_virtual,
            "account_name": (
                tx.account.custom_name if tx.account and tx.account.custom_name
                else tx.account_name
            ),
            "account_type": (tx.account.account_type if tx.account else tx.account_type),
            "tags": tx.tags,
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
