/*
 * @Description: eslint xo
 * @Author: MADAO
 * @Date: 2022-09-27 11:28:20
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-31 17:48:59
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
        '@next/next/no-img-element': 'off',
        camelcase: 'off',
        'max-statements-per-line': ['error', { max: 2 }],
        'brace-style': ['error', '1tbs', { allowSingleLine: true }],
        '@typescript-eslint/brace-style': ['error', '1tbs', { allowSingleLine: true }],
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-implicit-any-catch': 'off',
        'import/no-duplicates': ['error'],
        '@typescript-eslint/no-dynamic-delete': 'off',
        '@typescript-eslint/member-delimiter-style': [2, {
          overrides: {
            typeLiteral: {
              singleline: {
                delimiter: 'semi',
                requireLast: true,
              },
            },
          },
        }],
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-confusing-void-expression': ['error', {
          ignoreArrowShorthand: true,
        }],
        '@typescript-eslint/ban-types': ['error', {
          types: {
            null: false,
          },
        }],
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
    'prefer-promise-reject-errors': 'off',
  },
};
