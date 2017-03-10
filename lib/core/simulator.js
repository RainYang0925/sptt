'use strict';

var sh = require('shelljs');
var log = require('npmlog');

/**
 * @param: type  'iPhone 7 Plus'
 */
exports.getDeviceTypeId = function(type){
  log.info('sptt:','get devicetypes of iOS simulator');
  var out = sh.exec('xcrun simctl list devicetypes',{silent:true}).stdout;
  var regexp = new RegExp(type + '\s*\(([\)]*)\)','gi');
  var ret = out.match(regexp);
  if(ret){
    return ret[1];
  }
};

/**
 * @param: type  'iOS 10.2'
 */
exports.getRuntimeId = function(type){
  log.info('sptt:','get runtime of iOS simulator');
  var out = sh.exec('xcrun simctl list runtimes',{silent:true}).stdout;
  var ret = out.match(new RegExp(type + '\s*?\(.*\)\s*?\(([\)]*)\)','gi'));
  if(ret){
    return ret[1];
  }
};

exports.delCurrentSimulator = function(){
  log.info('sptt:','delete current simulator');
  var out = sh.exec('xcrun simctl list devices',{silent:true}).stdout;
  var ret = out.match(RegExp('\s*?\((.*?)\)\s*?\(Booted\)'));
  if(ret){
    sh.exec('xcrun simctl shutdown ' + ret[1],{silent: true});
  }
};

exports.createiOSSimulator = function(type,runtime){
  log.info('sptt:','renew a simulator');
  var deviceTypeId = this.getDeviceTypeId(type);
  var runtimeId = this.getRuntimeId(runtime);
  this.delCurrentSimulator();
  sh.exec('xcrun simctl create ' + type + ' ' + deviceTypeId + ' ' + runtimeId);
};