'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var sh = require('shelljs');
var yiewd  = require('./yiewd');
var _ = require('lodash');

exports.getClientConfig = function(env){
  log.info('sptt:','get appium config in ' + env);
  if(!env || env == 'local'){
    return require('./config/appium-server.local.json');
  }else{
    return require('./config/appium-server.cloud.json');
  }
};

exports.initServer = function(setting){
  var {output,online} = setting,cmd = "ps | grep 'node .*/appium'";
  var snapshootLocation,env = online ? 'cloud' : 'local';
  global.snapshootLocation = snapshootLocation = path.join(process.cwd(),output,'snapshoot');

  if(!online){
    sh.exec(cmd, {silent:true}).stdout
      .split('\n').forEach(function(line){
        if(line.indexOf('bin/appium') !== -1){
          log.info('sptt:','kill the old appium process');
          let pid = _.trim(line).split(' ')[0];
          sh.exec(`kill -9 ${pid}`,{silent: true});
        }
      });

    log.info('sptt:','after kill the load process, start the new one at local');
    sh.exec('appium | tee ' + path.join(process.cwd(),output,'appium.log') + ' &',{async: true,silent: true});
  }else{
    let remoteIP = this.getClientConfig(env).host;
    if(!(online == true)){
      remoteIP = online;
    }

    cmd = `ps -ef | grep bin/appium | grep -v grep | awk '{cmd="kill -9 "$2;system(cmd)}'`;
    sh.exec(`ssh showjoy@${remoteIP} ${cmd}`,{silent:true});
    log.info('sptt:','after kill the load process, start the new one at remote host');
    // mac上使用nohup，linux上使用setsid
    sh.exec(`nohup ssh showjoy@${remoteIP} 'export PATH=$PATH:/usr/local/bin; appium' &> ` + path.join(process.cwd(),output,'appium.log') + ` &`,{silent: true});
  }

  // 创建视图快照存储目录
  mkdirp(snapshootLocation);
};

exports.initClient = function(config,online){
  log.info('sptt:','create a new client');
  // 首先判断是否提供online地址，如果提供则优先使用
  try{
    if(typeof online == 'string'){
      global.driver = yiewd.remote(online,config.port);
    }else{
      global.driver = yiewd.remote(config.host,config.port);
    }
  }catch(e){
    log.error('sptt:','please input the correct url of the cloud\' host');
    process.exit(1);
  }

};

exports.quitClient = function* (){
  log.info('sptt:','quit the current client');
  yield *driver.quit();
};
