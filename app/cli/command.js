'use strict';

function CommandException(err, respKey) {
   this.err = err;
   this.message = err.response.body[respKey].errortext;
   this.toString = () => { return this.message };
}

function buildResponseKey(name) {
    return name.toLowerCase()+'response';
}

function baseCommand (client, cmdName, opts, result) {
    let responseKey = buildResponseKey(cmdName);
    return client.request(cmdName, opts)
        .then((res) => {
            return result(res.body[responseKey], opts);
        })
        .catch((err) => {
            throw new CommandException(err, responseKey);
        });
}

function Command (client, sleepTime) {
    let waitjob = (jobid) => {
        return client.request('queryAsyncJobResult', { jobid: jobid })
            .then((result) => {
                let jobstatus = result.body.queryasyncjobresultresponse.jobstatus;
                let jobresult = result.body.queryasyncjobresultresponse.jobresult;
                if (jobstatus === 0) {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(jobid);
                        }, sleepTime);
                    })
                    .then(waitjob);
                }
                return Promise.resolve(jobresult);
            })
            .catch((err) => {
                console.log('err', err);
                throw new Error(err.response.body.queryasyncjobresultresponse.errortext);
            });
    };

    let responseFnc = {
        listZones: (response) => {
            return response.zone;
        },
        listServiceOfferings: (response) => {
            return response.serviceoffering;
        },
        listTemplates: (response) => {
            return response.template[0].id;
        },
        listNetworks: (response) => {
            return response.network;
        },
        listNetworkOfferings: (response) => {
            return response;
        },
        listVirtualMachines: (response) => {
            return response.virtualmachine;
        },
        deployVirtualMachine: (response) => {
            return response.jobid;
        },
        destroyVirtualMachine: (response) => {
            return response.jobid;
        },
        associateIpAddress: (response) => {
            return response.jobid;
        },
        disassociateIpAddress: (response) => {
            return response.jobid;
        },
        listPublicIpAddresses: (response) => {
            return response.publicipaddress;
        },
        enableStaticNat: (response) => {
            return response.success;
        },
        createFirewallRule: (response) => {
            return response.jobid;
        },
        resetPasswordForVirtualMachine: (response) => {
            return response.jobid;
        },
        createSSHKeyPair: (response) => {
            return response.keypair.privatekey;
        },
        deleteSSHKeyPair: (response) => {
            return response.success;
        },
        listSSHKeyPairs: (response) => {
            return response.sshkeypair[0].name;
        }
    };

    return {
        waitjob: waitjob,
        exec: (key, opts) => {
            return baseCommand(client, key, opts,
                               responseFnc[key]);
        }
    }
};

module.exports = Command;
