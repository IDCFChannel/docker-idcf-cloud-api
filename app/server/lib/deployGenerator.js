'use strict';

const co = require('co');
const config = require('../../../config');

const deploy = require('../../cli/deployCommand');
const Templates = require('./Templates');
const sendgrid = require('./sendgrid');
const shell = require('./shell');

module.exports = co.wrap(function* (socket, command, email, start,
                                    name, keypair, privateKey, zoneName, offeringName) {

    let vmInfo = yield deploy(command, name, keypair, privateKey,
                              zoneName, offeringName);

    socket.emit(config.deployed, JSON.stringify(vmInfo));

    yield shell.install(socket, config.shellInstall,
                        privateKey, name, vmInfo.publicip);

    let basicRes = yield shell.execute(config.shellBasic,
                                     privateKey, vmInfo.publicip);

    let basic = JSON.parse(basicRes.replace('ssh success',''));
    let devicesRes = yield shell.execute(config.shellDevices,
                                     privateKey, vmInfo.publicip);

    let devices = JSON.parse(devicesRes.replace('ssh success',''));
    let text = Templates.email(vmInfo, devices, basic);
    let retval = sendgrid(email, text);

    socket.emit(config.newdata, retval);
    let success = yield command.exec('deleteSSHKeyPair', { name: keypair });

    console.log('delete '+keypair+' : '+success);
    console.log('Elapsed Time: ' + (Date.now() - start)/1000.0 + ' seconds');
});
