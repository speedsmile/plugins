const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        "selection/selection": "./pack/selection",
    },
    output: {
        path: path.resolve('./dist'),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        less: ExtractTextPlugin.extract({
                            use: ['css-loader?minimize'],
                            fallback: 'vue-style-loader'
                        }),
                        css: ExtractTextPlugin.extract({
                            use: ['css-loader'],
                            fallback: 'vue-style-loader'
                        })
                    }
                }
            },
            {
                test: /iview\/.*?js$/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader?minimize', 'postcss-loader'],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.less/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader?minimize', 'postcss-loader', 'less-loader'],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
                loader: 'url-loader?limit=102400'
            },
            {
                test: /\.(html|tpl)$/,
                loader: 'html-loader',
                options: {
                    attrs: [
                        'img:src',
                        'link:href'
                    ]
                }
            },
            {
                test: [ /\.js$/, /\.es6$/],
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader"
                    }
                ],
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_debugger: true,
                drop_console: true
            }
        }),
        new ExtractTextPlugin({
            filename: '[name].css'
        })
    ],
    resolve: {
      extensions: ['.js', ".vue", ".less", ".css"],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': path.resolve('src')
      }
    }
};
