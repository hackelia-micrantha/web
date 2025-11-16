import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import prettierPlugin from "eslint-plugin-prettier"
import { fixupConfigRules } from "@eslint/compat"

export default tseslint.config(
  {
    // Global ignores
    ignores: [
      "node_modules/",
      "build/",
      "public/build/",
      ".cache/",
      ".env",
      "app/styles/tailwind.css",
    ],
  },
  {
    // Global settings for all files
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  pluginJs.configs.recommended, // Basic JS recommended rules
  ...tseslint.configs.recommended, // TypeScript recommended rules
  {
    // React specific settings
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: pluginReact,
    },
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
    rules: {
      ...fixupConfigRules(pluginReact.configs.recommended).rules,
      ...fixupConfigRules(pluginReact.configs["jsx-runtime"]).rules,
      // Add any specific React rules here
    },
  },
  {
    // Prettier configuration
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          semi: false,
        },
      ],
    },
  },
)
