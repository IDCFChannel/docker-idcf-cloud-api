'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
chai.use(require('chai-string'));

const sinon = require('sinon');
const proxyquire = require('proxyquire');
const request = require('supertest');

const co = require('co');
const io = require('socket.io-client');
const app = require('../../app/server/server');
const port = 3000;

describe('Server API', () => {

    let server;
    let createCommandStub = sinon.stub();
    let deployGeneratorStub = co.wrap(function* () {});

    before(() => {
        server = app.listen(port);

        proxyquire('../../app/server/sockets', {
            './lib/createCommand': createCommandStub,
            './lib/deployGenerator': deployGeneratorStub
        })(server);
    });

    after(() => {
        server.close();
    });

    it('returns 200 for the root', (done) => {
        request(server)
            .get('/')
            .expect(200, done);
    });

    describe('Socket.IO requests', () => {
        const options = {
            transports: ['websocket'],
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true
        };

        let client;
        let endpoint, apiKey, secretKey, zoneName, offeringName, name, email;

        beforeEach((done) => {
            client = io.connect('http://localhost:'+port, options);
            done();
        });

        afterEach((done) => {
            if(client.connected) {
                client.disconnect();
            } else {
                console.log('no connection to break...');
            }
            endpoint = apiKey =  secretKey =  zoneName = offeringName =  name = email = null;
            done();
        });

        it('should fail when empty params', (done) => {
            client.on('connect', () => {
                client.on('newdata', (message) => {
                    let expected = ['endpointがありません。',
                                    'apiKeyがありません。',
                                    'secretKeyがありません。',
                                    'Emailが正しくありません。'].join('\n');
                    message.should.equal(expected);
                    done();
                });
                client.emit('deploy', endpoint, apiKey, secretKey, zoneName,
                           offeringName, name, email);
            });
        });

        it('should fail with not a valid email', (done) => {
            client.on('connect', () => {
                client.on('newdata', (message) => {
                    let expected = ['Emailが正しくありません。'].join('\n');
                    message.should.equal(expected);
                    done();
                });
                endpoint = '1';
                apiKey = '2';
                secretKey = '3';
                email = 'test@hoge';

                client.emit('deploy', endpoint, apiKey, secretKey, zoneName,
                           offeringName, name, email);
            });
        });

        it('should fail with not a valid email', (done) => {
            client.on('connect', () => {
                client.on('newdata', (message) => {
                    message.should.startsWith('hoge starts a deployment at');
                    done();
                });
                name = 'hoge';
                endpoint = '1';
                apiKey = '2';
                secretKey = '3';
                email = 'test@example.com';

                client.emit('deploy', endpoint, apiKey, secretKey, zoneName,
                           offeringName, name, email);
            });
        });
    });
});
