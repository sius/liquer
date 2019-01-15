let { spawn }      = require('child_process')
  , { split, map } = require('event-stream')
  , pattern        = /\[INFO\]\s{4}([^:]+):([^:]+):([^:]+):([^:]+):(compile|runtime)$/;

/**
 * Retrieve runtime dependencies from maven:
 * mvn -f pom.xml -Dmaven.repo.local=<localRepo> -DincludeScope=runtime dependency:list
 * @param {*} options 
 * @param {(*) => void} callback 
 */
function dlist(options, callback) {
  spawn(options.command, [
      '-s', options.settings,
      '-f', options.pom
    , `-Dmaven.repo.local=${options.localRepo}`
    , '-DincludeScope=runtime'
    , 'dependency:list'])
    .stdout
      .pipe(split())
      .pipe(map((line, cb) => {
        const res = pattern.exec(line);
        if (res) {
          callback({ 
              groupId   : res[1]
            , artifactId: res[2]
            , type      : res[3]
            , version   : res[4]
            , scope     : res[5] });
          cb()
        } else {
          cb()
        }
      })
    )
    .on('end', () => process.exit(0));
}

process.on('message', options => {
  // console.log(grey('fork mvn -DincludeScope=runtime dependency:list'));
  dlist(options, (dependency) => {
    process.send(dependency)
  })
})
