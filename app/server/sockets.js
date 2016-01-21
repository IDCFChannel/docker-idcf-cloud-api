'use strict';

const spawn = require('child_process').spawn;
const validation = require('validator');
const co = require('co');

const deploy = require('../cli/deployCommand');
const config = require('../../config');
const createCommand = require('./lib/createCommand');
const Templates = require('./lib/Templates');
const sendgrid = require('./lib/sendgrid');


function shellInstall(socket, script, privateKey, name, publicip) {
    return new Promise((resolve, reject) => {
        let myProcess = spawn('bash', [config.runner,
                                       script, publicip,
                                       privateKey, config.master]);
        myProcess.stdout.on('data', (data) => {
            console.log(data.toString());
            socket.emit(config.newdata, data.toString());
        });
        myProcess.stderr.on('data', (data) => {
            console.log('err: '+data.toString());
            socket.emit(config.newdata, data.toString());
        });
        myProcess.on('close', (code) => {
            if (code == 0)  resolve();
            else  reject("code: "+code+" name: "+name);
        });
    });
}

function shellExecute(script, privateKey, publicip) {
    return new Promise((resolve, reject) => {
        let myProcess = spawn('bash', [config.runner,
                                       script, publicip,
                                       privateKey, config.master]);
        let result = '';
        myProcess.stdout.on('data', (data) => {
            result += data.toString();
        });
        myProcess.stderr.on('data', (data) => {
            console.log('err: '+data.toString());
        });
        myProcess.on('close', (code) => {
            if (code == 0)  resolve(result);
            else  reject("code: "+code);
        });
    });
}

function sockets(server) {
    const io = require('socket.io')(server);

    io.on('connection', (socket) => {
        console.log('new user connected');

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

                yield shellInstall(socket, 'masterless.sh', privateKey, name, vmInfo.publicip);

                let result = yield shellExecute('devices.sh', privateKey, vmInfo.publicip);

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
            console.log('user disconnected');
        });
    });
}

module.exports = sockets;
