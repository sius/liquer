import { homedir } from 'os';
import { join, resolve } from 'path';

export interface MavenOptions {
  wd?: string;
  goal?: string;
  file?: string;
  logFile?: string;
  settings?: string;
  localRepoDir?: string;
  remoteRepo?: string;
  mavenProfile?: string;
}

export const MAVEN_OPTIONS: MavenOptions = {
    wd: 'audit'
  , goal: 'dependency:go-offline'
  , file: 'pom.xml'
  , localRepoDir: 'repo'
  , remoteRepo: 'https://repo.maven.apache.org/maven2'
  , logFile: 'log.txt'
  , settings: null // join(homedir(), '.m2', 'settings.xml')
};
