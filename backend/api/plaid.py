from fastapi import APIRouter, Depends, HTTPException, Request
from auth.utils import get_current_user
from models.user import User
from config import settings

from plaid import Configuration, ApiClient
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.item_public_token_exchange_response import ItemPublicTokenExchangeResponse
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.link_token_create_response import LinkTokenCreateResponse
from plaid import ApiClient, Configuration, Environment

router = APIRouter()

# ✅ Set the correct environment based on ENV
plaid_env = Environment.Production if settings.ENV == "production" else Environment.Sandbox
user_access_tokens = {}

# ✅ Setup Plaid API client once
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
        print("🔍 Runtime check:")
        print("🌍 ENV:", settings.ENV)
        print("🔑 CLIENT_ID:", settings.PLAID_CLIENT_ID)
        print("🔑 SECRET:", settings.PLAID_SECRET[:4] + "..." if settings.PLAID_SECRET else "None")

        request = LinkTokenCreateRequest(
            user=LinkTokenCreateRequestUser(client_user_id=str(current_user.id)),
            client_name="AI Budget App",
            products=[Products("transactions")],
            country_codes=[CountryCode("US")],
            language="en",
        )

        response: LinkTokenCreateResponse = plaid_client.link_token_create(request)
        return {"link_token": response.link_token}

    except Exception as e:
        print("❌ Error creating link token:", str(e))
        raise HTTPException(status_code=500, detail="Plaid token creation failed")

@router.post("/plaid/exchange_public_token")
async def exchange_token(request: Request, current_user: User = Depends(get_current_user)):
    body = await request.json()
    public_token = body.get("public_token")

    if not public_token:
        raise HTTPException(status_code=400, detail="Missing public_token")

    try:
        exchange_request = ItemPublicTokenExchangeRequest(public_token=public_token)
        exchange_response: ItemPublicTokenExchangeResponse = plaid_client.item_public_token_exchange(exchange_request)

        access_token = exchange_response.access_token
        item_id = exchange_response.item_id

        print("🔑 Access Token:", access_token)
        print("🧾 Item ID:", item_id)

        user_access_tokens[current_user.id] = access_token


        # ❗ TODO: Store `access_token` in your DB associated with `current_user.id`

        return {"access_token": access_token, "item_id": item_id}
    except Exception as e:
        print("❌ Token exchange failed:", str(e))
        raise HTTPException(status_code=500, detail="Failed to exchange token")
    

@router.get("/plaid/accounts")
def get_accounts(current_user: User = Depends(get_current_user)):
    try:      
        access_token = user_access_tokens.get(current_user.id)
        if not access_token:
            raise HTTPException(status_code=400, detail="No access token found for user")

        request = AccountsGetRequest(access_token=access_token)
        response = plaid_client.accounts_get(request)
        return response.to_dict()
    except Exception as e:
        print("❌ Failed to fetch accounts:", str(e))
        raise HTTPException(status_code=500, detail="Unable to fetch accounts")
