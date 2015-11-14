'use strict';

const config = require('../../config');

const program = require('commander');
const idcf = require('idcf-cloud-api');

const common = require('./common');
const deploy = require('./deployCommand');
const destroy = require('./destroyCommand');
const saltInstall = require('./saltInstall');
const list = require('./listCommand');
const password = require('./passwordCommand');
const ssh = require('./sshCommand');

const thunkify = require('thunkify');
const unlink = thunkify(require('fs').unlink);

const createCommands = ['minion', 'masterless']
const sshCommands = ['create', 'delete']

const client = idcf({
    endpoint: config.endpoint,
    apiKey: config.apiKey,
    secretKey: config.secretKey
});

const command = require('./command')(client, config.sleepTime);

function elapsedTime(start) {
    console.log('Elapsed Time: ' + (Date.now() - start)/1000.0 + ' seconds');
}

program
    .version('0.0.1')
    .usage('<command>');

program
  .command('create <subcmd> [names...]')
  .action(function (subcmd, names) {
      if (createCommands.indexOf(subcmd) == -1) {
          return console.log(subcmd+' is not valid command.');
      }
      if (names) {
          for(let name of names) {
              let start = Date.now();
              let keypair = config.keypair+start;
              let privateKey = config.privateKey+start;

              deploy(command, name, keypair, privateKey,
                     config.zone, config.offering, config)
              .then((vmInfo) => {
                  return common.runScript(subcmd+'.sh', vmInfo, privateKey, config);
              })
              .then((vmInfo) => {
                  console.log(vmInfo);
                  return command.exec('deleteSSHKeyPair', { name: keypair });
              })
              .then((success) => {
                  console.log('delete keypair '+keypair+' : '+success);
                  return unlink(privateKey);
              })
              .then(() => {
                  console.log('delete privateKey '+privateKey);
                  console.log('Elapsed Time: ' + (Date.now() - start)/1000.0 + ' seconds');
              })
              .catch((err) => {
                  console.log(err.stack);
                  command.exec('deleteSSHKeyPair', { name: keypair })
                      .then((success) => {
                          console.log('delete keypair '+keypair+' : '+success);
                          return unlink(privateKey);
                      })
                      .then(() => {
                          console.log('delete privateKey '+privateKey);
                      });
              });
          }
      }
  });

program
  .command('destroy [names...]')
  .action(function (names) {
      for(let name of names) {
          let start = Date.now();
          destroy(command, name)
          .then((res) => {
              console.log(res.name+' destoyed');
              if(res.publicip)
                  console.log(res.publicip+' removed: ', res.ipJobresult);
              console.log('Elapsed Time: ' + (Date.now() - start)/1000.0 + ' seconds');
          })
          .catch((err) => {
              console.log(err.stack);
          });
      }
  });

program
  .command('password <name>')
  .action(function (name) {
      let start = Date.now();
      password(command, name)
      .then((res) => {
          elapsedTime(start);
      })
      .catch((err) => {
          console.log(err.toString());
      });
  });

program
  .command('list')
  .action(function () {
      let start = Date.now();
      list(command, config)
      .then((res) => {
          elapsedTime(start);
      })
      .catch((err) => {
          console.log(err.toString());
      });
  });

program
  .command('ssh <subcmd> <name>')
  .action(function (subcmd, name) {
      if (sshCommands.indexOf(subcmd) == -1) {
          return console.log(subcmd+' is not valid command.');
      }
      let start = Date.now();
      ssh(command, subcmd+'SSHKeyPair', name)
      .then((res) => {
          elapsedTime(start);
      })
      .catch((err) => {
          console.log(err.toString());
      });
  });

program
  .command('unlink <file>')
  .action(function (file) {
      let unlink = require('./unlinkCommand');
      unlink(file, config)
      .then(() => {
          console.log('delete '+file );
      })
      .catch((err) => {
          console.log(err.toString());
      });
  });

program.parse(process.argv);
