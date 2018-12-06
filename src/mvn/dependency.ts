import { GAV } from './gav';
import { License } from './license';
import { GATVS } from './gatvs';

export interface Dependency {
  _id?: string;
  gav: GAV;
  gatvs: GATVS;
  downloaded: string;
  type: string;
  pomfile: string;
  pom: any;
  bestLicense: License;
  vulnarabilites?: [];
}
