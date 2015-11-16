'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const moment = require ('moment-timezone');
const spawn = require('child_process').spawn;
const _ = require('lodash');
const config = require('../../config');
const deploy = require('../cli/deployCommand');

const app = express();
const server = app.listen(config.port);
//const bodyParser = require('body-parser');

const io = require('socket.io')(server);
const isProduction = process.env.NODE_ENV === 'production';

if(!isProduction) {
    const webpack = require('webpack');
    const webpackConfig = require('../../webpack.config.js');
    const compiler = webpack(webpackConfig);

    app.use(require('webpack-dev-middleware')(compiler, {
        noInfo: true, publicPath: webpackConfig.output.publicPath
    }));
    app.use(require('webpack-hot-middleware')(compiler));
}

const idcf = require('idcf-cloud-api');

function buildCommand(endpoint, apiKey, secretKey) {
    let client = idcf({
        endpoint: endpoint,
        apiKey: apiKey,
        secretKey: secretKey
    });
    let command = require('../cli/command')(client, config.sleepTime);
    return command;
}

app.use(favicon(path.join(config.distDir, 'images/favicon.ico')));
app.use(express.static(config.distDir));
//app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(config.distDir, 'index.html'));
});

app.get('/zones', (req, res) => {
    let command = buildCommand(req.query.endpoint, req.query.apiKey, req.query.secretKey);

    command.exec('listPublicIpAddresses')
    .then((ipaddresses) => {
        return [...new Set(ipaddresses.map((ipaddress) => ipaddress.zoneid))];
    })
    .then((zoneids) => {
        command.exec('listZones')
               .then((zones) => {
                   let retval = zones
                       .filter((zone) => _.includes(zoneids, zone.id))
                       .map((zone) => {
                           return { id: zone.id, name: zone.name }
                       });
                   res.json(retval);
               });
    })
    .catch((err) => {
        console.log('/zones: '+err.stack);
        res.status(500).send({ error: 'API情報が正しくありません。' });
    });

});

app.get('/offerings', (req, res) => {
    let command = buildCommand(req.query.endpoint, req.query.apiKey, req.query.secretKey);
    command.exec('listServiceOfferings')
    .then((offerings) => {
        let retval = offerings.filter((offering) =>
                                      _.includes(['light.S1','light.S2'], offering.name)
                              )
                              .map((offering) => {
                                  return { id: offering.id, name: offering.name };
                              });
        res.json(retval);
    })
    .catch((err) => {
        console.log('/offerings: '+err.stack);
        res.status(500).send({ error: 'API情報が正しくありません。' });
    });
});

const newdata = 'newdata';
const deployed = 'deployed';

io.on('connection', (socket) => {
    console.log('new user connected');

    socket.on('deploy', (endpoint, apiKey, secretKey, zoneName, offeringName, name) => {
        let start = Date.now();
        let keypair = config.keypair+start;
        let privateKey = config.privateKey+start;
        let command = buildCommand(endpoint, apiKey, secretKey);
        socket.emit(newdata, name+' start a deployment at '+moment(start,'x').tz("Asia/Tokyo").format()+'.\n'+'please wait a few minutes.\n');

        deploy(command, name, keypair, privateKey,
               zoneName, offeringName, config)
            .then((vmInfo) => {
                socket.emit(deployed, JSON.stringify(vmInfo));
                return new Promise((resolve, reject) => {
                    let myProcess = spawn('bash', [config.runner, 'masterless.sh', vmInfo.publicip,
                                                   privateKey, config.master]);
                    myProcess.stdout.on('data', (data) => {
                        console.log(data.toString('utf8'));
                        socket.emit(newdata, data.toString('utf8'));
                    });
                    myProcess.stderr.on('data', (data) => {
                        console.log('err: '+data.toString('utf8'));
                        socket.emit(newdata, data.toString('utf8'));
                    });
                    myProcess.on('close', (code) => {
                        if (code == 0)  resolve(vmInfo);
                        else  reject({ code: code, name:name });
                    });
                });
            })
            .then((vmInfo) => {
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
