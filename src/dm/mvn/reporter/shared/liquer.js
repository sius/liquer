const fs = require('fs')
  , ejs = require('ejs');

const UNDEFINED_JAR = 'JAR files without any licenses';
const UNDEFINED_POM = 'POM (XML-) files without any licenses';
const COMMENT = 'Comment';

/**
 * @returns {Promise<void|Error>}
 * @param {*} renderOptions 
 * @param {*} options 
 */
function renderTemplate(renderOptions, options) {
  const title = renderOptions.title;
  const description = renderOptions.description;
  const template = renderOptions.template;
  const filename = renderOptions.filename;
  const query = renderOptions.query;

  return new Promise( (resolve, reject) => {
    options.repoDb.find(query).sort( { fullname: 1 }).exec( (err, dependencies) => {
      if (err) {
        return reject(err);
      }
      const typeCounter = _getTypeCounter(dependencies);
      const licenseGroupMap = _getLicenseGroupMap(dependencies);
      const licenseCounter = Object.keys(licenseGroupMap).map( (name) => {
        const count = licenseGroupMap[name].count;
        return { name, count };
      });
      const licenseGroups = _getLicenseGroups(licenseGroupMap);
      const data = { title, description, typeCounter, dependencies, licenseCounter, licenseGroups };
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
      });
    });
  });
}

function _getLicenseGroupMap(dependencies) {
  const licensedDependencies = dependencies.map( (d) => {
    const name = d.license.spdx 
      || d.license.joinedNames 
      || d.license.url 
      || (!!d.license.comment 
          ? COMMENT 
          : (d.hasJarFile 
            ? UNDEFINED_JAR 
            : d.hasPomFile ? UNDEFINED_POM : 'ERROR'));
    
    return {
        name
      , license: d.license
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

function _getTypeCounter(dependencies) {
  const totalCount = dependencies.length;
  const jarCount = dependencies.reduce( (acc, d) => d.hasJarFile ? ++acc: acc, 0);
    const jarPackJarCount = dependencies.reduce( (acc, d) => (d.hasJarFile && ('jar' === (d.pom.project.packaging || 'jar'))) ? ++acc: acc, 0);
    const jarPackBundleCount = dependencies.reduce( (acc, d) => (d.hasJarFile && ('bundle' === d.pom.project.packaging)) ? ++acc: acc, 0);
    const jarPackPomCount = dependencies.reduce( (acc, d) => (d.hasJarFile && ('pom' === d.pom.project.packaging)) ? ++acc: acc, 0);
    const jarPackMavenPluginCount = dependencies.reduce( (acc, d) => (d.hasJarFile && ('maven-plugin' === d.pom.project.packaging)) ? ++acc: acc, 0);
    const jarPackEclipsePluginCount = dependencies.reduce( (acc, d) => (d.hasJarFile && ('eclipse-plugin' === d.pom.project.packaging)) ? ++acc: acc, 0);
  const pomCount = dependencies.reduce( (acc, d) => (!d.hasJarFile && d.hasPomFile)  ? ++acc: acc, 0);
    const pomPackJarCount = dependencies.reduce( (acc, d) => (!d.hasJarFile && d.hasPomFile && ('jar' === d.pom.project.packaging)) ? ++acc: acc, 0);
    const pomPackBundleCount = dependencies.reduce( (acc, d) => (!d.hasJarFile && d.hasPomFile && ('bundle' === d.pom.project.packaging)) ? ++acc: acc, 0);
    const pomPackMavenPluginCount = dependencies.reduce( (acc, d) => (!d.hasJarFile && d.hasPomFile && ('maven-plugin' === d.pom.project.packaging)) ? ++acc: acc, 0);
    const pomPackEclipsePluginCount = dependencies.reduce( (acc, d) => (!d.hasJarFile && d.hasPomFile && ('eclipse-plugin' === d.pom.project.packaging)) ? ++acc: acc, 0);

  return { 
      totalCount
    , jarCount
    , jarPackJarCount
    , jarPackBundleCount
    , jarPackPomCount
    , jarPackMavenPluginCount
    , jarPackEclipsePluginCount
    , pomCount
    , pomPackJarCount
    , pomPackBundleCount
    , pomPackMavenPluginCount
    , pomPackEclipsePluginCount };
}

/**
 * @returns { Array<{licenseName:string, licenseCount:number}> }
 * @param {*} licenseGroupMap 
 */
function _getLicenseGroups(licenseGroupMap) {
  return Object.keys(licenseGroupMap).map( (licenseName) => {
    const licensedDependencies = licenseGroupMap[licenseName];
    const dependencies = licensedDependencies.dependencies.sort( (a, b) => {
      return a.fullname >= b.fullname ? 1 : -1;
    }).map( (d) => {
      return { 
          fullname: d.fullname
        , license: d.license
        , extractedFiles: d.extractedFiles };
    });

    return { 
        licenseName
      , dependencies };
    });
}
module.exports = { renderTemplate }
