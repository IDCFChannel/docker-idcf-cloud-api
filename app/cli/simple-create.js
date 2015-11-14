'use strict';
const config = require('./config');
const deploy = require('./deploy');
const args = process.argv.splice(2);

for(let arg of args) {
    let start = Date.now();
    deploy(arg, config.script)
        .then(dispvm => {
            console.log(dispvm);
            console.log('Elapsed Time: ' + (Date.now() - start)/1000.0 + ' seconds');
        })
    .catch((err) => {
        console.log(err.toString());
    });
}
