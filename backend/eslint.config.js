import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nodePlugin from "eslint-plugin-node";
import securityPlugin from "eslint-plugin-security";
import promisePlugin from "eslint-plugin-promise";
import importPlugin from "eslint-plugin-import";

export default [
  ...tseslint.config(
    {
      tsconfigPath: "./tsconfig.json",
    },
    {
      rules: {
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/explicit-module-boundary-types": "warn",
      },
    }
  ),
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    ignores: ["node_modules", "dist"],
    languageOptions: {
      parser: tseslint.parser,
      sourceType: "module",
    },
    plugins: {
      node: nodePlugin,
      security: securityPlugin,
      promise: promisePlugin,
      import: importPlugin,
    },
    rules: {
      // Block sync APIs
      "node/no-sync": "error",

      // Block all *Sync methods
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name=/.*Sync$/]",
          message: "Avoid sync functions in backend code.",
        },
      ],

      "promise/catch-or-return": "error",
      "promise/no-return-wrap": "warn",
      "import/no-unresolved": "off",
    },
  },
];
