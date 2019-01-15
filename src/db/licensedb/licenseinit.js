let { resolve } = require('path')
  , Datasource = require('nedb')
  , fkaDb = new Datasource({ filename: resolve(__dirname, 'repo.db'), autoload: true})
  , licenseDb = new Datasource({ filename: resolve(__dirname, 'license.db'), autoload: true})
  , licenses = [];
  fkaDb.find({}, (err, docs) => {
    
    let licenseSet = {}
    for (d of docs) {
      let licenseName = d.license.name
      let test = licenseSet[licenseName];
      if (!test) {
        licenseSet[licenseName] = { name: licenseName, version: d.license.version, spdix: d.license.spdx, url: d.license.url, use: d.license.use }
        if (licenseName) {
          licenses.push(licenseSet[licenseName]);
        }
      }
    }
    licenses.sort((a,b) => a>b);
    licenseDb.insert(licenses, (err, docs) => {
      console.log(`${docs.length} licenses inserted`);
    })
  });