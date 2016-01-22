'use strict';
const webpack = require('webpack');
const path = require('path');
module.exports = {
    devtool: 'eval-source-map',
    entry: [
        'webpack-hot-middleware/client',
        path.join(__dirname, 'app/client/js/main.js')
    ],
    output: {
        path: path.join(__dirname, 'dist/js'),
        filename: '[name].js',
        publicPath: '/js/'
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    module: {
        preLoaders: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: "eslint"
        }],

        loaders: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel'
        }, {
            test: /bootstrap\/js\//,
            loader: 'imports?jQuery=jquery'
        }, {
            test   : /\.css$/,
            loader : 'style!css'
        }, {
            test   : /\.less$/,
            loader : 'style!css!less'
        }, {
            test: /\.(png|woff|woff2|eot|ttf|svg)$/,
            loader: 'url?limit=100000'
        }],
        resolve: {
            extensions: ['', '.js']
        }
    },
    eslint: {
        configFile: '.eslintrc'
    },
};
