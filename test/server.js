'use strict';

const should = require('chai').should();
const expect = require('chai').expect;
const sinon  = require('sinon');
const request = require('supertest');
const app = require('../app/server');

describe('GET /', () => {
    it('returns a 200 response', (done) => {
        request(app)
            .get('/')
            .expect(200, done);
    });
});
