'use strict';
const webpack = require('webpack');
const path = require('path');
module.exports = {
    entry: [
        path.join(__dirname, 'app/client/js/main.js')
    ],
    output: {
        path: path.join(__dirname, 'dist/js'),
        filename: '[name].js',
        publicPath: '/js/'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
            }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({ sourceMap: false } )
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
