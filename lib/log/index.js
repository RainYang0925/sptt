'use strcit';

var fs = require('fs'),
  path = require('path');

function Logger(log,location){
  // npmlog实例
  this.log = log;
  // 日志输出路径
  this.path = location;
  this.writer = fs.createWriteStream(path.join(location,'sptt.runtime.log'));
}

Object.assign(Logger.prototype, {
  info() {
    var args = [].slice.call(arguments);
    // 命令行输出
    this.log.info.apply(this.log,args);
    // 日志输出
    if(args[0] && args[1]){
      this.writer.write(`info ` + args[0] + ' ' + args[1] + '\n');
    }else{
      this.writer.write(`info ` + args[0] + '\n');
    }
  },
  warn() {
    var args = [].slice.call(arguments);
    // 命令行输出
    this.log.warn.apply(this.log,args);
    // 日志输出
    if(args[0] && args[1]){
      this.writer.write(`warn ` + args[0] + ' ' + args[1] + '\n');
    }else{
      this.writer.write(`warn ` + args[0] + '\n');
    }

  },
  error() {
    var args = [].slice.call(arguments);
    // 命令行输出
    this.log.error.apply(this.log,args);
    // 日志输出
    if(args[0] && args[1]){
      this.writer.write(`error ` + args[0] + ' ' + args[1] + '\n');
    }else{
      this.writer.write(`error ` + args[0] + '\n');
    }

  }
});

module.exports = Logger;