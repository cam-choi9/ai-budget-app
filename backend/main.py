from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine, Base
from auth.routes import router as auth_router
from api.plaid import router as plaid_router
from models import plaid_item
from config import settings
import sys
import traceback

# ✅ Create the app first
app = FastAPI()

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

# ✅ CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Route setup
app.include_router(auth_router, prefix="/api")
app.include_router(plaid_router, prefix="/api")

print("📡 Connected to DB:", settings.DATABASE_URL)
