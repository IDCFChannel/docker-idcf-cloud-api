'use strict';

const _ = require('lodash');

function getZones(req, res) {
    let command = req.command;

    let listPublicIpAddresses = command.exec('listPublicIpAddresses');
    let listZones = command.exec('listZones');

    return Promise.all([listPublicIpAddresses, listZones])
        .then((values) => {
            let ipaddresses = values[0];
            let zones = values[1];
            let zoneids = [...new Set(ipaddresses.map((ipaddress) => ipaddress.zoneid))];
            let retval = zones
                .filter((zone) => _.includes(zoneids, zone.id))
                .map((zone) => {
                    return { id: zone.id, name: zone.name }
                });
            res.json(retval);
        })
        .catch((err) => {
            if (err.stack) {
                console.log('/zones: '+err.stack);
            } else {
                console.log('/zones: '+err);
            }
            res.status(500).send({ error: 'API情報が正しくありません。' });
        });

/*
    let zoneids;
    command.exec('listPublicIpAddresses')
    .then((ipaddresses) => {
        zoneids = [...new Set(ipaddresses.map((ipaddress) => ipaddress.zoneid))];
        return command.exec('listZones');
    })
    .then((zones) => {
        let retval = zones
            .filter((zone) => _.includes(zoneids, zone.id))
            .map((zone) => {
                return { id: zone.id, name: zone.name }
            });
        res.json(retval);
    })
    .catch((err) => {
        if (err.stack) {
            console.log('/zones: '+err.stack);
        } else {
            console.log('/zones: '+err);
        }
        res.status(500).send({ error: 'API情報が正しくありません。' });
    });
*/
}

module.exports = getZones;
