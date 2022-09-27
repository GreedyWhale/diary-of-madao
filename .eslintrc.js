/*
 * @Description: eslint xo
 * @Author: MADAO
 * @Date: 2022-09-27 11:28:20
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-27 11:46:09
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
  overrides: [
    {
      extends: [
        'xo-typescript',
      ],
      files: [
        '*.ts',
        '*.tsx',
      ],
    },
    {
      files: ['*.ts', '*.tsx', '*.js'],
      rules: {
        indent: 'off', // https://github.com/eslint/eslint/issues/13956#issuecomment-751236261
        '@typescript-eslint/indent': ['error', 2],
        'object-curly-spacing': 'off',
        '@typescript-eslint/object-curly-spacing': ['error', 'always'],
        'no-duplicate-imports': ['error'],
        '@next/next/no-img-element': 'off',
        camelcase: 'off',
        'max-statements-per-line': ['error', { max: 2 }],
        'brace-style': ['error', '1tbs', { allowSingleLine: true }],
        '@typescript-eslint/brace-style': ['error', '1tbs', { allowSingleLine: true }],
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  plugins: [
    'react',
  ],
  rules: {
  },
};
