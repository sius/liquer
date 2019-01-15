const { rc } = require('../../config')
  , inquirer = require('inquirer');

exports.command = 'xray';
exports.describe = 'Login to Xray backend\nSee also: lq login xray --help';
exports.builder = (yargs) => { 
  return yargs.option('api', {
      alias: 'a'
    , describe: 'api endpoint'
    , type: 'string'
    , default: 'https://localhost/api/v1/summary/component'
    , group: 'Credentials:'
  });
}
exports.handler = (argv) => {
  askCredentials().then( (credentials) => rc({ xray: { api: argv.api, credentials }}));
};

function askCredentials() {
  const questions = [{
      name: 'username'
    , type: 'input'
    , message: 'Enter your username:'
    , validate: (value) => {
      if (value.length) {
        return true;
      } else {
        return 'Please enter your username.'
      }
    } }, {
      name: 'password'
    , type: 'password'
    , mask: '***'
    , message: 'Enter your password:'
    , validate: (value) => {
      if (value.length) {
        return true;
      } else {
        return 'Pleas enter your password.'
      }
    } 
  }];
  return inquirer.prompt(questions);
}
