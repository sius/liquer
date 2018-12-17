export interface AuditOptions {
  workingDir?: string;
  goal?: string;
  file?: string;
  logFile?: string;
  reportFile: string;
  settings?: string;
  localRepoDir?: string;
  remoteRepo?: string;
  profile?: string;
  extTxtFiles?: boolean;
  extDir?: string;
}

export const MAVEN_OPTIONS: AuditOptions = {
    workingDir: 'audit'
  , goal: 'dependency:go-offline'
  , file: 'pom.xml'
  , reportFile: 'report.txt'
  , localRepoDir: 'repo'
  , remoteRepo: 'https://repo.maven.apache.org/maven2'
  , logFile: 'log.txt'
  , settings: null
  , extTxtFiles: true
  , extDir: 'ext'
};
