'use strict';

const _ = require('lodash');

function getOfferings(req, res) {
    let command = req.command;

    command.exec('listServiceOfferings')
    .then((offerings) => {
        let retval = offerings.filter((offering) =>
                                      _.includes(['light.S1','light.S2'],
                                                 offering.name)
                              )
                              .map((offering) => {
                                  return { id: offering.id, name: offering.name };
                              });
        res.json(retval);
    })
    .catch((err) => {
        console.log(err.stack || e);
        res.status(500).send({ error: 'API情報が正しくありません。' });
    });
}

module.exports = getOfferings;
