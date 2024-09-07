const globals = require("globals");
const pluginJs = require("@eslint/js");

module.exports = [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
];
