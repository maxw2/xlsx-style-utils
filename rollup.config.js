// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: "src/index.ts",
  output: {
    name: "xlsxUtils",
    file: "lib/xlsx-style-utils.js",
    format: "umd",
  },
  plugins: [resolve({browser: true}),commonjs(),typescript()],
  // , babel({ babelHelpers: "bundled" })
};
