'use strict';
const path = require('path');

const rootDir = '/app';
const appDir = path.join(rootDir, 'app');
const dataDir = path.join(rootDir, 'data');
const distDir = path.join(rootDir, 'dist');
const keysDir = path.join('/dist', 'keys');

const shDir = path.join(appDir, 'sh');
const serverDir = path.join(appDir, 'server');
const cliDir = path.join(appDir, 'cli');

const config = {
    gulpServerSrc: serverDir+'/*.js',
    gulpCliSrc: cliDir+'/*.js',
    keysDir: keysDir,
    distDir: distDir,
    username: 'root',
    runner: path.join(shDir, 'runner.sh'),
    vms: path.join(dataDir, 'vms.json'),
    endpoint: process.env.IDCF_COMPUTE_ENDPOINT,
    apiKey: process.env.IDCF_COMPUTE_API_KEY,
    secretKey: process.env.IDCF_COMPUTE_SECRET_KEY,
    zone: 'henry',
    /*zone: 'augusta',*/
    offering: 'light.S2',
    template: 'Debian 8.2.0 64-bit',
    templatefilter: 'featured',
    keypair: process.env.IDCF_KEYPAIR,
    privateKey: path.join(keysDir, 'id-rsa_'+process.env.IDCF_KEYPAIR),
    sleepTime: process.env.IDCF_SLEEP_TIME,
    protocol: 'tcp',
    cidrlist: '0.0.0.0/0',
    ports: [22, 80, 443, 1883, 8080, 3030],
    master: process.env.MASTER_NAME,
    port: process.env.EXPRESS_PORT
};

module.exports = config;
