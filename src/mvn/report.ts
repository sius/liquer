import { StreamOptions } from './stream-options';
import { Dependency } from './dependency';
import { ascending } from 'd3-array';
import { nest } from 'd3-collection';

const S1 = '###########################################\n';
const S2 = '===========================================\n';
const S3 = '-------------------------------------------\n';
const NL = `\n`;

export interface LicenseGroup {
  name: string;
  count: number;
  dependencies: Dependency[];
}
function licensesGroupedByCount(dependencies: Dependency[]): Map<string, LicenseGroup> {
  const arr: LicenseGroup[] = dependencies.map( (d) => {
    const res: LicenseGroup = {
        name: d.bestLicense.name || d.bestLicense.url || (!!d.bestLicense.text ? 'License text' : 'UNDEFINED')
      , count: 1
      , dependencies: [d]
    };
    return res;
  });
  return arr.reduce((acc: Map<string, LicenseGroup>, val: LicenseGroup, i: number, _arr: LicenseGroup[]) => {
    const test: LicenseGroup = acc[val.name];
    if (test) {
      test.count += 1;
      test.dependencies.push(val.dependencies[0]);
    } else {
      acc[val.name] = val;
    }
    return acc;
  }, {} as Map<string, LicenseGroup>);
}
function report(options: StreamOptions, cb: () => void) {
  const _w = options.report.write;
  options.repoDb.find({}).sort({ 'bestLicense.name': 1, 'bestLicense.url': 1 }).exec((_err: Error, dependencies: Dependency[]) => {
    const groups = licensesGroupedByCount(dependencies);
    _w(S2);
    Object.keys(groups).forEach( (key) => {
      const licenseGroup: LicenseGroup = groups[key];
      _w(`${key}: ${licenseGroup.count}\n`);
    });
    _w(S3);
    _w(`Total Artifacts: ${dependencies.length}\n`);
    _w(S2);
    _w(NL);

    _w(S2);
    Object.keys(groups).forEach( (key) => {
      const licenseGroup: LicenseGroup = groups[key];
      _w(`${key} (${licenseGroup.count})\n`);
      _w(S3);
      licenseGroup.dependencies.forEach( (d) =>
        _w(`${d.gav.groupId}:${d.gav.groupId}:${d.gav.version}\n`));
      _w(S2);
      _w(NL);
    });

    options.report.end(cb);
  });

}

export { report, licensesGroupedByCount };
