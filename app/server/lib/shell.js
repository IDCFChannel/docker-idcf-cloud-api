'use strict';

const spawn = require('child_process').spawn;
const config = require('../../../config');

function install(socket, script, privateKey, name, publicip) {
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

function execute(script, privateKey, publicip) {
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

module.exports = {
    install: install,
    execute: execute
};
