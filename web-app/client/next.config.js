/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const StylelintPlugin = require("stylelint-webpack-plugin");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack: (config) => {
    config.plugins.push(new StylelintPlugin());
    return config;
  }
};
