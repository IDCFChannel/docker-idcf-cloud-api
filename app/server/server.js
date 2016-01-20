'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const moment = require ('moment-timezone');
const spawn = require('child_process').spawn;
const _ = require('lodash');
const config = require('../../config');
const deploy = require('../cli/deployCommand');

const app = module.exports = express();

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

if(isDevelopment) {
    const webpack = require('webpack');
    const webpackConfig = require('../../webpack.config.js');
    const compiler = webpack(webpackConfig);

    app.use(require('webpack-dev-middleware')(compiler, {
        noInfo: true, publicPath: webpackConfig.output.publicPath
    }));
    app.use(require('webpack-hot-middleware')(compiler));
}

const idcf = require('idcf-cloud-api');
const validation = require('validator');
const Mustache = require('mustache');
const yaml = require('js-yaml');

app.use(favicon(path.join(config.distDir, 'images/favicon.ico')));
app.use(express.static(config.distDir));

function buildCommand(endpoint, apiKey, secretKey) {
    let client = idcf({
        endpoint: endpoint.trim(),
        apiKey: apiKey.trim(),
        secretKey: secretKey.trim()
    });
    let command = require('../cli/command')(client, config.sleepTime);
    return command;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(config.distDir, 'index.html'));
});

app.use((req, res, next) => {
    req.command = buildCommand(req.query.endpoint,
                               req.query.apiKey,
                               req.query.secretKey
                               );
    next();
});

app.use('/api', require('./routes'));

function sendGridMail(to, text) {
    let from = process.env.SENDGRID_FROM;
    let apiKey = process.env.SENDGRID_API_KEY;
    if (!from || !apiKey) {
        return 'サーバーのメール設定がありません。';
    }

    let sendgrid  = require('sendgrid')(apiKey);
    sendgrid.send({
        to:       to,
        from:     from,
        subject:  'IDCF チャンネルをインストールしました。',
        text:     text
    }, (err, json) => {
        if (err) {
            return err;
        } else {
            return to+' 宛にメールを送信しました。'
        }
    });
}

function tplStart(name, start) {
    let view = {
        name: name,
        time: moment(start,'x').tz('Asia/Tokyo').format()
    };
    let tpl = '{{name}} start a deployment at {{time}}.\nplease wait a few minutes.\n';
    return Mustache.render(tpl, view);
}

function tplMail(vmInfo, devices) {
    let dump = {
        server: {
            hostname: vmInfo.name,
            publicip: vmInfo.publicip
        },
        devices: devices
    }

    let retval = '# IDCFチャンネルのデバイス情報\n\n';
    return yaml.safeDump(dump);
}

const newdata = 'newdata';
const deployed = 'deployed';

function shellInstall(socket, script, privateKey, name, publicip) {
    return new Promise((resolve, reject) => {
        let myProcess = spawn('bash', [config.runner,
                                       script, publicip,
                                       privateKey, config.master]);
        myProcess.stdout.on('data', (data) => {
            console.log(data.toString());
            socket.emit(newdata, data.toString());
        });
        myProcess.stderr.on('data', (data) => {
            console.log('err: '+data.toString());
            socket.emit(newdata, data.toString());
        });
        myProcess.on('close', (code) => {
            if (code == 0)  resolve();
            else  reject("code: "+code+" name: "+name);
        });
    });
}

function shellExecute(script, privateKey, publicip) {
    return new Promise((resolve, reject) => {
        let myProcess = spawn('bash', [config.runner,
                                       script, publicip,
                                       privateKey, config.master]);
        let result = '';
        myProcess.stdout.on('data', (data) => {
            result += data.toString();
        });
        myProcess.stderr.on('data', (data) => {
            console.log('err: '+data.toString());
        });
        myProcess.on('close', (code) => {
            if (code == 0)  resolve(result);
            else  reject("code: "+code);
        });
    });
}

if(!isTest) {
    const server = app.listen(config.port);
    const io = require('socket.io')(server);

    io.on('connection', (socket) => {
        console.log('new user connected');

        socket.on('deploy', (endpoint, apiKey, secretKey, zoneName, offeringName, name, email) => {
            let start = Date.now();
            let keypair = config.keypair+start;
            let privateKey = config.privateKey+start;
            let command = buildCommand(endpoint, apiKey, secretKey);

            //socket.emit(newdata, name+' start a deployment at '+moment(start,'x').tz("Asia/Tokyo").format()+'.\n'+'please wait a few minutes.\n');
            socket.emit(newdata, tplStart(name, start));

            if (!validation.isEmail(email)) {
                return socket.emit(newdata, 'Emailが正しくありません。');
            }

            let vmInfo;
            deploy(command, name, keypair, privateKey,
                   zoneName, offeringName, config)
                .then((res) => {
                    vmInfo = res;
                    socket.emit(deployed, JSON.stringify(vmInfo));
                    return shellInstall(socket, 'masterless.sh', privateKey, name,
                                        vmInfo.publicip);
                })
                .then(() => {
                    return shellExecute('devices.sh', privateKey, vmInfo.publicip);
                })
                .then((res) => {
                    let devices = JSON.parse(res.replace('ssh success',''));

                    //let info = _.merge(vmInfo, devices);
                    //let text = JSON.stringify(info);
                    let text = tplMail(vmInfo, devices);
                    let retval = sendGridMail(email, text);
                    console.log(retval);
                    socket.emit(newdata, retval);
                    return command.exec('deleteSSHKeyPair', { name: keypair });
                })
                .then((success) => {
                    console.log('delete '+keypair+' : '+success);
                    console.log('Elapsed Time: ' + (Date.now() - start)/1000.0 + ' seconds');
                })
                .catch((err) => {
                    console.log(err.toString());
                    socket.emit(newdata, err.toString());
                    command.exec('deleteSSHKeyPair', { name: keypair })
                        .then((success) => {
                            console.log('delete '+keypair+' : '+success);
                        });
                });
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
}
