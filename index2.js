const throughParallel = require('through2-parallel');

const stream = throughParallel.obj({ concurrency: 1 }, function (chunk, enc, cb) {
  const self = this;
  setTimeout(function () {
    console.log('Completed ' + chunk.order);
    self.push(chunk.order);
    cb();
  }, chunk.time);
  // console.log('Started ' + chunk.order);
});

stream.on('data', function (chunk) {
  // console.log('Emitted: ' + chunk);
});

stream.write({ time: 3000, order: 1 });
stream.write({ time: 2000, order: 2 });
stream.write({ time: 1000, order: 3 });
stream.end();

