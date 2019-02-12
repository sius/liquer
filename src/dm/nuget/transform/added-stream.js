/**
 * Transform the NuGet log line stream into an object stream
 * @returns {(line, addedCallback: {(err: Error, addedObj:*) => void}) => void}
 * @param {*} options 
 */
function addedStream(options) {

  return (line, cb) => {
    options.log.write(`${line}\n`);
    const res = /Added package '(.+)' to folder/.exec(line);
    if (res) {
      const component_id = res[1];
      const fullname = component_id;
      cb(null, { component_id, fullname });
    } else {
      cb();
    }
  }
}

module.exports = { addedStream }
