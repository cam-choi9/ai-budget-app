from database import Base, engine
from models import user  # make sure this imports your User model

print("🔁 Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("✅ Recreating tables with updated schema...")
Base.metadata.create_all(bind=engine)

print("🎉 Done.")
