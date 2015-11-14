'use strict';
const co = require('co');
const common = require('./common');
const thunkify = require('thunkify');
const fs = require('fs');
const writeFile = thunkify(fs.writeFile);
const appendFile = thunkify(fs.appendFile);

module.exports = co.wrap(function* (command, name, keypair, privateKey,
                                    zoneName, offeringName, config) {
    let zone = yield command.exec('listZones',
                                  { name: zoneName });
    let zoneid = zone[0].id;

    let privateKeyString = yield command.exec('createSSHKeyPair',
                                              { name: keypair });

    yield writeFile(privateKey, privateKeyString, {mode: '600'});

    let offering = yield command.exec('listServiceOfferings',
                            { name: offeringName });
    let offeringid = offering[0].id;

    let deployInfo = yield {
        name: name,
        zoneid: zoneid,
        serviceofferingid: offeringid,
        templateid: command.exec('listTemplates',
                                 { zoneid: zoneid,
                                   templatefilter: config.templatefilter,
                                   name: config.template }),
        keypair: keypair
    };

    let vmInfo = yield command.exec('deployVirtualMachine', deployInfo
                       )
                       .then(vmJobid => {
                           return command.waitjob(vmJobid);
                       })
                       .then(vmJobresult => {
                           return common.pluckDispVm(
                               vmJobresult.virtualmachine
                           );
                       })
                       .catch((err) => {
                           throw err;
                       });

    let ipInfo = yield command.exec('associateIpAddress',
                                    { zoneid: zoneid }
        )
        .then(ipJobid => {
            return command.waitjob(ipJobid);
        })
        .then(ipJobresult => {
            return {
                ipaddress: ipJobresult.ipaddress.ipaddress,
                ipaddressid: ipJobresult.ipaddress.id
            }
        })
        .catch((err) => {
            throw err;
        });

    vmInfo['publicip'] = ipInfo.ipaddress;

    yield command.exec('enableStaticNat',
                       { ipaddressid: ipInfo.ipaddressid,
                         virtualmachineid: vmInfo.id }
          )
          .then(staticNatSuccess => {
              if (staticNatSuccess != 'true') {
                  throw new Error('static nat failure: ', vmInfo);
              }
          })
          .catch((err) => {
              throw err;
          });

    yield config.ports.map(port =>
                           command.exec('createFirewallRule',
                                        { ipaddressid: ipInfo.ipaddressid,
                                          protocol: config.protocol,
                                          cidrlist: config.cidrlist,
                                          startport: port,
                                          endport: port }
                           )
                           .then((jobid) => {
                               return command.waitjob(jobid);
                           })
                           .then((fwJobresult) => {
                               return fwJobresult;
                           })
                           .catch((err) => {
                               throw err;
                           })
    );

    yield appendFile(config.vms, JSON.stringify(vmInfo));
    return vmInfo;
});
