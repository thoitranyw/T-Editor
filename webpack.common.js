const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const NodeEnvPlugin = require("node-env-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');

Object.assign(defineEnv, { OUTPUT_CSS: JSON.stringify(outputCSS) });

const config = {
  entry: {
    main: path.resolve(__dirname, "src/index.js")
  },
  output: {
    filename: 't-editor',
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: [".js", ".scss"]
  },
  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: {
                sourceMap: true
            }
          },
          {
              loader: "resolve-url-loader"
          },
          {
              loader: "sass-loader",
              options: {
                  sourceMap: true
              }
          }
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
          }
        ]
      }
    ]
  },
  optimization: {},
  plugins: [
    new NodeEnvPlugin(),
    new webpack.DefinePlugin(defineEnv),
    new MiniCssExtractPlugin({
      filename: outputCSS
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: "./index.html",
      filename: "index.html",
      nameJS: outputJS
    })
  ]
};

module.exports = config;
