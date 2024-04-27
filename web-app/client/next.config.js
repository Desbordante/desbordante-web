/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
// const { serverGraphQLEndpoint, cmsGraphQLEndpoint, serverProxyURL, cmsProxyURL } = require('./src/constants/endpoints');
const StylelintPlugin = require('stylelint-webpack-plugin');
const rewrites = require('./proxy.config.js');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'src')],
  },
  webpack: (config) => {
    config.plugins.push(new StylelintPlugin());

    config.module.rules.push(
      {
        test: /\.svg$/i,
        type: 'asset',
        resourceQuery: { not: [/component/] },
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: /component/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              typescript: true,
              expandProps: 'end',
              replaceAttrValues: { '#000001': 'currentColor' },
              svgoConfig: {
                plugins: [
                  {
                    name: 'removeViewBox',
                    active: false,
                  },
                ],
              },
            },
          },
        ],
      }
    );

    return config;
  },
  rewrites,
};
