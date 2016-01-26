'use strict';

const validation = require('validator');
const co = require('co');
const winston = require('winston');

const deploy = require('../cli/deployCommand');
const config = require('../../config');
const createCommand = require('./lib/createCommand');
const Templates = require('./lib/Templates');
const sendgrid = require('./lib/sendgrid');
const shell = require('./lib/shell');
const deployGenerator = require('./lib/deployGenerator');

function hasErrors(endpoint, apiKey, secretKey, email) {
    let errors = [];

    if (!endpoint) {
        errors.push('endpointがありません。');
    }
    if (!apiKey) {
        errors.push('apiKeyがありません。');
    }
    if (!secretKey) {
        errors.push('secretKeyがありません。');
    }
    if (!validation.isEmail(email)) {
        errors.push('Emailが正しくありません。');
    }

    return errors;
}

function sockets(server) {
    const io = require('socket.io')(server);

    io.on('connection', (socket) => {
        winston.log('new user connected');

        socket.on('deploy', (endpoint, apiKey, secretKey, zoneName,
                             offeringName, name, email) => {
            let start = Date.now();
            let keypair = config.keypair+start;
            let privateKey = config.privateKey+start;

            let errors = hasErrors(endpoint, apiKey, secretKey, email);

            if (errors.length) {
                return socket.emit(config.newdata, errors.join('\n'));
            }

            let command = createCommand(endpoint, apiKey, secretKey,
                                        config.sleepTime);

            socket.emit(config.newdata, Templates.start(name, start));

            deployGenerator(socket, command, email, start,
                            name, keypair, privateKey, zoneName, offeringName)
                .catch((err) => {
                    console.log(err.stack || e);

                    socket.emit(newdata, err.toString());
                    command.exec('deleteSSHKeyPair', { name: keypair })
                        .then((success) => {
                            console.log('delete '+keypair+' : '+success);
                        });
                });
        });

        socket.on('disconnect', () => {
            winston.log('user disconnected');
        });
    });
}

module.exports = sockets;
