import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

export function getPlaidClient({ clientId, secret, useProd }) {
  const config = new Configuration({
    basePath: useProd
      ? PlaidEnvironments.production
      : PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": clientId,
        "PLAID-SECRET": secret,
      },
    },
  });

  return new PlaidApi(config);
}
