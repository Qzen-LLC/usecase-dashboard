import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    ignores: [
      "**/src/generated/**",
      "**/prisma/migrations/**",
      "**/node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "**/wasm.js",
      "**/wasm-*.js",
      "**/runtime/*.js",
      "**/Cookies/**",
      "**/Application Data/**"
    ]
  },

  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": ["warn", {
        ignoreRestArgs: true,
      }],
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-this-alias": "warn",
      // Prevent direct client-side Clerk imports; use unified modules instead
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@clerk/nextjs",
              message:
                "Do not import from @clerk/nextjs directly. Use '@/hooks/useAuthClient' for hooks and '@/components/auth' for UI components.",
            },
          ],
          patterns: [
            {
              group: ["@clerk/nextjs/*"],
              message:
                "Do not import from @clerk/nextjs/* directly. Use '@/hooks/useAuthClient' or '@/components/auth'.",
            },
          ],
        },
      ],
    }
  },

  // Allow client-side Clerk imports inside the auth client service implementation
  {
    files: ["src/services/auth/client/**"],
    rules: {
      "no-restricted-imports": "off",
    },
  },

  {
    files: [
      "**/api/**/*.ts",
      "**/lib/**/*.ts",
      "**/dashboard/**/*.tsx",
      "**/app/**/*.ts"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    }
  }
];

export default eslintConfig;
