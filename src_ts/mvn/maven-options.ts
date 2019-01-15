export interface MavenOptions {
  wd?: string;
  goal?: string;
  file?: string;
  logFile?: string;
  reportFile: string;
  settings?: string;
  localRepoDir?: string;
  remoteRepo?: string;
  mavenProfile?: string;
}

export const MAVEN_OPTIONS: MavenOptions = {
    wd: 'audit'
  , goal: 'dependency:go-offline'
  , file: 'pom.xml'
  , reportFile: 'report.txt'
  , localRepoDir: 'repo'
  , remoteRepo: 'https://repo.maven.apache.org/maven2'
  , logFile: 'log.txt'
  , settings: null
};
