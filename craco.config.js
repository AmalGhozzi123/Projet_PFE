const path = require("path");
module.exports = {
  webpack: {
    alias: {
      "@layout": path.resolve(__dirname, "src/layout"),
      "@components": path.resolve(__dirname, "src/components"),
      "@layout": path.resolve(__dirname, "src/layout"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@models": path.resolve(__dirname, "src/models"),
      "@constants": path.resolve(__dirname, "src/constants"),
    },
  },
};
