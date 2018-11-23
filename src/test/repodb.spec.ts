import * as mocha from 'mocha';
import * as Nedb from 'nedb';
import { resolve } from 'path';
import { Dependency } from '../mvn/dependency';
describe('repoDb', () => {

  const repoDb = new Nedb({ filename: resolve(__dirname, './repo.db'), autoload: true });

  it.only(`should contain dependencies without license info`, (done) => {
    repoDb.find({
      'bestLicense.name': null,
      'bestLicense.url': null
    }, (err: Error, docs: Dependency[]) => {
      console.log(docs.map( (d) => d.bestLicense));
      done();
    });
  });
});
