import js from "@eslint/js";
import remotion from "@remotion/eslint-plugin";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "node_modules/**",
      "out/**",
      "build/**",
      "scripts-tmp-*.mjs",
      "scripts-tmp-*.ts",
      "scripts/validate-minimax-contract.mjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-duplicate-imports": "error",
      "object-shorthand": ["error", "always"],
      "prefer-template": "error",
    },
  },
  {
    files: ["src/remotion/**"],
    ...remotion.flatPlugin,
    rules: {
      ...remotion.flatPlugin.rules,
    },
  },
];
