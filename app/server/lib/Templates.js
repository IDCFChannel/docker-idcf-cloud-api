'use strict';

const yaml = require('js-yaml');
const Mustache = require('mustache');
const moment = require ('moment-timezone');

const Templates = {
    start: function(name, start) {
        let view = {
            name: name,
            time: moment(start,'x').tz('Asia/Tokyo').format()
        };
        let tpl = '{{name}} starts a deployment at {{time}}.\nplease wait a few minutes.\n';
        return Mustache.render(tpl, view);
    },
    email: function(vmInfo, devices, basic) {
        let dump = {
            server: {
                hostname: vmInfo.name,
                publicip: vmInfo.publicip,
                user: 'root',
                password: vmInfo.password,
                manage_app: 'http://'+vmInfo.publicip+':3030',
                manage_user: basic.user,
                manage_password: basic.password
            },
            devices: devices
        };
        let retval = '# IDCFチャンネルのデバイス情報\n\n';
        return retval + yaml.safeDump(dump);
    }
};

module.exports = Templates;
