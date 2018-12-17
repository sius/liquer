import { GAV } from './gav';
import { License } from './license';
import { Dependency } from '../lib/Dependency';

export interface MavenDependency extends Dependency {
  _id?: string;
  gav: GAV;
  downloaded: string;
  filename: string;
  extname: string;
  dirname: string;
  type: string;
  // pomfile: string;
  pom: any;
  bestLicense: License;
  vulnarabilites?: [];

  files?: string[];
  hasPomFile?: boolean;
  hasJarFile?: boolean;
  license?: any;
  pomSha1?: string;
  jarSha1?: string;
  isBOM?: boolean;
  extractedFiles?: any;
}
