import antfu from "@antfu/eslint-config";
import globals from "globals";

export default antfu(
  {
    lessOpinionated: true,
    node: false,
    jsx: false,
    unicorn: false,
    test: false,
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
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.greasemonkey,
        Grant: "readonly",
        Magnet: "readonly",
        Offline: "readonly",
        Req: "readonly",
        Req115: "readonly",
        ReqDB: "readonly",
        ReqMagnet: "readonly",
        ReqSprite: "readonly",
        ReqTrailer: "readonly",
        Util: "readonly",
        Verify115: "readonly",
      },
    },
    rules: {
      "curly": ["error", "multi-line", "consistent"],
      "no-template-curly-in-string": "off",
      "no-unused-vars": "off",
      "unused-imports/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^(?:Grant|Magnet|Offline|Req(?:115|DB|Magnet|Sprite|Trailer)?|Util|Verify115)$",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
);
