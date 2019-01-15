export interface ReporterOptions {
  repoDb: Nedb;
  scanPath: string;
  localRepo: string;
  pom: string;
}

export class Reporter {

  constructor(private options: ReporterOptions = null) {

  }
  public report(): Promise<void> {
    return new Promise( (resolve, reject) => {
      reject();
    });
  }
}
