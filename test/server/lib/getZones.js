'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const getZones = require('../../../app/server/routes/getZones');

describe('Get Zones list', () => {
    it('should return list', () => {
        let zones = [
            { id: 1, name: 'tesla' },
            { id: 2, name: 'henry'}
        ];

        let ipaddresses = [
            { zoneid: 1 },
            { zoneid: 2 }
        ];

        let req = {
            command: { exec: (name) => {} }
        };

        let execStub = sinon.stub(req.command, 'exec');
        execStub.onFirstCall().returns(ipaddresses);
        execStub.onSecondCall().returns(zones);

        let res = {
            json: function(data) {
                expect(data).to.eql(zones);
            }
        };

        getZones(req, res);
        expect(execStub.calledTwice).to.be.true;
    });
});
