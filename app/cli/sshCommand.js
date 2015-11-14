'use strict';
const co = require('co');

module.exports = co.wrap(function* (command, subcmd, name) {
    try {
        let privatekey  = yield command.exec(subcmd, { name: name });
        console.log(privatekey);
    } catch (err) {
        console.log(err.message.toString());
    }
});
