/*
 * @Description: 只用于打包src/目录
 * @Author: MADAO
 * @Date: 2021-03-12 10:29:46
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 15:09:13
 */
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { join } = require('path');
const entries = require('./tools/entries');

module.exports = {
  mode: 'production',
  entry: entries,
  target: ['node14.15'],
  output: {
    path: join(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: { loader: 'babel-loader' },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '~': join(__dirname, './'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  externals: [
    nodeExternals(),
  ],
  externalsPresets: {
    node: true,
  },
  optimization: {
    usedExports: false,
    minimize: false,
  },
};
