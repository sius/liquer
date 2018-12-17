import * as mocha from 'mocha';
import { assert } from 'chai';
import * as Nedb from 'nedb';
import { resolve } from 'path';
import { MavenDependency } from '../../mvn/maven-dependency';
// import { getLicenseAtUrl } from '../../mvn/pom-stream';
import { licensesGroupMap, LicenseGroupMap, LicensedDependencies, LicenseName } from '../../mvn/report';
import { doesNotReject } from 'assert';

describe('repoDb', () => {

  const repoDb = new Nedb({ filename: resolve(__dirname, './repo.db'), autoload: true });

  it(`should contain dependencies without license info`, (done) => {
    repoDb.find({
      'bestLicense.name': null,
      'bestLicense.url': null
    }, (_err: Error, docs: MavenDependency[]) => {
      docs.map( (d) => console.log(d.bestLicense));
      done();
    });
  });

  it('should group the license data for the report', (done) => {
    repoDb.find({}).sort({ 'bestLicense.name': 1, 'bestLicense.url': 1 }).exec((_err: Error, dependencies: MavenDependency[]) => {
      const licenseGroupMap: LicenseGroupMap = licensesGroupMap(dependencies);
      assert(licenseGroupMap !== null);
      Object.keys(licenseGroupMap).forEach( (licenseName: LicenseName) => {
        const licensedDependencies: LicensedDependencies = licenseGroupMap[licenseName];
        console.log(`${licenseName}: ${licensedDependencies.count}`);
      });
      done();
    });
  });

  it.only('should find dublettes', (done) => {
    const gav = 'org.ow2.asm:asm:6.2'.split(':');
    repoDb.find({ type: 'pom', 'gav.groupId': gav[0], 'gav.artifactId': gav[1], 'gav.version': gav[2] }, (_err: Error, dependencies: MavenDependency[]) => {
      console.log(dependencies.length);
      console.log(dependencies.map((_) => _._id));
      done();
    });
  });

  it('should match license url', (done) => {
    const test = `
~ Copyright (c) 2007-2011 Sonatype, Inc. All rights reserved.
~
~ This program is licensed to you under the Apache License Version 2.0,
~ and you may not use this file except in compliance with the Apache License Version 2.0.
~ You may obtain a copy of the Apache License Version 2.0 at <http://www.apache.org/licenses/LICENSE-2.0>.
~
~ Unless required by applicable law or agreed to in writing,
~ software distributed under the Apache License Version 2.0 is distributed on an
~ "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
~ See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
    `;
    // const url = getLicenseAtUrl(test);
    // assert('http://www.apache.org/licenses/LICENSE-2.0' === url, url);
    done();
  });

  it.only('should work', (done) => {

    const promises = [
      new Promise((resolve1) => setTimeout(resolve1, 0, 1)).then( (n: number) => n+1),
      new Promise((resolve2) => setTimeout(resolve2, 0, 2))
    ];
    Promise.all(promises)
      .then( (data) => {
        console.log('First handler', data);
        return data.map( (entry: number) => entry * 10);
      })
      .then((data) => {
        console.log('Second handler', data);
      });
    done();
  });
});
