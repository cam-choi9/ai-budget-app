import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

// Accept secrets as parameters
export function getPlaidClient({ clientId, secret }) {
  return new PlaidApi(
    new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": clientId,
          "PLAID-SECRET": secret,
        },
      },
    })
  );
}
