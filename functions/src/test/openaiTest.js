import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import OpenAI from "openai"; // ✅ v4-style import

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

export const openaiTest = onRequest(
  { secrets: [OPENAI_API_KEY], timeoutSeconds: 20 },
  async (req, res) => {
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY.value(),
    });

    try {
      const result = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say hello." },
        ],
      });

      const content = result.choices[0].message.content;
      console.log("✅ ChatGPT says:", content);
      res.status(200).send({ success: true, response: content });
    } catch (err) {
      console.error("❌ OpenAI v4 test error:", err.message);
      res.status(500).send({ error: err.message });
    }
  }
);
