'use strict';

const request = require('supertest');
const app = require('../app/server/server');

const port = 3000;

describe('GET / requests', () => {

    let server;

    before(() => server = app.listen(port));
    after(() => server.close());

    it('returns a 200 response', (done) => {
        request(server)
            .get('/')
            .expect(200, done);
    });
});
