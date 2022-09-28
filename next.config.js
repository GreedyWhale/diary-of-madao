/*
 * @Description: ts config
 * @Author: MADAO
 * @Date: 2022-09-27 11:01:53
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-28 01:38:43
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    const fileLoaderRule = config.module.rules.find(
      rule => rule.test && rule.test.test('.svg'),
    );
    fileLoaderRule.exclude = /\.svg$/;
    config.module.rules.push({
      test: /\.svg$/,
      loader: require.resolve('@svgr/webpack'),
    });
    return config;
  },
};

module.exports = nextConfig;
