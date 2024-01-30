/*
 * @Description: https://github.com/ota-meshi/eslint-plugin-astro
 * @Author: MADAO
 * @Date: 2024-01-30 16:47:50
 * @LastEditors: MADAO
 * @LastEditTime: 2024-01-30 17:07:54
 */
module.exports = {
  extends: [
    "plugin:astro/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
      rules: {
        "indent": ["error", 2],
        "semi": ["error", "always"],
        "object-curly-spacing": ["error", "always"]
      },
    },
  ],
}