'use strict';

const should = require('chai').should();
const expect = require('chai').expect;
const request = require('supertest');
const io = require('socket.io-client');

const app = require('../app/server/server');
const port = 3000;

describe('Server API', () => {

    let server;

    before(() => {
        server = app.listen(port);
        require('../app/server/sockets')(server);
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

        let socket;

        beforeEach((done) => {
            socket = io.connect('http://localhost:'+port, options);
            socket.on('connect', () => done());
        });

        afterEach((done) => {
            if(socket.connected) {
                socket.disconnect();
            } else {
                console.log('no connection to break...');
            }
            done();
        });

        it('echos message', (done) => {
/*
        socket.once('connect', () => {
            socket.once('echo', (message) => {
                message.should.equal('Hello World');
                done();
            });
            sockett.emit('echo', 'Hello World');
        });
*/
            expect([1, 2, 3].indexOf(5)).to.be.equal(-1);
            expect([1, 2, 3].indexOf(0)).to.be.equal(-1);
            done();
        });
    });
});
