/**
 * THIS FILE WAS AUTO-GENERATED.
 * PLEASE DO NOT EDIT IT MANUALLY.
 * ===============================
 * IF YOU'RE COPYING THIS INTO AN ESLINT CONFIG, REMOVE THIS COMMENT BLOCK.
 */

import path from "node:path";

import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import globals from "globals";
import { configs, plugins } from "eslint-config-airbnb-extended";
import { rules as prettierConfigRules } from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

const gitignorePath = path.resolve(".", ".gitignore");

const jsConfig = [
  // ESLint Recommended Rules
  {
    name: "js/config",
    ...js.configs.recommended,
    languageOptions: { globals: { ...globals.browser, Fuse: "readonly" } },
  },
  // Stylistic Plugin
  plugins.stylistic,
  // Import X Plugin
  plugins.importX,
  // Airbnb Base Recommended Config
  ...configs.base.recommended,
];

const testConfig = [
  {
    files: ["tests/**/*.js", "jest.config.js"],
    languageOptions: { globals: { ...globals.jest, ...globals.node } },
    plugins: {
      node: plugins.node,
      importX: plugins.importX,
    },
    rules: {
      "no-undef": "error",
      "import-x/no-extraneous-dependencies": [
        "error",
        { devDependencies: true },
      ],
      "import-x/extensions": ["off"],
      "node/no-missing-require": "off",
      "node/no-unpublished-require": "off",
      "node/no-unsupported-features/es-syntax": "off",
      "no-plusplus": "off",
      "dot-notation": "off",
    },
  },
];

const prettierConfig = [
  // Prettier Plugin
  {
    name: "prettier/plugin/config",
    plugins: {
      prettier: prettierPlugin,
    },
  },
  // Prettier Config
  {
    name: "prettier/config",
    rules: {
      ...prettierConfigRules,
      "prettier/prettier": "error",
    },
  },
];

export default [
  // Ignore the _site directory
  {
    ignores: ["_site/**"],
  },
  // Ignore .gitignore files/folder in eslint
  includeIgnoreFile(gitignorePath),
  // Javascript Config
  ...jsConfig,

  // Test Config
  ...testConfig,
  // Prettier Config
  ...prettierConfig,
];
