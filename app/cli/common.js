'use strict';
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

function runScript(script, vmInfo, privateKey, config) {
    return new Promise((resolve, reject) => {
        let myProcess = spawn('bash', [config.runner, script, vmInfo.publicip,
                                       privateKey, config.master], {
                                           stdio: [
                                               process.stdin,
                                               process.stdout,
                                               process.stderr,
                                           ]});

        myProcess.on('close', (code) => {
            if (code == 0) resolve(vmInfo);
            else reject();
        });
    });
}

module.exports = {
    runScript: runScript,
    pluckDispVm: (vm) => {
        return {
            id: vm.id,
            name: vm.name,
            state: vm.state,
            created: vm.created,
            templatename: vm.templatename,
            serviceofferingname: vm.serviceofferingname,
            ipaddress: vm.nic[0].ipaddress,
            keypair: vm.keypair,
            password: vm.password
        };
    }
}
