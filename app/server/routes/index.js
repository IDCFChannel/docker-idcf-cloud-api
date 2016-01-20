'use strict';

const router = require('express').Router();
const getZones = require('./getZones');
const getOfferings = require('./getOfferings');

router.get('/zones', getZones);
router.get('/offerings', getOfferings);

module.exports = router;
