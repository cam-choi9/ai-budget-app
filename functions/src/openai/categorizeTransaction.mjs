import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import OpenAI from "openai";

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

export const categorizeTransaction = onCall(
  { secrets: [OPENAI_API_KEY], timeoutSeconds: 20 },
  async (request) => {
    const { item, amount, description = "", paymentMethod } = request.data;

    console.log("🧠 Categorizing:", {
      item,
      amount,
      description,
      paymentMethod,
    });

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY.value(),
    });

    const prompt = `
You are a financial assistant categorizing bank transactions.

Transaction:
- Item: ${item}
- Amount: $${amount}
- Description: ${description}
- Payment Method: ${paymentMethod}

Return ONLY the most suitable category from:
["Food & Beverage", "Groceries", "Travel", "Shopping", "Apartment", "Utility", "Car", "Personal Care", "Entertainment", "Health", "Gift", "Income", "Other"]

Respond only in this format:
{ "category": "CATEGORY_NAME" }
`.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0].message.content.trim();

    try {
      const { category } = JSON.parse(raw);
      return { category };
    } catch (err) {
      console.error("❌ GPT parse error:", raw);
      throw new Error("Could not parse category from model response.");
    }
  }
);
