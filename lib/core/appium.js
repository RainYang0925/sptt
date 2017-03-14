'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var sh = require('shelljs');
var yiewd  = require('./yiewd');

exports.getClientConfig = function(env){
  log.info('sptt:','get appium config in ' + env);
  if(!env || env == 'local'){
    return require('./config/appium-server.local.json');
  }else{
    return require('./config/appium-server.cloud.json');
  }
};

exports.initServer = function(setting){
  var {output} = setting,cmd = "ps | grep 'node .*/appium'";
  var info = sh.exec(cmd, {silent:true}).stdout,
    snapshootLocation;
  info.split('\n').forEach(function(line){
    if(line.indexOf('bin/appium') !== -1){
      log.info('sptt:','kill the old appium process');
      let pid = line.split(' ')[0];
      sh.exec(`kill -9 ${pid}`,{silent: true});
    //  process.kill(pid);
    }
  });

  log.info('sptt:','after kill the load process, start the new one');
  sh.exec('appium | tee ' + path.join(process.cwd(),output,'appium.log') + ' &',{async: true,silent: true});

  // 创建视图快照存储目录
  global.snapshootLocation = snapshootLocation = path.join(process.cwd(),output,'snapshoot');
  mkdirp(snapshootLocation);
};

exports.initClient = function(config){
  log.info('sptt:','create a new client');
  global.driver = yiewd.remote(config.host,config.port);
};

exports.quitClient = function* (){
  log.info('sptt:','quit the current client');
  yield *driver.quit();
};
