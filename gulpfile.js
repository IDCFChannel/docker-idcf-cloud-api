'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const nodemon = require('gulp-nodemon');
const config = require('./config');
const webpackConfig = require('./webpack.config.production');
const webpack = require('webpack');
//const WebpackDevServer = require('webpack-dev-server');

gulp.task('nodemon', () => {
  nodemon({
      script: './app/server/index.js',
      ext: 'js',
      watch: ['./app/server'],
      env: { 'NODE_ENV': 'development' }
  })
});

gulp.task('webpack', (callback) => {
    let myConfig = Object.create(webpackConfig);
/*
    myConfig.plugins = myConfig.plugins.concat(
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
            }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({ sourceMap: false } )
    );
*/
    webpack(myConfig, function(err, stats) {
        if(err) throw new gutil.PluginError('webpack', err);
        gutil.log('[webpack]', stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task('lint', () => {
    return gulp.src(config.gulpServerSrc)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('watch', () => {
    gulp.watch([config.gulpServerSrc, config.gulpCliSrc], ['lint']);
});

gulp.task('test', () => {
    process.env.NODE_ENV = 'test';
    return gulp.src([config.gulpTestSrc], { read: false })
        .pipe(mocha({ reporter: 'nyan' }));
});

gulp.task('default', ['watch']);
