/*
 * @Description: https://cn.eslint.org/docs/user-guide/configuring
 * @Author: MADAO
 * @Date: 2021-12-04 11:52:57
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-13 15:39:09
 */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:react/recommended',
    'xo',
    'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 13,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    indent: 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/indent': ['error', 2],
    'object-curly-spacing': ['error', 'always'],
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'operator-linebreak': ['error', 'before'],
    'capitalized-comments': 'off',
  },
  globals: {
    AsyncReturnType: 'readonly',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.d.ts'],
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
};
