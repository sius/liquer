import * as Nedb from 'nedb';
import { WriteStream } from 'fs';

export interface StreamOptions {
  repoDb: Nedb;
  licenseDb: Nedb;
  dependencyDb: Nedb;
  remoteRepo: string;
  localRepo: string;
  log: WriteStream;
}
