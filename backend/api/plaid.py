from fastapi import APIRouter, Depends, HTTPException, Request
from auth.utils import get_current_user
from models.user import User
from models.plaid_item import PlaidItem
from config import settings
from sqlalchemy.orm import Session
from database import get_db

from plaid import Configuration, ApiClient, Environment
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.link_token_create_response import LinkTokenCreateResponse
from plaid.model.country_code import CountryCode
from plaid.model.products import Products


router = APIRouter()

# ✅ Plaid environment setup
plaid_env = Environment.Production if settings.ENV == "production" else Environment.Sandbox

configuration = Configuration(
    host=plaid_env,
    api_key={
        "clientId": settings.PLAID_CLIENT_ID,
        "secret": settings.PLAID_SECRET,
    }
)
api_client = ApiClient(configuration)
plaid_client = plaid_api.PlaidApi(api_client)


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
def get_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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

        institution_name = plaid_item.institution_name or "Unknown Institution"

        # ✅ Use .to_dict() to flatten Plaid SDK objects
        # ✅ Append institution_name to each account
        accounts_data = [
            {
                **acct.to_dict(),
                "institution_name": institution_name
            }
            for acct in response.accounts
        ]


        return {"accounts": accounts_data}

    except Exception as e:
        print("❌ Failed to fetch accounts:", str(e))
        raise HTTPException(status_code=500, detail="Unable to fetch accounts")

