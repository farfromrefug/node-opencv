var binary = require('node-pre-gyp-prod'),
    path = require('path'),
    binding_path = binary.find(path.resolve(path.join(__dirname, '../package.json')), {
        debug: (process.execArgv.indexOf('--debug') > -1)
    }),
    binding = require(binding_path);

// module.exports = require('../build/Release/opencv.node');
module.exports = binding;
