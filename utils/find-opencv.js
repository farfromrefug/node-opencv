"use strict";

var exec = require("child_process").exec;
var fs = require("fs");
var path = require("path");
var flag = process.argv[2] || "--exists";

// Normally |pkg-config opencv ...| could report either OpenCV 2.x or OpenCV 3.y
// depending on what is installed.  To enable both 2.x and 3.y to co-exist on
// the same machine, the opencv.pc for 3.y can be installed as opencv3.pc and
// then selected by |export PKG_CONFIG_OPENCV3=1| before building node-opencv.
var opencv = process.env.PKG_CONFIG_OPENCV3 === "1" ? "opencv3" : '"opencv >= 2.3.1"';

function main() {
  //Try using pkg-config, but if it fails and it is on Windows, try the fallback
  exec("pkg-config " + opencv + " " + flag, function (error, stdout, stderr) {
    if (error) {
      //   if (process.platform === "win32") {
      fallback();
      //   } else {
      //     throw new Error("ERROR: failed to run: pkg-config", opencv, flag);
      //   }
    } else {
      console.log(stdout);
    }
  });
}

//======================Windows Specific=======================================

function fallback() {
  exec((process.platform === "win32") ? "echo %OPENCV_DIR%" : "echo $OPENCV_DIR", function (error, stdout, stderr) {
    stdout = cleanupEchoOutput(stdout);
    if (error) {
      throw new Error("ERROR: There was an error reading OPENCV_DIR");
    } else if (stdout === "%OPENCV_DIR%") {
      throw new Error("ERROR: OPENCV_DIR doesn't seem to be defined");
    } else {
      printPaths(stdout);
    }
  });
}

function printPaths(opencvPath) {
  if (opencvPath) {
    opencvPath = opencvPath.replace(/^\"|[\"\n]*$/g, "");
  }
  if (flag === "--cflags") {
    if (process.platform === "win32") {
      console.log("\"" + path.join(opencvPath, "..", '..', 'include') + "\"");
      console.log("\"" + path.join(opencvPath, "..", '..', 'include', 'opencv') + "\"");
    } else {
      console.log("\"" + path.join(opencvPath, 'include') + "\"");
      console.log("\"" + path.join(opencvPath, 'include', 'opencv') + "\"");
    }
  } else if (flag === "--libs") {
    var libPath = path.join(opencvPath, "staticlib");
    if (!fs.existsSync(libPath)) {
      libPath = path.join(opencvPath, "lib");
    }
    fs.readdir(libPath, function (err, files) {
      if (err) {
        throw new Error("ERROR: couldn't read the lib directory " + err);
      }
      if (process.platform === "win32") {
        var libs = "\"vfw32.lib\"\r\n \"comctl32.lib\"\r\n ";
        for (var i = 0; i < files.length; i++) {
          var ext = getExtension(files[i]);
          if (ext === "lib") {

            libs = libs + " \"" + path.join(libPath, files[i]) + "\" \r\n ";
          }
        }
        console.log(libs);
      } else {
        var result = '-L' + libPath + ' ';
        var thirpath = path.join(opencvPath, 'share', 'OpenCV', '3rdparty', 'lib');
        if (fs.existsSync(thirpath)) {
            result += '-L' + thirpath + ' ';
            files = files.concat(fs.readdirSync(thirpath));
        }

        for (var i = 0; i < files.length; i++) {
          var ext = getExtension(files[i]);
          if (ext === 'a') {

            result += " -l" + files[i].slice(3, -2);
          }
        }
        console.log(result);
      }

    });
  } else {
    throw new Error("Error: unknown argument '" + flag + "'");
  }
}

function cleanupEchoOutput(s) {
  if (process.platform === "win32")
    return s.slice(0, s.length - 2);
  else return s;
}

function getExtension(s) {
  return s.substr(s.lastIndexOf(".") + 1);
}
main();
