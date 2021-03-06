'use strict';


const Mustache = require('mustache');
const yaml = require('js-yaml');
const should = require('chai').should();
const Templates = require('../../../app/server/lib/Templates');

describe('Mustache templates', () => {
    let vmInfo = {
        name: 'a',
        password: 'b',
        publicip: '127.0.0.1'
    };

    let sshView = {
        hostname: vmInfo.name,
        password: vmInfo.password,
        publicip: vmInfo.publicip
    };

    let devices = [{
        keyword: 'a',
        uuid: '11',
        token: '22'
    },{
        keyword: 'b',
        uuid: '33',
        token: '44'
    }];

    let basic = {
        user: 'user',
        password: 'password'
    };
    it('should render email body with devices', () => {
        let emailBody = Templates.email(vmInfo, devices, basic);
        emailBody.should.equal(`# IDCFチャンネルのデバイス情報

server:
  hostname: a
  publicip: 127.0.0.1
  user: root
  password: b
  manage_app: 'http://127.0.0.1:3030'
  manage_user: user
  manage_password: password
devices:
  - keyword: a
    uuid: '11'
    token: '22'
  - keyword: b
    uuid: '33'
    token: '44'
`);

    });

    it('dumps yaml', () => {

        let dump = {
            ssh: sshView,
            devices: devices
        };

        let yamlText = yaml.safeDump(dump);
        yamlText.should.equal(`ssh:
  hostname: a
  password: b
  publicip: 127.0.0.1
devices:
  - keyword: a
    uuid: '11'
    token: '22'
  - keyword: b
    uuid: '33'
    token: '44'
`);

    });

    it('renders ssh text', () => {
        let sshTpl = [
            'hostname: {{hostname}}',
            'password: {{password}}',
            'ssh root@{{publicip}} -o PreferredAuthentications=password'
        ].join('\n');

        let sshText = Mustache.render(sshTpl, sshView);
        sshText.should.equal(`hostname: a
password: b
ssh root@127.0.0.1 -o PreferredAuthentications=password`);
    });

    it('renders devices text', () => {
        let devicesTpl = [
            '{{#devices}}',
            '{{keyword}}',
            '{{uuid}}',
            '{{token}}',
            '{{/devices}}'
        ].join('\n');

        let devicesText = Mustache.render(devicesTpl, {devices:devices});
        devicesText.should.equal(`a
11
22
b
33
44
`);
    });
});
