const fs = require('fs-extra');
const path = require('path');
const opath = require('object-path');
const { objFromXmlFile, isArray } = require('../../../lib/utils');


function _getModules(xmlObj) {
  let modules = opath.get(xmlObj, 'project.modules.module');
  if (modules) {
    if (!isArray(modules)) {
      modules = [modules];
    }
  } else {
    modules = [];
  }
  return modules;
}
/**
 * 
 * @param { { srcPom:string, destPom:string, ensureDir: string} } lifecycleOptions
 * @param { { err: Error, SetupInfo: { xml:*, multiModuleProject:boolean, moduleFiles:Array<string>, copiedFiles:Array<string>} } setupCallback  
 */
function hook(lifecycleOptions, setupCallback) {
  
  if (!lifecycleOptions) {
    return setupCallback(new Error('Invalid argument: lifecycleOptions'));
  }

  fs.ensureDir(lifecycleOptions.ensureDir, (err) => {
    if (err) return setupCallback(err);

    objFromXmlFile(lifecycleOptions.srcPom, (err2, xmlObj) => {
      if (err2) return setupCallback(err2);
      
      const srcFiles = _getModules(xmlObj).map( (m) => path.resolve(__dirname, `${m}`, 'pom.xml'));
      srcFiles.push(lifecycleOptions.srcPom);
    });
  });
}

module.exports = { hook }
