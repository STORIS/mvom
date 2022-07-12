const { rules: baseRules } = require("@storis/eslint-config/nodejs");

const baseNamingRules =
  baseRules["@typescript-eslint/naming-convention"].slice(1);

module.exports = {
  extends: ["@storis/eslint-config/nodejs"],

  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.eslint.json"],
  },

  rules: {
    // set up naming convention rules
    "@typescript-eslint/naming-convention": [
      "error",
      // allow PascalCase functions
      { selector: "function", format: ["camelCase", "PascalCase"] },
      ...baseNamingRules,
    ],

    "import/no-default-export": "off",
    "import/prefer-default-export": "error",
  },

  overrides: [
    {
      files: ["./.*.js", "./*.js"],
      rules: {
        // allow requires in config files
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
