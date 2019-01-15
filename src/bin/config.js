const os = require('os')
, path = require('path')
, fs = require('fs-extra')
, moment = require('moment')
, configPath = path.join(os.homedir(), '.liqrc');

function _initialConfig() {
  return { lastSecurityUpdate: moment().subtract(3,'days').toDate() }
}
/**
 * Return the config object
 * @returns {*}
 */
function rc(configOptions = null) {
  if (!fs.existsSync(configPath)) {
    fs.ensureFileSync(configPath);
    const config = configOptions 
      ? { ..._initialConfig(), ...configOptions }
      : _initialConfig();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), { encoding: 'utf-8'});
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } else {
    if (configOptions) {
      const config = { ...JSON.parse(fs.readFileSync(configPath, 'utf-8')), ...configOptions };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), { encoding: 'utf-8'});
    }
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
};

module.exports = { rc };
