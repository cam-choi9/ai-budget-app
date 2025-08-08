from fastapi import APIRouter, Depends, HTTPException, Request
from auth.utils import get_current_user
from models.user import User
from models.plaid_item import PlaidItem
from config import settings, plaid_client
from sqlalchemy.orm import Session
from database import get_db
from datetime import datetime, timedelta
from models.transaction import Transaction
from models.account import Account  
from utils.balance import recalculate_balances_for_user

from plaid import Configuration, ApiClient, Environment
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.link_token_create_response import LinkTokenCreateResponse
from plaid.model.country_code import CountryCode
from plaid.model.products import Products
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions

router = APIRouter()

@router.get("/plaid/create_link_token")
def create_link_token(current_user: User = Depends(get_current_user)):
    try:
        request = LinkTokenCreateRequest(
            user=LinkTokenCreateRequestUser(client_user_id=str(current_user.id)),
            client_name="AI Budget App",
            products=[Products("transactions")],
            country_codes=[CountryCode("US")],
            language="en",
        )
        print("🔧 Link Token Request:", request)

        response: LinkTokenCreateResponse = plaid_client.link_token_create(request)
        
        return {"link_token": response.link_token}
    except Exception as e:
        print("❌ Error creating link token:", str(e))
        raise HTTPException(status_code=500, detail="Plaid token creation failed")


@router.post("/plaid/exchange_public_token")
async def exchange_token(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    body = await request.json()
    public_token = body.get("public_token")
    metadata = body.get("metadata", {})  # ✅ Extract metadata from frontend

    if not public_token:
        raise HTTPException(status_code=400, detail="Missing public_token")

    try:
        # Exchange public token for access token
        exchange_request = ItemPublicTokenExchangeRequest(public_token=public_token)
        exchange_response = plaid_client.item_public_token_exchange(exchange_request)

        access_token = exchange_response.access_token
        item_id = exchange_response.item_id

        # ✅ Safely extract institution info from metadata
        institution = metadata.get("institution", {})
        institution_id = institution.get("institution_id")
        institution_name = institution.get("name")

        plaid_item = PlaidItem(
            access_token=access_token,
            item_id=item_id,
            user_id=current_user.id,
            institution_id=institution_id,
            institution_name=institution_name
        )
        db.add(plaid_item)
        db.commit()

        return {"item_id": item_id, "institution_name": institution_name}

    except Exception as e:
        print("❌ Token exchange failed:", str(e))
        raise HTTPException(status_code=500, detail="Failed to exchange token")


@router.get("/plaid/items")
def get_plaid_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        items = (
            db.query(PlaidItem)
            .filter(PlaidItem.user_id == current_user.id)
            .all()
        )

        serialized_items = [
            {
                "id": item.id,
                "item_id": item.item_id,
            }
            for item in items
        ]

        return {"items": serialized_items}
    except Exception as e:
        print("❌ Failed to fetch plaid items:", str(e))
        raise HTTPException(status_code=500, detail="Unable to fetch items")


@router.get("/plaid/accounts")
def get_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        plaid_item = (
            db.query(PlaidItem)
            .filter(PlaidItem.user_id == current_user.id)
            .first()
        )

        if not plaid_item:
            raise HTTPException(status_code=404, detail="No access token found for user")

        request = AccountsGetRequest(access_token=plaid_item.access_token)
        response = plaid_client.accounts_get(request)

        print("🔁 Fetched", len(response.accounts), "accounts from Plaid")

        institution_name = plaid_item.institution_name or "Unknown Institution"

        accounts_data = []

        for acct in response.accounts:
            plaid_account_id = acct.account_id
            existing_account = db.query(Account).filter_by(plaid_account_id=plaid_account_id).first()

            if not existing_account:
                new_account = Account(
                    user_id=current_user.id,
                    plaid_item_id=plaid_item.id,
                    plaid_account_id=plaid_account_id,
                    official_name=acct.official_name or acct.name,
                    account_type=str(acct.type),
                    last_four=acct.mask,
                    custom_name=None  # user can set later in settings                    
                )
                db.add(new_account)
                db.flush()  # flush to get new_account.id
                account_to_return = new_account
            else:
                account_to_return = existing_account

            # Prepare return data
            accounts_data.append({
                "id": account_to_return.id,
                "plaid_account_id": plaid_account_id,
                "official_name": account_to_return.official_name,
                "account_type": account_to_return.account_type,
                "last_four": account_to_return.last_four,
                "custom_name": account_to_return.custom_name,
                "institution_name": institution_name,
                "balances": acct.balances.to_dict(), 
            })

        db.commit()
        return {"accounts": accounts_data}

    except Exception as e:
        print("❌ Failed to fetch/save accounts:", str(e))
        raise HTTPException(status_code=500, detail="Unable to fetch accounts")


@router.post("/plaid/sync-transactions")
def sync_transactions(user_id: int, db: Session = Depends(get_db)):
    # 1. Get access_token
    plaid_item = db.query(PlaidItem).filter(PlaidItem.user_id == user_id).first()
    if not plaid_item:
        raise HTTPException(status_code=404, detail="Plaid item not found.")

    access_token = plaid_item.access_token

    # 2. Call Plaid to get transactions + accounts
    start_date = (datetime.now() - timedelta(days=30)).date()
    end_date = datetime.now().date()

    try:
        request = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date,
            end_date=end_date,
            options=TransactionsGetRequestOptions(count=100, offset=0)
        )
        response = plaid_client.transactions_get(request)
        transactions = response["transactions"]
        print("🔍 First transaction:", transactions[0])

        # Get account metadata
        accounts_response = plaid_client.accounts_get(
            AccountsGetRequest(access_token=access_token)
        )
        accounts_by_id = {acct.account_id: acct for acct in accounts_response.accounts}

        # Get existing account mappings from DB
        db_accounts = db.query(Account).filter(Account.user_id == user_id).all()
        account_map = {acct.plaid_account_id: acct for acct in db_accounts}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    inserted_count = 0
    account_balances = {}

    for tx in transactions:
        transaction_id = tx["transaction_id"]
        if db.query(Transaction).filter_by(transaction_id=transaction_id).first():
            continue

        plaid_account_id = tx["account_id"]
        account = account_map.get(plaid_account_id)

        if not account:
            print(f"⚠️ Skipping transaction; no matching account for {plaid_account_id}")
            continue  # or optionally: create the account record here

        # Set up balances (simple in-memory for now)
        if plaid_account_id not in account_balances:
            account_balances[plaid_account_id] = 0.0

        prev_balance = account_balances[plaid_account_id]
        new_balance = prev_balance - tx["amount"] if tx["amount"] > 0 else prev_balance + abs(tx["amount"])
        account_balances[plaid_account_id] = new_balance

        new_tx = Transaction(
            user_id=user_id,
            transaction_id=transaction_id,
            date=tx["date"],
            item=tx["name"],
            type="expense" if tx["amount"] > 0 else "income",
            primary_category="Uncategorized",
            subcategory="Uncategorized",
            amount=tx["amount"],
            account_id=account.id,  # ✅ Key change: link to account table
            account_name=account.custom_name or account.official_name or "",  # fallback
            account_type=account.account_type,
            balance_before=prev_balance,
            balance_after=new_balance,
            is_virtual=False,
        )
        db.add(new_tx)
        inserted_count += 1

    db.commit()
    recalculate_balances_for_user(user_id, db)
    return {"message": f"Inserted {inserted_count} new transactions"}

