import { StreamOptions } from './stream-options';
import { MavenDependency } from './maven-dependency';
import { License } from './license';

const S1 = '###########################################\n';
const S2 = '===========================================\n';
const S3 = '-------------------------------------------\n';
const NL = `\n`;

export type LicenseName = string;
export type ArtifactCount = number;
export type LicensedDependencies = {
  name: LicenseName;
  useLicenseText: boolean;
  license: License;
  count: ArtifactCount;
  dependencies: MavenDependency[];
};
export type LicenseGroupMap = Map<LicenseName, LicensedDependencies>;

export function licensesGroupMap(dependencies: MavenDependency[]): LicenseGroupMap {
  const licensedDependencies: LicensedDependencies[] = dependencies.map( (d: MavenDependency) => {
    const name = d.bestLicense.name || d.bestLicense.url || (!!d.bestLicense.text ? 'License text' : 'UNDEFINED');
    return {
        name
      , useLicenseText: (name === 'License text')
      , license: d.bestLicense
      , count: 1
      , dependencies: [d]
    } as LicensedDependencies;
  });
  return licensedDependencies.reduce((acc: LicenseGroupMap, val: LicensedDependencies, i: number) => {
    const test: LicensedDependencies = acc[val.name];
    if (test) {
      test.count += 1;
      test.dependencies.push(val.dependencies[0]);
    } else {
      acc[val.name] = val;
    }
    return acc;
  }, {} as LicenseGroupMap);
}

export function report(options: StreamOptions, cb: () => void) {

  options.repoDb.find({type: 'pom'}).sort({ 'bestLicense.name': 1, 'bestLicense.url': 1 }).exec((_err: Error, dependencies: MavenDependency[]) => {
    const totalCount: ArtifactCount = dependencies.length;
    const licenseGroupMap: LicenseGroupMap = licensesGroupMap(dependencies);

    Object.keys(licenseGroupMap).forEach( (key: LicenseName) => {
      const licensedDependencies: LicensedDependencies = licenseGroupMap[key];
      options.report.write(`${key}: ${licensedDependencies.count}\n`);
    });
    options.report.write(S3);
    options.report.write(`Total Artifacts: ${totalCount}\n`);
    options.report.write(S2);
    options.report.write(NL);

    Object.keys(licenseGroupMap).forEach( (licenseName: LicenseName) => {
      const licensedDependencies: LicensedDependencies = licenseGroupMap[licenseName];

      options.report.write(`${licenseName} (${licensedDependencies.count})\n`);
      options.report.write(S3);

      licensedDependencies.dependencies.sort((a: MavenDependency, b: MavenDependency) => {
        const agav = `${a.gav.groupId}:${a.gav.artifactId}:${a.gav.version}`;
        const bgav = `${b.gav.groupId}:${b.gav.artifactId}:${b.gav.version}`;
        return agav > bgav ? 1 : -1;
      }).forEach( (d: MavenDependency) => {
        const dgav = `${d.gav.groupId}:${d.gav.artifactId}:${d.gav.version}`;
        if (licensedDependencies.useLicenseText) {
          options.report.write(S3);
          options.report.write(`${d.bestLicense.text}\n`);
          options.report.write(S3);
          options.report.write(`${dgav}\n`);
          options.report.write(S2);
          options.report.write(NL);
        } else {
          options.report.write(`${dgav}\n`);
        }
      });
      options.report.write(S2);
      options.report.write(NL);
    });
    options.report.end(cb);
  });
}
