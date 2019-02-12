const { writeFile } = require('fs');
const { resolve, basename } = require('path');

[
  '../model/MavenDependency'
]
.forEach( (schema) => {
  writeFile(
      `${resolve(__dirname, basename(schema))}.json`
    , JSON.stringify((require(schema)).jsonSchema(), null, 2)
    , (_err) => { } );
});
