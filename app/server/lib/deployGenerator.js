'use strict';

const co = require('co');
const config = require('../../../config');

const deploy = require('../../cli/deployCommand');
const Templates = require('./Templates');
const sendgrid = require('./sendgrid');
const shell = require('./shell');

module.exports = co.wrap(function* (socket, command, email, name, keypair,
                                    privateKey, zoneName, offeringName) {

    let vmInfo = yield deploy(command, name, keypair, privateKey,
                              zoneName, offeringName);

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
