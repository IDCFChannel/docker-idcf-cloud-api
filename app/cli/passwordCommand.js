'use strict';
const co = require('co');

module.exports = co.wrap(function* (command, name) {
    let vms = yield command.exec('listVirtualMachines',
                                 { name: name });
    let vm = vms[0];

    let pwJobid = yield command.exec('resetPasswordForVirtualMachine',
                                     { id: vm.id });
    let pwJobresult = yield command.waitjob(pwJobid);
    let password = pwJobresult.virtualmachine.password;
    console.log(vm.name+' new password: '+password);
    console.log('ssh -o PreferredAuthentications=password root@'+vm.publicip);
});
