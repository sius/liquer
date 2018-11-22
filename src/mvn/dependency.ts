import { GAV } from './gav';
import { License } from './license';

export interface Dependency {
  downloaded: string;
  gav: GAV;
  type: string;
  pomfile: string;
  pom: any;
  bestLicense: License;
  vulnarabilites?: [];
}
