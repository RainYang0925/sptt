'use strict';

var path = require('path'),
  fs = require('fs'),
  home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
  spttLocalRoot = path.join(home,'.sptt'),
  buildDir = path.join(spttLocalRoot,'build');

var init = function(){
  // 初始化工作目录
  if(!fs.existsSync(spttLocalRoot)){
    // 创建 .spon目录
    fs.mkdirSync(spttLocalRoot);
  }

  if(!fs.existsSync(buildDir)){
    // 创建 .spon/build目录
    fs.mkdirSync(buildDir);
  }
};

var getBuildPath = function(){
  return buildDir;
};

var clearDir = function(location,isDelDir) {
  var files = [],path = location;
  if(fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file){
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) {
        // recurse
        clearDir(curPath,isDelDir);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    if(isDelDir)
      fs.rmdirSync(location);
  }
};

exports.init = init;
exports.getBuildPath = getBuildPath;
exports.clearDir = clearDir;
exports.yo = require('./yoman');