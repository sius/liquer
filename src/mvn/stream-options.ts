import * as Nedb from 'nedb';
import { WriteStream } from 'fs';

export interface StreamOptions {
  goal: string;
  settings: string;
  destPom: string;
  repoDb: Nedb;
  licenseDb: Nedb;
  dependencyDb: Nedb;
  remoteRepo: string;
  localRepo: string;
  log: WriteStream;
  logPath: string;
  report: WriteStream;
  reportPath: string;
}
