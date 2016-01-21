'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const spawn = require('child_process').spawn;
const validation = require('validator');

const config = require('../../config');
const deploy = require('../cli/deployCommand');
const createCommand = require('./lib/createCommand');
const sendgrid = require('./lib/sendgrid');
const Templates = require('./lib/Templates');

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

app.use(favicon(path.join(config.distDir, 'images/favicon.ico')));
app.use(express.static(config.distDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(config.distDir, 'index.html'));
});

app.use((req, res, next) => {
    req.command = createCommand(req.query.endpoint,
                                req.query.apiKey,
                                req.query.secretKey,
                                config.sleepTime
                               );
    next();
});

app.use('/api', require('./routes'));

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

        socket.on('deploy', (endpoint, apiKey, secretKey, zoneName,
                             offeringName, name, email) => {
            let start = Date.now();
            let keypair = config.keypair+start;
            let privateKey = config.privateKey+start;
            let command = createCommand(endpoint, apiKey, secretKey,
                                        config.sleepTime);

            socket.emit(newdata, Templates.start(name, start));

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
                    let text = Templates.email(vmInfo, devices);
                    let retval = sendgrid(email, text);

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
