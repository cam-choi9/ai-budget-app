import json
import re
from openai import OpenAI
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.transaction import Transaction
from config import settings

router = APIRouter()
client = OpenAI(api_key=settings.openai_api_key)

@router.post("/ai/categorize-transactions")
def categorize_uncategorized_transactions(db: Session = Depends(get_db)):
    uncategorized = db.query(Transaction).filter(
        Transaction.primary_category == "Uncategorized"
    ).all()

    updated = 0

    for tx in uncategorized:
        try:
            prompt = (
                f"Classify the transaction below into two parts:\n"
                f"- 'primary': the broad category (e.g., 'Food & Beverage')\n"
                f"- 'subcategory': the specific type (e.g., 'Coffee')\n\n"
                f"Transaction: {tx.item}\n"
                f"Amount: ${tx.amount:.2f}\n\n"
                f"Respond ONLY in JSON like: {{\"primary\": \"...\", \"subcategory\": \"...\"}}"
            )

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a financial assistant that classifies transactions."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=100,
            )

            raw_response = response.choices[0].message.content.strip()
            print(f"🔍 Raw response for '{tx.item}': {raw_response}")

            match = re.search(r"{.*}", raw_response)
            if not match:
                raise ValueError("No JSON found in response")

            category_data = json.loads(match.group())
            tx.primary_category = category_data.get("primary", "Uncategorized")
            tx.subcategory = category_data.get("subcategory", "Uncategorized")
            updated += 1

        except Exception as e:
            print(f"❌ Failed to categorize '{tx.item}': {e}")
            continue

    db.commit()
    return {"updated": updated}
