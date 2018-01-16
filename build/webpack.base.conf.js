var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
var entry = require('../src/plugin/entry')("src/test/*.js", {base: "src/test", template: {
  template: resolve("src/test/selection.html"),
  filename: resolve('dist/selection'),
  chunks: ["."]
}});
var HtmlWebpackPlugin = require('html-webpack-plugin')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: entry.js,
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.less'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      '@components': resolve('src/components'),
    }
  },
  module: {
    rules: [
      // {
      //   test: require.resolve('jquery'),
      //   use: [{
      //     loader: 'expose-loader',
      //     options: 'jQuery'
      //   },{
      //     loader: 'expose-loader',
      //     options: '$'
      //   }]
      // },
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
        include: [resolve('src'), resolve('test')]
      },
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
    // https://github.com/ampedandwired/html-webpack-plugin
    ...entry.html.map(html => (console.log(JSON.stringify(html)),new HtmlWebpackPlugin(html))),
    // new HtmlWebpackPlugin({
    //   filename: resolve('dist/selection.html'),
    //   template: 'src/test/selection.html',
    //   chunks: ["selection"],
    //   inject: true,
    //   minify: htmlConfig.minify,
    //   // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    //   chunksSortMode: 'dependency'
    // }),
    // new ExtractTextWebpackPlugin({
    //   filename: '[name].css'
    // }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ],
  externals: {
    // "Vue": "window.Vue",
  }
}
