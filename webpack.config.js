const path = require("path");

module.exports = (env, argv) => ({
  entry: "./src/main.js",
  devtool: argv.mode === "development" ? "cheap-module-eval-source-map" : "source-map",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public"),
  },
  devServer: {
    contentBase: path.join(__dirname, "public"),
    port: 3333,
  },
});
