'use strict';

var path = require('path');
var fs = require('fs');
var request = require('request');
var appInfo = require(path.join('../../','package.json'));
var env = require('../env');

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
    .option("-o,--output","输出目录")
    .option("--online","云端测试")
    .action(function(cmd){
      var options = cmd.options,
        defaultOpt = {
          type: 'ios',
          output: 'out',
          online: false
        },opts = {};
      switch(cmd){
        case 'run':
        default:
          opts = Object.assign(opts,defaultOpt);
          opts.type = options.type || opts.type;
          opts.output = options.output || opts.output;
          opts.online = options.online || opts.online;
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
};
