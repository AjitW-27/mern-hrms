import js from "@eslint/js";
import globals from "globals";
import hooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist/**", "node_modules/**", ".tmp/**"] },
  js.configs.recommended,
  { files: ["**/*.{js,jsx,cjs}"], languageOptions: { ecmaVersion: "latest", globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaFeatures: { jsx: true } } }, plugins: { "react-hooks": hooks }, rules: { "no-unused-vars": ["warn", { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_", caughtErrors: "none" }], "no-empty": ["error", { allowEmptyCatch: true }], "react-hooks/rules-of-hooks": "error", "react-hooks/exhaustive-deps": "warn" } },
];
