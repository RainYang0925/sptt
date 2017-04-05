'use strict';

var path = require('path');
var fs = require('fs');
var request = require('request');
var appInfo = require(path.join('../../','package.json'));
var env = require('../env');
var log = require('npmlog');

// 初始化目录
env.init();

module.exports = function(cli){

  cli
    .version(appInfo.version)
    .usage('欢迎使用showjoy测试套件－sptt <cmd> [subcmd]')
    .parse(process.argv);

  cli
    .command('run')
    .option("-t, --type [type]","当前自动化测试的系统类型（iOS或android）")
    .option("--online [type]","云端测试")
    .option("-n, --names [type]","指定执行具体名称的测试用例文件")
    .action(function(cmd){
      var defaultOpt = {
          type: 'ios',
          online: false
        },opts = {};
      switch(cmd){
        case 'run':
        default:
          opts = Object.assign(opts,defaultOpt);
          opts.type = cmd.type || opts.type;
          // 记录操作系统
          global.OSType = opts.type;
          opts.online = cmd.online || opts.online;
          opts.name = cmd.names && cmd.names.split(/[,，]/g) || null;
          require('../core').clearAndInit(opts);
          break;
      }
    });

  cli
    .command('init')
    .action(function(){
      var yo = env.yo(),
        cwd = process.cwd(),
        dirPath = path.join(__dirname,'../env/templates');

      yo.mkdir(['ios','android']);
      // 初始化目录结构
      yo.copy(path.join(dirPath,'ios'),path.join(cwd,'ios'));
      yo.copy(path.join(dirPath,'android'),path.join(cwd,'android'));

      // 拷贝配置文件
      yo.cpFile(path.join(cwd,'caps.json'),path.join(dirPath,'ios/caps.json'));
     // yo.cpFile(path.join(dirPath,'android/caps.json'),cwd);
    });

  // 只针对ios包进行发布
  cli
    .command('publish')
    .action(function(cmd){
      var versionReg = /^\d{1,}\.\d{1,}\.\d{1,}$/i;
      if(cmd && cmd.match(versionReg)){
        require('../core/publish').send(cmd);
      }else{
        log.error('sptt:','version format must "xx.xx.xx"');
        process.exit(1);
      }
    });
};
