import { PlaidLink } from "react-plaid-link";

function PlaidLinkButton({ onSuccessCallback }) {
  return (
    <PlaidLink
      token={import.meta.env.VITE_PLAID_LINK_TOKEN} // You'll generate this later
      onSuccess={onSuccessCallback}
    >
      Link Bank Account
    </PlaidLink>
  );
}

export default PlaidLinkButton;
