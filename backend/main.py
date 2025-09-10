from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine, Base

from auth.routes import router as auth_router
from api.plaid import router as plaid_router
from api.transactions import router as transaction_router
from api.accounts import router as account_router
from api.ai import router as ai_router

from config import settings
import sys
import traceback
from dotenv import load_dotenv


load_dotenv()

# ✅ Create the app first
app = FastAPI(title = "AI Budget API")

# ✅ Apply error-logging middleware AFTER app is defined
@app.middleware("http")
async def log_exceptions(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        print("🔥 Exception caught during request:")
        traceback.print_exc(file=sys.stdout)
        raise

@app.middleware("http")
async def log_route_calls(request: Request, call_next):
    print(f"📥 ROUTE CALLED: {request.method} {request.url.path}")
    return await call_next(request)


# ✅ DB setup
Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:5173",
    "https://ai-budget-app-frontend.onrender.com",    
]

# ✅ CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/")
def root():
    return {"message": "AI Budget API. See /docs"}

# ✅ Route setup
app.include_router(auth_router, prefix="/api")
app.include_router(plaid_router, prefix="/api")
app.include_router(account_router, prefix="/api")
app.include_router(transaction_router, prefix="/api")
app.include_router(ai_router, prefix="/api")

print("📡 Connected to DB:", settings.DATABASE_URL)
