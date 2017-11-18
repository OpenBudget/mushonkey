'use strict';

const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglify-js-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }),
  new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: process.env.NODE_ENV === "development"
  }),
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, './app/index.html')
  })
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(new UglifyJsPlugin({
    sourceMap: true
  }));
}

module.exports = {
  entry: {
    'main': [
      './app/index.ts',
      './assets/styles/mushonkey.less'
    ]
  },
  output: {
    path: path.resolve(__dirname, 'temp'),
    filename: '[name].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          use: [{loader: 'raw-loader'}, {loader: 'less-loader'}]
        })
      },
      {
        test: /\.html$/,
        loader: 'raw-loader'
      }
    ]
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js', '.html', '.less', '.css']
  },
  plugins: plugins,
  devServer: {
    port: process.env.PORT || '4000',
    inline: true,
    historyApiFallback: true,
    contentBase: __dirname,
    stats: {
      modules: false
    }
  }
};
