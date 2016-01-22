'use strict';

//require('babel-core/register');
//module.exports = require('./server');

const config = require('../../config');
const app = require('./server');

const server = app.listen(config.port);
require('./sockets')(server);
