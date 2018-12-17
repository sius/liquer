export interface DoctorOptions {
  receipt: string;
}

export class Doctor {

  constructor(private options: DoctorOptions = null) {

  }
  public receipt(): Promise<void> {
    return new Promise( (resolve, reject) => {
      reject();
    });
  }
}
