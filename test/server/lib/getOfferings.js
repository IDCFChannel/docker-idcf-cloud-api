'use strict';

const expect = require('chai').expect;
const getOfferings = require('../../../app/server/routes/getOfferings');

describe('Get Offerings list', () => {
    it('should return list', () => {
        let offerings = [
            { id: 1, name: 'light.S1' },
            { id: 2, name: 'light.S2'}
        ];
        let req = {
            command: {
                exec: (name) => {
                    expect(name).to.equal('listServiceOfferings');
                    return Promise.resolve(offerings);
                }
            }
        };
        let res = {
            json: function(data) {
                expect(data).to.eql(offerings);
            }
        };
        getOfferings(req, res);
    });
});
