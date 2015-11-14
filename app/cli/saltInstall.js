'use strict';
const co = require('co');
const common = require('./common');

module.exports = co.wrap(function* (command, publicip, keypair, script) {
    yield common.runScript(script, publicip);
    let success = yield command.exec('deleteSSHKeyPair', { name: keypair });
    return success;
});
