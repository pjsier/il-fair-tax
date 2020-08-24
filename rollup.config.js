import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

export default [
  {
    input: "src/js/index.js",
    output: {
      file: "site/_includes/index.js",
      format: "esm",
    },
    plugins: [resolve(), terser()],
  },
  {
    input: "src/js/calculator.js",
    output: {
      file: "site/_includes/calculator.js",
      format: "esm",
    },
    plugins: [resolve(), terser()],
  },
]
