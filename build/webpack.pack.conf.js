var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
let property = require("../config/property")
var Entry = require('../src/plugin/entry');
var HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}
console.log(utils.assetsPath('img/[name].[hash:7].[ext]'))

module.exports = {
  // entry: entry.js,
  entry: {
    "ajax-promise": "./src/lib/ajax/ajax-promise",
    // "mint-ui/index": "./pack/mint-ui/index",
    "NumberFormat": "./src/plugin/util/Number/cmd",
    "VForm.cmd": "./src/plugin/VForm/VForm.cmd"
    // "Selection.cmd": "./src/components/selection/cmd"
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: "pack"
  },
  resolve: {
    extensions: ['.js', ".vue", ".less", ".css"],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: vueLoaderConfig
          },
          {
            loader: 'iview-loader',
            options: {
              prefix: false
            }
          }
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/iview/src')]
      },
      ...utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, extract: true}),
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        drop_debugger: true,
        drop_console: true,
        warnings: true
      },
      sourceMap: false
    }),
    // new ExtractTextPlugin("selection.css"),
    // new ExtractTextPlugin("mint-ui.css"),
    //...entry.html.map(html => new HtmlWebpackPlugin(html))
    // new webpack.ProvidePlugin({
    //   $: "jquery",
    //   jQuery: "jquery"
    // })
  ],
  externals: {
  }
}
