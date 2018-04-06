var cv = require('../lib/opencv');

const path = require('path');

const source = '/Volumes/data/mguillon/Downloads/attachment-5572416865898409016Screenshot-1005-153405.png';
cv.readImage(source, function (err, im) {
  if (err) throw err;
  if (im.width() < 1 || im.height() < 1) throw new Error('Image has no size');

  var result = im.batchAdjust({
    // histogram: {
    //   channels: [0],
    //   ranges: [0, 256],
    //   sizes: [50]
    // },
    
    contrast: 1,
    // brightness: -0.5
  });
  im.save(path.join(path.dirname(source), 'test.png'))
  console.log('batchadjust done', result);
});
