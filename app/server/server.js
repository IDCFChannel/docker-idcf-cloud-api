'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');

const config = require('../../config');
const createCommand = require('./lib/createCommand');

const app = module.exports = express();

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

if(isDevelopment) {
    const webpack = require('webpack');
    const webpackConfig = require('../../webpack.config.js');
    const compiler = webpack(webpackConfig);

    app.use(require('webpack-dev-middleware')(compiler, {
        noInfo: true, publicPath: webpackConfig.output.publicPath
    }));
    app.use(require('webpack-hot-middleware')(compiler));
}

app.use(favicon(path.join(config.distDir, 'images/favicon.ico')));
app.use(express.static(config.distDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(config.distDir, 'index.html'));
});

app.use((req, res, next) => {
    req.command = createCommand(req.query.endpoint,
                                req.query.apiKey,
                                req.query.secretKey,
                                config.sleepTime
                               );
    next();
});

app.use('/api', require('./routes'));

//if(!isTest) {
//const server = app.listen(config.port);
//require('./sockets')(server);
//}
