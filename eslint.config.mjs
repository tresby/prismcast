/* Copyright(C) 2024-2026, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * eslint.config.mjs: Linting configuration for PrismCast.
 */
import eslintJs from "@eslint/js";
import hbPluginUtils from "homebridge-plugin-utils/build/eslint-rules.mjs";
import ts from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";

export default ts.config(

  eslintJs.configs.recommended,

  {

    files: ["src/**/*.ts"],
    rules: {

      ...hbPluginUtils.rules.ts
    }
  },

  {

    files: ["eslint.config.mjs"],
    rules: {

      ...hbPluginUtils.rules.js
    }
  },

  {

    files: [ "src/**/*.ts", "eslint.config.mjs" ],

    ignores: ["dist"],

    languageOptions: {

      ecmaVersion: "latest",
      parser: tsParser,
      parserOptions: {

        ecmaVersion: "latest",

        projectService: {

          allowDefaultProject: ["eslint.config.mjs"],
          defaultProject: "./tsconfig.json"
        }
      },

      sourceType: "module"
    },

    linterOptions: {

      reportUnusedDisableDirectives: "error"
    },

    plugins: {

      ...hbPluginUtils.plugins
    },

    rules: {

      ...hbPluginUtils.rules.common
    }
  }
);
