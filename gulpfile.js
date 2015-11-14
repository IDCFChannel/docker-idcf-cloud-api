'use strict';
const gulp = require('gulp');
const gutil = require('gulp-util');
const eslint = require('gulp-eslint');
const nodemon = require('gulp-nodemon');
const config = require('./config');
const webpackConfig = require('./webpack.config');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
gulp.task('nodemon', () => {
  nodemon({
      script: './app/server/index.js',
      ext: 'js',
      watch: ['./app/server'],
      env: { 'NODE_ENV': 'development' }
  })
});

gulp.task('webpack', (callback) => {
    webpack(webpackConfig, (err, stats) => {
        if(err) throw new gutil.PluginError('webpack', err);
        gutil.log('[webpack]', stats.toString({
            // output options
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

gulp.task('default', ['watch']);
