/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const StylelintPlugin = require('stylelint-webpack-plugin');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    dirs: ['src'],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'src')],
  },
  webpack: (config) => {
    // TODO: figure out why it breaks path aliases
    // config.plugins.push(new StylelintPlugin());
    return config;
  },
};
