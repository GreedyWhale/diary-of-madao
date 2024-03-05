/*
 * @Description: https://github.com/ota-meshi/eslint-plugin-astro
 * @Author: MADAO
 * @Date: 2024-01-30 16:47:50
 * @LastEditors: MADAO
 * @LastEditTime: 2024-02-29 16:02:49
 */
module.exports = {
  extends: [
    "plugin:astro/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:svelte/recommended",
  ],
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
    {
      files: ["*.astro"],
      processor: "astro/client-side-ts",
      rules: {},
    },
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".svelte"],
      },
    },
    {
      files: ["*.d.ts", "*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
  ],
  rules: {
    indent: ["error", 2, { offsetTernaryExpressions: true, SwitchCase: 1 }],
    semi: ["error", "always"],
    "object-curly-spacing": ["error", "always"],
  },
};
