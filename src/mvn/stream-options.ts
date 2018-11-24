import * as Nedb from 'nedb';
import { WriteStream } from 'fs';

export interface StreamOptions {
  settings: string;
  repoDb: Nedb;
  licenseDb: Nedb;
  dependencyDb: Nedb;
  remoteRepo: string;
  localRepo: string;
  log: WriteStream;
  report: WriteStream;
}
