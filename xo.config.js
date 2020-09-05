/** @typedef {import("xo").Options} XoOptions */

/** @type {import("@yoursunny/xo-config")} */
const { js, web, merge } = require("@yoursunny/xo-config");

/** @type {XoOptions} */
module.exports = {
  ...js,
  overrides: [
    {
      files: [
        "./src/**/*.js",
      ],
      ...merge(js, web),
    },
  ],
};
