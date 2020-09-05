import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

export default [
  {
    input: "src/js/calculator.js",
    output: {
      file: "site/_includes/calculator.js",
      format: "esm",
    },
    plugins: [
      resolve(),
      ...(process.env.NODE_ENV === "production" ? [terser()] : []),
    ],
  },
]
