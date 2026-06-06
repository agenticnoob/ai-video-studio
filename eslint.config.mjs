import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import remotion from "@remotion/eslint-plugin";
import tseslint from "typescript-eslint";

// Build Next.js recommended rules and an "off" map for overrides
const nextRecommended = nextPlugin.configs.recommended ?? { rules: {} };
const nextRecommendedRules = nextRecommended.rules ?? {};
const offNextRules = Object.fromEntries(Object.keys(nextRecommendedRules).map((k) => [k, "off"]));

export default [
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "next.config.js",
      "deploy.mjs",
      // Throwaway ad-hoc research / verification scripts (see .gitignore).
      "scripts-tmp-*.mjs",
      "scripts-tmp-*.ts",
      // MiniMax contract validation — standalone node script, not part of the app.
      "scripts/validate-minimax-contract.mjs",
    ],
  },
  // Base JS recommended
  js.configs.recommended,
  // TypeScript recommended (non type-checked for speed/simplicity)
  ...tseslint.configs.recommended,
  // Next.js recommended rules applied to app code
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextRecommendedRules,
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
  // Remotion rules applied only to remotion files
  {
    files: ["src/remotion/**"],
    ...remotion.flatPlugin,
    rules: {
      ...remotion.flatPlugin.rules,
    },
  },
  // Disable all Next.js rules within remotion files
  {
    files: ["src/remotion/**"],
    rules: {
      ...offNextRules,
    },
  },
];
