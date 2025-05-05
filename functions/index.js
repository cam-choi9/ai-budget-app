import { createLinkToken } from "./src/plaid/createLinkToken.js";
import { exchangePublicToken } from "./src/plaid/exchangePublicToken.js";
import { testAccountsGet } from "./src/plaid/testAccountsGet.js";
import { plaidWebhook } from "./src/plaid/webhookReceiver.js";
import { getAccounts } from "./src/plaid/getAccounts.js"; // ✅ NEW

export {
  createLinkToken,
  exchangePublicToken,
  testAccountsGet,
  plaidWebhook,
  getAccounts,
};
