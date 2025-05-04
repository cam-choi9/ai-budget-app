// functions/eslint.config.js
import js from "@eslint/js";
import pluginPromise from "eslint-plugin-promise";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        process: "readonly",
      },
    },
    plugins: {
      promise: pluginPromise,
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "promise/always-return": "error",
      "promise/catch-or-return": "error",
      "promise/no-nesting": "warn",
    },
  },
];
