'use strict';
const co = require('co');

module.exports = co.wrap(function* (command, name) {
    let vm = yield command.exec('listVirtualMachines',
                                 { name: name })
    .then((vms) => {
        if(!vms) throw Error(name+' is not found.');
        else return vms[0];
    });

    yield command.exec('destroyVirtualMachine',
                       { id: vm.id, expunge: true })
        .then((dsJobid) => {
            return command.waitjob(dsJobid);
        });

    let retval = { name: vm.name,
                   publicip: vm.publicip};

    if (vm.publicipid){
         let ipJobresult = yield command.exec('disassociateIpAddress',
                                              { id: vm.publicipid })
            .then((ipJobid) => {
                return command.waitjob(ipJobid);
            });
        retval['ipJobresult'] = ipJobresult;
    }

    return retval;
});
