import { dirname } from "path"
import { fileURLToPath } from "url"

import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        rules: {
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    selector: ["variable", "function", "parameter"],
                    format: ["camelCase", "PascalCase", "UPPER_CASE"],
                    leadingUnderscore: "allowDouble",
                },
                { selector: "typeLike", format: ["PascalCase"] },
            ],
            // "@typescript-eslint/no-explicit-any": "error",
        },
    },
    {
        ignores: [
            "components/ui/**",
            "node_modules/**",
            ".next/**",
            "out/**",
            "build/**",
            "public/*.js",
            "next-env.d.ts",
        ],
    },

    // disables ESLint formatting rules, prettier handles this
    ...compat.extends("prettier"),
]

export default eslintConfig
