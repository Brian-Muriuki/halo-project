import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Base ESLint configuration from Next.js
const nextConfig = [...compat.extends("next/core-web-vitals")];

// Custom rules to enforce consistent import patterns
const customRules = [
  {
    // Rule to enforce using @/ imports for internal paths
    rules: {
      "import/no-relative-parent-imports": "error", // Prevents "../" imports
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message: "Use @/ import pattern instead of relative parent imports"
            }
          ]
        }
      ]
    }
  }
];

const eslintConfig = [...nextConfig, ...customRules];

export default eslintConfig;
