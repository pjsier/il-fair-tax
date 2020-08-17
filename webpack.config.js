const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const config = {
  target: "web",
  devtool: "source-map",
  mode: "production",
  entry: {
    app: [path.resolve("./src/js/entry.js")],
  },
  output: {
    path: path.resolve("./dist/static"),
    filename:
      process.env.NODE_ENV === "production"
        ? "[name].[chunkhash].js"
        : "[name].js",
    publicPath: "/static/",
  },
  optimization:
    process.env.NODE_ENV === "production"
      ? {
          minimize: true,
          minimizer: [
            new TerserPlugin({ cache: true, parallel: true, sourceMap: true }),
            new OptimizeCSSAssetsPlugin({}),
          ],
        }
      : {},
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\//,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    debug: true,
                    targets:
                      process.env.NODE_ENV === "production"
                        ? [">1%", "ie 11", "not op_mini all"]
                        : ["Last 2 Firefox versions"],
                    useBuiltIns: "usage",
                    corejs: 3,
                    modules: false,
                  },
                ],
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [require("autoprefixer")],
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[contenthash].[ext]",
              outputPath: "images",
            },
          },
        ],
      },
    ],
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename:
        process.env.NODE_ENV === "production"
          ? "[name].[hash].css"
          : "[name].css",
    }),
    new HtmlWebpackPlugin({
      template: path.resolve("./site/_includes/webpack.html"),
      filename: path.resolve("./site/_includes/webpack.njk"),
      hash: true,
      inject: false,
    }),
  ],
  resolve: {
    extensions: [".js"],
  },
  watchOptions: {
    poll: true,
  },
}

module.exports = config
