var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
var entry = require('../src/modules/entry')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var htmlConfig = {
  minify: {
    removeComments: true, // 清除html中注释的部分
    // collapseWhitespace: true, // 清除空格，压缩html
    // collapseBooleanAttributes: true, // 省略布尔属性的值，比如：<input checked="checked"/>,那么设置这个属性后，就会变成 <input checked/>;
    // removeEmptyAttributes: true, // 清除所有的空属性（自定义属性不会被清除）
    // removeScriptTypeAttributes: true, // 清除所有script标签中的type="text/javascript"属性
    // removeStyleLinkTypeAttributes: true, // 清除所有Link标签上的type属性
    // minifyJS: true, // 压缩html中的javascript代码
    // minifyCSS: true // 压缩html中的css代码
  }
}

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: entry("src/test", {base: "src/test"}),
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
      new HtmlWebpackPlugin({
          filename: resolve('dist/selection.html'),
          template: 'src/test/selection.html',
          chunks: ["selection"],
          inject: true,
          minify: htmlConfig.minify,
          // necessary to consistently work with multiple chunks via CommonsChunkPlugin
          chunksSortMode: 'dependency'
      }),
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
