import { GAV } from './gav';
import { License } from './license';

export interface Dependency {
  _id?: string;
  gav: GAV;
  downloaded: string;
  type: string;
  pomfile: string;
  pom: any;
  bestLicense: License;
  vulnarabilites?: [];
}
