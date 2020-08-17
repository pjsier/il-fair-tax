import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

export default {
  input: "src/js/index.js",
  output: {
    file: "src/_includes/index.js",
    format: "esm",
  },
  plugins: [resolve(), terser()],
}
