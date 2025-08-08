import models  # ✅ ensures relationships are loaded
from database import SessionLocal
from auth.utils import hash_password
from models.user import User

def reset_password(email: str, new_password: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"❌ No user found with email: {email}")
        return

    user.hashed_password = hash_password(new_password)
    db.commit()
    print(f"✅ Password updated for user: {email}")

if __name__ == "__main__":
    reset_password("hello@test.com", "test1234")
