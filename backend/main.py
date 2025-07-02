from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine, Base
from auth.routes import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth_router, prefix='/api')

# allows frontend to call backend without CORS error
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or "*" for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

