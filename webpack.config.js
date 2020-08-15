const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const config = {
  target: "web",
  devtool: "source-map",
  mode: "development",
  entry: {
    app: [path.resolve("./src/js/index.js")],
  },
  output: {
    path: path.resolve("./dist/static"),
    filename: "[name].js",
    publicPath: "/static/",
  },
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
                    targets: [
                      "last 2 Firefox versions",
                      "last 2 Chrome versions",
                    ],
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
    new MiniCssExtractPlugin({ filename: "[name].css" }),
    new HtmlWebpackPlugin({
      template: path.resolve("./src/_includes/webpack.html"),
      filename: path.resolve("./src/_includes/webpack.njk"),
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
