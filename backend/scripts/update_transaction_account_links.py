import re
from sqlalchemy.orm import Session
from database import SessionLocal
from models.transaction import Transaction
from models.account import Account
from models.user import User
from models.plaid_item import PlaidItem

def extract_last_four(account_name):
    if not account_name:
        return None
    match = re.search(r"\*{4}(\d{4})", account_name)
    return match.group(1) if match else None

def update_transactions_by_last_four():
    db: Session = SessionLocal()
    try:
        transactions = db.query(Transaction).filter(Transaction.account_id == None).all()
        updated_count = 0

        for tx in transactions:
            last_four = extract_last_four(tx.account_name)
            if last_four:
                account = (
                    db.query(Account)
                    .filter(Account.last_four == last_four)
                    .first()
                )
                if account:
                    tx.account_id = account.id
                    updated_count += 1

        db.commit()
        print(f"✅ Updated {updated_count} transactions with account_id based on last 4 digits.")

    except Exception as e:
        db.rollback()
        print("❌ Error while updating transactions:", e)

    finally:
        db.close()

if __name__ == "__main__":
    update_transactions_by_last_four()
