// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
};
