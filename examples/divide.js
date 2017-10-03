var cv = require('../lib/opencv');

cv.readImage("./files/divided1.jpg", function(err, divide1) {
  if (err) throw err;

  cv.readImage("./files/divided2.jpg", function(err, divide2) {
    if (err) throw err;
    console.log('divide', divide1.size());
    var result = new cv.Matrix(divide1.width(), divide1.height());
    result.divide(divide1, divide2, 78);
    result.save("./tmp/divided.jpg");
    console.log('Image saved to ./tmp/divided.jpg');
  });

});
