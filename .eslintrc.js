module.exports = {
	"env": {
		"browser": true,
		"node": true,
		"commonjs": true,
		"es6": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 2018
	},
	"rules": {
		"no-trailing-spaces": ["error", { "skipBlankLines": false, "ignoreComments": true }],
		"comma-spacing": ["error", { "before": false, "after": true }],
		"eol-last": ["error", "always"],
		"indent": ["error", "tab"],
		"key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
		"semi": ["error", "always"],
		"no-eval": ["error"],
		"no-buffer-constructor": ["error"],
		"space-before-blocks": ["error", { "functions": "always", "keywords": "always", "classes": "always" }],
		"block-spacing": ["error"],
		"no-var": ["warn"],
		"eqeqeq": ["warn", "always", { "null": "ignore" }],
		"handle-callback-err": ["error"],
		"default-case": ["warn"],
		"prefer-promise-reject-errors": ["warn"],
	},
	"plugins": [
		"security"
	],
	"extends": [
		"plugin:security/recommended"
	]
};
