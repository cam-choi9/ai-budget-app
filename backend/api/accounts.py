from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.account import Account
from models.user import User
from database import get_db 
from auth.utils import get_current_user

router = APIRouter()

@router.put("/accounts/{account_id}/custom_name")
def update_custom_name(
    account_id: int,
    name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    account = db.query(Account).filter_by(id=account_id, user_id=current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    account.custom_name = name
    db.commit()
    return {"success": True, "custom_name": name}
