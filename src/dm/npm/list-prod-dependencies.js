let { spawn }      = require('child_process')
  , { split, map } = require('event-stream')
  , { grey  }      = require('chalk')
  , pattern        = /:(((@[^:@]+)\/)?([^:@]+)@([^:@]+)):[^:@]+$/; // /home/sius/dev/liquer/node_modules/which:which@1.3.1:undefined

/**
 * Retrieve prod dependencies:
 * npm ls -prod -parseable
 * @param {*} options 
 * @param {(*) => void} callback 
 */
function lsprod(options, callback) {

  const args = [ 'ls', '-prod', '-long', '-parseable']
  if (options.registry) {
    args.push('--registry', options.registry);
  };

  const spawnOptions = { 
    cwd: options.cwd
  , env: process.env }; 
  spawn(options.command, args, spawnOptions)
    .stdout
      .pipe(split())
      .pipe(map((line, cb) => {
        let res = pattern.exec(line);
        if (res) {
          const fullname = res[1];
          const scope = res[3] || null;
          const name = res[4];
          const version = res[5];
          callback({ fullname, scope, name, version });
          cb(null, fullname)
        } else {
          cb(null, line)
        }
      })
    )
    .on('end', () => process.exit(0));
}

process.on('message', options => {
  // console.log(grey(`fork npm ls -prod -long -parseable`));
  lsprod(options, (dependency) => {
    process.send(dependency)
  })
})
