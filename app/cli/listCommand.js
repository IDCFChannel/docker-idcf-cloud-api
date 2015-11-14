'use strict';
const co = require('co');
const common = require('./common');

module.exports = co.wrap(function* (command, config) {
    let zone = yield command.exec('listZones',
                                    { name: config.zone });
    let zoneid = zone[0].id;
    console.log('zoneid: ', zoneid);
    let vms = yield command.exec('listVirtualMachines');
    console.log(vms.map(common.pluckDispVm));
/*
    let templates = yield command.exec('listTemplates',
                                 { zoneid: zoneid,
                                   templatefilter: config.templatefilter,
                                   name: config.template });

    console.log(templates);
*/
});
