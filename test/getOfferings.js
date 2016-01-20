'use strict';

const should = require('chai').should();
const expect = require('chai').expect;
const sinon  = require('sinon');

const getOfferings = require('../app/server/routes/getOfferings');

describe('Get Offerings list', () => {
    it('should respond', () => {
        let offerings = [{
            id: 1,
            name: 'light.S1'
        },{
            id: 2,
            name: 'light.S2'
        }];

        let fakeCommand = {
            exec: () => {
                return Promise.resolve(offerings);
            }
        }

        let req = { command: fakeCommand };
        let res = {
            json: function(data) {
                data.should.equal(offerings)
            }
        };

        getOfferings(req, res);
    });
});
