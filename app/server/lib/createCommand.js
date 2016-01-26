'use strict';

const idcf = require('idcf-cloud-api');

function createCommand(endpoint, apiKey, secretKey, sleepTime) {
    let client = idcf({
        endpoint: endpoint.trim(),
        apiKey: apiKey.trim(),
        secretKey: secretKey.trim()
    });
    return require('../../cli/command')(client, sleepTime);
};

module.exports = createCommand;
