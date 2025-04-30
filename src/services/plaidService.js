// src/services/plaidService.js

export async function getLinkToken() {
  try {
    const response = await fetch(
      "https://createlinktoken-6xfpnkvkoq-uc.a.run.app"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch link token");
    }
    const data = await response.json();
    return data.link_token;
  } catch (error) {
    console.error("Error fetching Plaid Link Token:", error);
    return null;
  }
}
