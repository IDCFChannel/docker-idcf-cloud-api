'use strict';

const Mustache = require('mustache');
const yaml = require('js-yaml');

function test(vmInfo, devices) {
    let sshView = {
        hostname: vmInfo.name,
        password: vmInfo.password,
        publicip: vmInfo.publicip
    };

    let sshTpl = [
        'hostname: {{hostname}}',
        'password: {{password}}',
        'ssh root@{{publicip}} -o PreferredAuthentications=password'
    ].join('\n');

    let sshText = Mustache.render(sshTpl, sshView);

    let devicesTpl = [
        '{{#devices}}',
        '{{keyword}}',
        '{{uuid}}',
        '{{token}}',
        '{{/devices}}'
    ].join('\n');

    let devicesText = Mustache.render(devicesTpl, {devices:devices});
    console.log(devicesText);
    console.log(sshView);
    let dump = {
        ssh: sshView,
        devices: devices
    };
    return yaml.safeDump(dump);
}


let devices = [{
    keyword: 'a',
    uuit: '11',
    token: '22'
},{
    keyword: 'a',
    uuit: '11',
    token: '22'
}];

let vmInfo = {
    name: 'a',
    password: 'b',
    publicip: 'c'
};

console.log(test(vmInfo, devices));
