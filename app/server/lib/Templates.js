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
                'ホスト名': vmInfo.name,
                'IPアドレス': vmInfo.publicip,
                'SSHユーザー': 'root',
                'SSHパスワード': vmInfo.password,
                '管理Webアプリ': 'http://'+vmInfo.publicip+':3030',
                'Konashi.jsアプリ': 'http://jsdo.it/ma6ato/8336',
                'Port': '3030',
                'BASIC認証USER': basic.user,
                'BASIC認証Password': basic.password
            },
            devices: devices
        };
        let retval = ['IDCFチャンネルのデバイス情報',
                      '\n',
                      'WebアプリやサンプルのKonashi.jsアプリではBASIC認証を使います。',
                      '\n'].join('\n');
        return retval + yaml.safeDump(dump);
    }
};

module.exports = Templates;
