import js from "@eslint/js";
import pluginPromise from "eslint-plugin-promise";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"], // ✅ include .mjs files
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly", // ✅ allow console usage
      },
    },
    plugins: {
      promise: pluginPromise,
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": "off",
      "no-undef": "off", // optional now that globals are set
      "promise/always-return": "error",
      "promise/catch-or-return": "error",
      "promise/no-nesting": "warn",
    },
  },
];
