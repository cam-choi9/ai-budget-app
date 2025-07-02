from fastapi import APIRouter, Depends, HTTPException
from auth.utils import get_current_user
from models.user import User
from config import settings

from plaid import Configuration, ApiClient
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.link_token_create_response import LinkTokenCreateResponse
from plaid import Environment

router = APIRouter()

# ✅ Set the correct environment based on ENV
plaid_env = Environment.Production if settings.ENV == "production" else Environment.Sandbox

# ✅ Setup Plaid API client once
configuration = Configuration(
    host=plaid_env,
    api_key={
        "clientId": settings.PLAID_CLIENT_ID,
        "secret": settings.PLAID_SECRET,
    }
)
api_client = ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)


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

        response: LinkTokenCreateResponse = client.link_token_create(request)
        return {"link_token": response.link_token}

    except Exception as e:
        print("❌ Error creating link token:", str(e))
        raise HTTPException(status_code=500, detail="Plaid token creation failed")
