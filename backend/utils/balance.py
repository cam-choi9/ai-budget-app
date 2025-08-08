from models.transaction import Transaction
from models.account import Account
from models.plaid_item import PlaidItem
from sqlalchemy.orm import Session
from plaid.model.accounts_get_request import AccountsGetRequest
from config import plaid_client

def recalculate_balances_for_user(
    user_id: int,
    db: Session,
    starting_balances: dict = None,
    include_virtual: bool = False,
) -> dict:
    if starting_balances is None:
        plaid_item = db.query(PlaidItem).filter(PlaidItem.user_id == user_id).first()
        if not plaid_item:
            print(f"❌ No PlaidItem found for user {user_id}")
            return {}

        try:
            accounts_response = plaid_client.accounts_get(
                AccountsGetRequest(access_token=plaid_item.access_token)
            )
            plaid_accounts = {acct.account_id: acct for acct in accounts_response.accounts}
        except Exception as e:
            print(f"❌ Failed to fetch balances from Plaid: {e}")
            return {}
    else:
        plaid_accounts = {}

    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    final_balances = {}

    for account in accounts:
        print(f"🔍 Checking account ID={account.id} (name={account.custom_name}, type={account.account_type})")

        if starting_balances and str(account.id) in starting_balances:
            starting_balance = starting_balances[str(account.id)]
            print(f"✅ Starting balance from frontend for account {account.id}: {starting_balance}")
        elif account.plaid_account_id and account.plaid_account_id in plaid_accounts:
            plaid_acct = plaid_accounts[account.plaid_account_id]
            starting_balance = (
                plaid_acct.balances.current if account.account_type == "credit"
                else plaid_acct.balances.available
            ) or 0.0
            print(f"✅ Starting balance from Plaid for account {account.id}: {starting_balance}")
        else:
            print(f"⚠️ No starting balance available for account {account.custom_name or account.id}")
            continue

        tx_query = db.query(Transaction).filter(Transaction.account_id == account.id)
        if not include_virtual:
            tx_query = tx_query.filter(Transaction.is_virtual == False)

        txns = tx_query.order_by(Transaction.date.desc(), Transaction.id.desc()).all()

        for tx in txns:
            tx.balance_after = starting_balance
            tx.amount = abs(tx.amount)

            if account.account_type == "credit":
                if tx.type == "expense":
                    tx.balance_before = starting_balance - tx.amount
                else:
                    tx.balance_before = starting_balance + tx.amount
            else:
                if tx.type == "expense":
                    tx.balance_before = starting_balance + tx.amount
                else:
                    tx.balance_before = starting_balance - tx.amount

            starting_balance = tx.balance_before

        final_balances[str(account.id)] = starting_balance

    db.commit()
    return final_balances

def recalculate_virtual_transactions_for_user(user_id: int, db: Session, base_balances: dict):
    accounts = db.query(Account).filter(Account.user_id == user_id).all()

    for account in accounts:
        account_id_str = str(account.id)
        if account_id_str not in base_balances:
            print(f"⚠️ No base balance available for virtual tx on account {account.id}")
            continue

        print(f"\n🔁 Recalculating virtual tx for: {account.custom_name or account.id}")

        real_balance = base_balances[account_id_str]
        print(f"🧲 Real balance: {real_balance}")

        virtual_txns = (
            db.query(Transaction)
            .filter(Transaction.account_id == account.id)
            .filter(Transaction.is_virtual == True)
            .order_by(Transaction.date.desc(), Transaction.id.desc())
            .all()
        )

        balance_cursor = real_balance
        for tx in virtual_txns:
            tx.balance_after = balance_cursor
            tx.amount = abs(tx.amount)

            if account.account_type == "credit":
                if tx.type == "expense":
                    tx.balance_before = balance_cursor + tx.amount
                else:
                    tx.balance_before = balance_cursor - tx.amount
            else:
                if tx.type == "expense":
                    tx.balance_before = balance_cursor - tx.amount
                else:
                    tx.balance_before = balance_cursor + tx.amount

            balance_cursor = tx.balance_before

    db.commit()