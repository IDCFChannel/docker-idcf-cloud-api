'use strict';

const validation = require('validator');
const co = require('co');

const deploy = require('../cli/deployCommand');
const config = require('../../config');
const createCommand = require('./lib/createCommand');
const Templates = require('./lib/Templates');
const sendgrid = require('./lib/sendgrid');
const shell = require('./lib/shell');
const winston = require('winston');

function sockets(server) {
    const io = require('socket.io')(server);

    io.on('connection', (socket) => {
        winston.log('new user connected');

        socket.on('deploy', (endpoint, apiKey, secretKey, zoneName,
                             offeringName, name, email) => {
            let start = Date.now();
            let keypair = config.keypair+start;
            let privateKey = config.privateKey+start;

            let command = createCommand(endpoint, apiKey, secretKey,
                                        config.sleepTime);

            socket.emit(config.newdata, Templates.start(name, start));

            if (!validation.isEmail(email)) {
                return socket.emit(config.newdata, 'Emailが正しくありません。');
            }

            let deployGenerator = co.wrap(function* () {
                let vmInfo = yield deploy(command, name, keypair, privateKey,
                                          zoneName, offeringName, config);

                socket.emit(config.deployed, JSON.stringify(vmInfo));

                yield shell.install(socket, config.shellInstall,
                                    privateKey, name, vmInfo.publicip);

                let result = yield shell.execute(config.shellExecute,
                                                 privateKey, vmInfo.publicip);

                let devices = JSON.parse(result.replace('ssh success',''));
                let text = Templates.email(vmInfo, devices);
                let retval = sendgrid(email, text);

                socket.emit(config.newdata, retval);
                let success = yield command.exec('deleteSSHKeyPair', { name: keypair });

                console.log('delete '+keypair+' : '+success);
                console.log('Elapsed Time: ' + (Date.now() - start)/1000.0 + ' seconds');
            });

            deployGenerator()
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
