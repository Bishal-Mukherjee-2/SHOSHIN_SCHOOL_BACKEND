
module.exports = {
	"require": [
		"ts-node/register",
		"source-map-support/register"
	],
	"ui": "bdd",
	"timeout": 10000,
	"colors": true,
	"exit": true,
	"recursive": true,
	"spec": [
		"tests/**/*.test.ts"
	]
}