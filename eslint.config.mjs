import {dirname} from "path";
import {fileURLToPath} from "url";

import {FlatCompat} from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: [".next/**", "out/**", "build/**", "node_modules/**", "coverage/**", "next-env.d.ts"],
    },

    ...compat.extends("next/core-web-vitals", "next/typescript"),

    {
        rules: {
            "jsx-a11y/alt-text": "error",
            "jsx-a11y/aria-props": "error",
            "jsx-a11y/aria-proptypes": "error",
            "jsx-a11y/aria-unsupported-elements": "error",
            "jsx-a11y/role-has-required-aria-props": "error",
            "jsx-a11y/role-supports-aria-props": "error",

            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            "no-console": ["warn", {allow: ["warn", "error"]}],
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn", {argsIgnorePattern: "^_", varsIgnorePattern: "^_"}],
            "prefer-const": "error",
            "no-var": "error",
            "eqeqeq": ["error", "always"],

            "import/no-duplicates": "error",
            "import/order": ["warn", {
                "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
                "newlines-between": "always",
                "alphabetize": {"order": "asc", "caseInsensitive": true}
            }],
        }
    },

    {
        // The logger module is the sanctioned console abstraction: every other
        // file is expected to log through it instead of calling console.* directly.
        files: ["src/utils/logger.ts"],
        rules: {
            "no-console": "off",
        }
    }
];

export default eslintConfig;
