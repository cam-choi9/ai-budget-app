const functions = require("firebase-functions");
const { createLinkToken } = require("./src/plaid/createLinkToken");

exports.createLinkToken = createLinkToken;
