const fs = require('fs')
  , ejs = require('ejs');

function renderTemplate(renderOptions, options) {
  const title = renderOptions.title;
  const description = renderOptions.description;
  const template = renderOptions.template;
  const filename = renderOptions.filename;
  const query = renderOptions.query;

  return new Promise( (resolve, reject) => {
    options.repoDb.find(query)
      .sort( { 'license.raw': 1 } )
      .exec( (err, docs) => {
        if (err) {
          return reject(err);
        }
        const dependencies = docs.sort((a,b) => a.fullname >= b.fullname ? 1:-1)
        const licenseGroupMap = _getLicenseGroupMap(docs);
        const licenseCounter = Object.keys(licenseGroupMap).map( (name) => {
          const count = licenseGroupMap[name].count;
          return { name, count };
        });
        const licenseGroups = _getLicenseGroups(licenseGroupMap);
        const data = { title, description, dependencies, licenseCounter, licenseGroups };
        ejs.renderFile(template, data, { }, (err, str) => {
          if (err) {
            return reject(err);
          }
          if (options.verbose) {
            console.log(str);
          }
          fs.writeFile(filename, str, (err) => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        })
      });
    });
}

function _getLicenseGroupMap(dependencies) {
  const licensedDependencies = dependencies.map( (d) => {
    const name = d.package[0].metadata.licenseUrl
    return {
        name
      , license: name
      , count: 1
      , dependencies: [d]
    };
  });

  return licensedDependencies.reduce( (acc, val, _i, _arr) => {
    const test = acc[val.name]
    if (test) {
      test.count += 1;
      test.dependencies.push(val.dependencies[0]);
    } else {
      acc[val.name] = val;
    }
    return acc;
  }, {})
}

/**
 * @returns { Array<{licenseName:string, licenseCount:number}> }
 * @param {*} licenseGroupMap 
 */
function _getLicenseGroups(licenseGroupMap) {
  return Object.keys(licenseGroupMap).map( (licenseName) => {
    const licensedDependencies = licenseGroupMap[licenseName];
    const dependencies = licensedDependencies.dependencies.sort( (a, b) => {
      return a.fullname > b.fullname ? 1 : -1;
    }).map( (d) => {
      return { 
          fullname: d.fullname
        , license: d.license
        , package: d.package };
    });

    return { 
        licenseName
      , dependencies };
    });
}

module.exports = { renderTemplate }
