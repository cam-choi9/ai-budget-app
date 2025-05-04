import { onRequest } from "firebase-functions/v2/https";

export const plaidWebhook = onRequest(
  {
    region: "us-central1",
    // Add `secrets` here if you plan to verify Plaid signatures in the future
  },
  (req, res) => {
    console.log("📬 Webhook received:", req.body);

    // Always respond quickly to acknowledge receipt
    res.status(200).send("Webhook received");

    // Optionally: store payload, trigger alert, etc.
  }
);
