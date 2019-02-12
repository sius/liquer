require('mocha');
const assert = require('chai').assert;
const opath = require('object-path');
const { objFromXmlString, isArray } = require('../../src/lib/utils');

describe('object-path', () => {

  it('should find value by path expression', (done) => {
    objFromXmlString("<book><title>Harry Potter</title></book>", (err, xmlObj) => {
      assert(opath.get(xmlObj, 'book.title') == 'Harry Potter');
      done();
    })
  });

  it('should find multiple values by path expression and return an array', (done) => {

    const xmlStr =
      `<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>4.0.0</modelVersion>
        <groupId>com.jamesward</groupId>
        <artifactId>multi</artifactId>
        <version>1.0-SNAPSHOT</version>
        <packaging>pom</packaging>
        <name>multi</name>
        <modules>
          <module>core</module>
          <module>app</module>
        </modules>
     </project>`;

    objFromXmlString(xmlStr, (err, xmlObj) => {
      const actual = opath.get(xmlObj, 'project.modules.module');
      assert(actual.length === 2);
      done();
    })
  });

  it('should find a single value by path expression and return a single object', (done) => {

    const xmlStr =
      `<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>4.0.0</modelVersion>
        <groupId>com.jamesward</groupId>
        <artifactId>multi</artifactId>
        <version>1.0-SNAPSHOT</version>
        <packaging>pom</packaging>
        <name>multi</name>
        <modules>
          <module>core</module>
        </modules>
     </project>`;

    objFromXmlString(xmlStr, (err, xmlObj) => {
      const actual = opath.get(xmlObj, 'project.modules.module');
      assert(!isArray(actual));
      assert(actual === 'core');
      done();
    })
  });

  it('should return undefined on empty node', (done) => {

    const xmlStr =
      `<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>4.0.0</modelVersion>
        <groupId>com.jamesward</groupId>
        <artifactId>multi</artifactId>
        <version>1.0-SNAPSHOT</version>
        <packaging>pom</packaging>
        <name>multi</name>
        <modules>
         
        </modules>
     </project>`;

    objFromXmlString(xmlStr, (err, xmlObj) => {
      const actual = opath.get(xmlObj, 'project.modules.module');
      assert(actual === undefined);
      done();
    })
  });

  it('should return undefined on self closing element', (done) => {

    const xmlStr =
      `<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>4.0.0</modelVersion>
        <groupId>com.jamesward</groupId>
        <artifactId>multi</artifactId>
        <version>1.0-SNAPSHOT</version>
        <packaging>pom</packaging>
        <name>multi</name>
        <modules />
     </project>`;

    objFromXmlString(xmlStr, (err, xmlObj) => {
      const actual = opath.get(xmlObj, 'project.modules.module');
      assert(actual === undefined);
      done();
    })
  });

  it('should return undefined: path does not exist', (done) => {

    const xmlStr =
      `<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>4.0.0</modelVersion>
        <groupId>com.jamesward</groupId>
        <artifactId>multi</artifactId>
        <version>1.0-SNAPSHOT</version>
        <packaging>pom</packaging>
        <name>multi</name>
     </project>`;

    objFromXmlString(xmlStr, (err, xmlObj) => {
      const actual = opath.get(xmlObj, 'project.modules.module');
      assert(actual === undefined);
      done();
    })
  });

});
