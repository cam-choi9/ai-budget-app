export async function getLinkToken() {
  const url = "https://createlinktoken-6xfpnkvkoq-uc.a.run.app";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Failed to fetch link token: ${response.status} ${errText}`
      );
    }

    const { link_token } = await response.json();
    return link_token;
  } catch (error) {
    console.error(
      "🔴 Error fetching Plaid Link Token:",
      error?.message ?? error
    );
    return null;
  }
}
