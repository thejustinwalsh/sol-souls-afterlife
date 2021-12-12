const withTM = require('next-transpile-modules')([
  '@solana/wallet-adapter-base',
  '@solana/wallet-adapter-react',
  '@solana/wallet-adapter-react-ui',
  '@solana/wallet-adapter-phantom',
]);

/** @type {import('next').NextConfig} */
module.exports = withTM({
  reactStrictMode: true,
});
