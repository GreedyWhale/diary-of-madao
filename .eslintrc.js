/*
 * @Author: MADAO
 * @Date: 2021-06-11 10:57:22
 * @LastEditors: MADAO
 * @LastEditTime: 2021-06-11 11:28:45
 * @Description: eslint config
 */
module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true
	},
	extends: [
		'plugin:react/recommended',
		'xo'
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 12,
		sourceType: 'module'
	},
	plugins: [
		'react',
		'@typescript-eslint'
	],
	rules: {
		'react/react-in-jsx-scope': 'off'
	}
};
