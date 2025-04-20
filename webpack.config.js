const path = require("node:path");

/** @return {import("webpack").Configuration} */
module.exports = (env, argv) => ({ // eslint-disable-line unicorn/no-anonymous-default-export
  mode: argv.mode ?? "production",
  devtool: argv.mode === "development" ? "cheap-module-source-map" : "source-map",
  entry: "./src/main.jsx",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              "babel-plugin-transform-redom-jsx",
              [
                "@babel/plugin-transform-react-jsx",
                {
                  pragma: "el",
                },
              ],
            ],
          },
        },
      },
    ],
  },
  experiments: {
    topLevelAwait: true,
  },
  resolve: {
    extensions: [".jsx", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public"),
  },
  node: false,
  devServer: {
    allowedHosts: "all",
    port: 3333,
    static: {
      directory: path.resolve(__dirname, "public"),
    },
  },
});
