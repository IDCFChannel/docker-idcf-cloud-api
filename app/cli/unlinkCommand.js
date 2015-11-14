'use strict';
const co = require('co');
const path = require('path');
const thunkify = require('thunkify');
const unlink = thunkify(require('fs').unlink);

module.exports = co.wrap(function* (file, config) {
    yield unlink(path.join(config.keysDir, file));
});
