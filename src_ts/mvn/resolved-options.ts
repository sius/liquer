import { AuditOptions } from './audit-options';
import { resolve, basename } from 'path';
import * as Nedb from 'nedb';
import * as moment from 'moment';
import { StreamOptions } from './stream-options';
import { timestamp } from '../lib/utils';
import { createWriteStream, WriteStream, ensureDir, copyFile } from 'fs-extra';

export class ResolvedOptions implements AuditOptions, StreamOptions {

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
  private _reportPath: string;
  private _report: WriteStream;
  private _extPath: string;

  constructor(private options: AuditOptions, cb: (error?: Error, options?: ResolvedOptions) => void) {
    this._scanTimeStamp = new Date();
    this._scanDir = `mvn-scan-${timestamp(this._scanTimeStamp)}`;
    this._scanPath = resolve(this.workingDir, this._scanDir);

    ensureDir(this._scanPath, (err) => {
      if (err) {
         cb(err);
      }

      copyFile(this.srcPom, this.destPom, (err2: Error) => {
        if (err2) {
          cb(err2);
        }
        this._repoDbFilename = resolve(this._scanPath, `${this.options.localRepoDir}.db`);
        this._dependencyDbFilename = resolve(this._scanPath, `dependency.db`);
        this._licenseDbFilename = resolve(this._scanPath, `license.db`);
        this._logPath = resolve(this._scanPath, this.logFile);
        this._reportPath = resolve(this._scanPath, this.reportFile);
        this._extPath = resolve(this._scanPath, this.extDir);
        this._log = createWriteStream(this._logPath, { flags: 'a+' });
        this._report = createWriteStream(this._reportPath, { flags: 'a+' });
        this._repoDb = new Nedb({ filename: this._repoDbFilename, autoload: true } );
        // this._licenseDb = new Nedb({ filename: this._licenseDbFilename, autoload: true });
        // this._dependencyDb = new Nedb({ filename: this._dependencyDbFilename, autoload: true });
        cb(null, this);
      });
    });
  }
  get workingDir() {
    return this.options.workingDir;
  }
  get goal() {
    return this.options.goal;
  }
  get profile() {
    return this.options.profile;
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
  get reportFile() {
    return this.options.reportFile;
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
  get extTxtFiles(): boolean {
    return this.options.extTxtFiles;
  }
  get extDir(): string {
    return this.options.extDir;
  }
  get extPath(): string {
    return this._extPath;
  }

  get args(): string[] {
    const args: string[] = [];
    if (this.settings && this.settings.length > 0) {
      args.push('-s');
      args.push(this.settings);
    }
    if (this.destPom && this.destPom.length > 0) {
      args.push('-f');
      args.push(this.destPom);
    }
    if (this.profile && this.profile.length > 0) {
      args.push(`-P${this.profile}`);
    }
    if (this.localRepo && this.localRepo.length > 0) {
      args.push(`-Dmaven.repo.local=${this.localRepo}`);
    }
    args.push(this.goal);
    return args;
  }
  get logPath(): string {
    return this._logPath;
  }
  get log(): WriteStream {
    return this._log;
  }
  get reportPath(): string {
    return this._reportPath;
  }
  get report(): WriteStream {
    return this._report;
  }
}
