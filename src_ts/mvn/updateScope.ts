import { fork } from 'child_process';
import { resolve } from 'path';
import { magenta } from 'colors';
import { StreamOptions } from './stream-options';
import { GATVS } from './gatvs';
import { GAV } from './gav';
import { Dependency } from './dependency';

export function updateScope(opts: StreamOptions, callback: (o: StreamOptions) => void) {
  const repoDb = opts.repoDb;
  const log = opts.log;
  const dlist = fork(resolve(__dirname, 'dependencyList.js'));

  dlist.send(opts);

  dlist.on('exit', (code: number, signal: string) => {
    console.log(magenta('updated runtime dependencies'));
    console.log(magenta(`finished with code/signal: ${code}/${signal}`));
    callback(opts);
  });

  dlist.on('message', (data: GATVS) => {
    if (data) {
      repoDb.find( data as GAV, (err: Error, docs: Dependency[]) => {
        if (err) {
          log.write(err.message);
        } else {
          for (const d of docs) {
            d.gatvs = data;
            repoDb.update({ _id: d._id }, d, {}, (err2: Error, _numUpdated: number) => {
              if (err2) {
                log.write(err2.message);
              }
            });
          }
        }
      });
    }
  });
}
