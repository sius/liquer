import { writeFile } from 'fs';
import { resolve, basename } from 'path';

[
  '../model/MavenDependency'
]
.forEach( (schema) => {
  writeFile(
      `${resolve(__dirname, basename(schema))}.json`
    , JSON.stringify((require(schema)).jsonSchema(), null, 2)
    , (_err) => { } );
});
