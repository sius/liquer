import { MavenOptions } from './maven-options';
import { homedir } from 'os';
import { resolve, basename } from 'path';
import * as Nedb from 'nedb';
import * as moment from 'moment';
import { StreamOptions } from './stream-options';
import { createWriteStream, WriteStream } from 'fs-extra';

export class ResolvedOptions implements MavenOptions, StreamOptions {

  private _scanDir: string;
  private _scanTimeStamp: Date;
  private _scanPath: string;
  private _repoDb: Nedb;
  private _dependencyDb: Nedb;
  private _licenseDb: Nedb;
  private _repoDbFilename: string;
  private _dependencyDbFilename: string;
  private _licenseDbFilename: string;
  private _logPath: string;
  private _log: WriteStream;

  constructor(private options: MavenOptions) {
    this._scanTimeStamp = new Date();
    this._scanDir = `mvn-scan-${moment(this._scanTimeStamp).format('YYYYMMDD-HHmmss-SSS')}`;
    this._scanPath = resolve(this.wd, this._scanDir);
    this._repoDbFilename = resolve(this._scanPath, `${this.options.localRepoDir}.db`);
    this._dependencyDbFilename = resolve(this._scanPath, `${this.options.localRepoDir}.db`);
    this._licenseDbFilename = resolve(this._scanPath, `${this.options.localRepoDir}.db`);
    this._logPath = resolve(this._scanPath, this.logFile);
    this._repoDb = new Nedb({ filename: this._repoDbFilename });
    this._licenseDb = new Nedb({ filename: this._licenseDbFilename });
    this._dependencyDb = new Nedb({ filename: this._dependencyDbFilename });
    // this._log = createWriteStream(this._logPath, { flags: 'a+' });
  }
  get wd() {
    return this.options.wd;
  }
  get goal() {
    return this.options.goal;
  }
  get mavenProfile() {
    return this.options.mavenProfile;
  }
  get remoteRepo() {
    return this.options.remoteRepo;
  }
  get file() {
    return this.options.file;
  }
  get logFile() {
    return this.options.logFile;
  }
  get scanDir() {
    return this._scanDir;
  }
  get settings() {
    return this.options.settings;
  }
  get srcPom() {
    return resolve(this.file);
  }
  get destPom() {
    return resolve(this._scanPath, basename(this.file));
  }
  get localRepo() {
    return resolve(this._scanPath, this.options.localRepoDir);
  }
  get repoDb() {
    return this._repoDb;
  }
  get licenseDb() {
    return this._licenseDb;
  }
  get dependencyDb() {
    return this._dependencyDb;
  }
  get args(): string[] {
    const args: string[] = [];
    if (this.settings && this.settings.length > 0) {
      args.push('-s');
      args.push(this.settings);
    }
    if (this.file && this.file.length > 0) {
      args.push('-f');
      args.push(this.srcPom);
    }
    if (this.mavenProfile && this.mavenProfile.length > 0) {
      args.push(`-P${this.mavenProfile}`);
    }
    if (this.localRepo && this.localRepo.length > 0) {
      args.push(`-Dmaven.repo.local=${this.localRepo}`);
    }
    args.push(this.goal);
    return args;
  }
  get log(): WriteStream {
    return this._log;
  }
}
