import antfu from "@antfu/eslint-config";

export default antfu(
  {
    lessOpinionated: true,
    node: false,
    typescript: false,
    jsx: false,
    unicorn: false,
    test: false,
    vue: false,
    toml: false,
    stylistic: {
      quotes: "double",
      semi: true,
      jsx: false,
    },
    formatters: true,
  },
  {
    files: ["**/*.js"],
    rules: {
      "no-unused-vars": "off",
      "unused-imports/no-unused-vars": ["error", {
        varsIgnorePattern: "^Req",
        argsIgnorePattern: "^_",
      }],
      "curly": ["error", "multi-line", "consistent"],
    },
  },
);
