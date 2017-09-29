var cv = require('../lib/opencv');
var process = require('process');
var fs = require('fs');


fs.readFile(process.argv[2], function (err, data) {
  if (err) {
    throw err;
  }
  var mat16 = new cv.Matrix(480, 640,cv.Constants.CV_16UC1, data);
  var mat8 = new cv.Matrix(480, 640,cv.Constants.CV_8UC1);
  mat16.convertTo(mat8, cv.Constants.CV_8UC1, 1/16);
  // var mat8RGB = new cv.Matrix(480, 640,cv.Constants.CV_8UC1);
  // mat8.cvtColor(mat8RGB, 'BayerGR2RGB');
  mat8.save('./image.png');
});
