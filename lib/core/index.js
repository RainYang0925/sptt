'use strict';

var fs = require('fs'),
  path = require('path'),
  Mocha = require('mocha'),
  sh = require('shelljs'),
  mkdirp = require('mkdirp'),
  expect = require('chai').expect,
  appium = require('./appium'),
  $ = require('./selector'),
  simulator = require('./simulator'),
  view = require('./view'),
  runner = require('./run'),
  dir = require('../env'),
  debug = require('../debug'),
  Logger = require('../log');

// 将选择器暴露至全局
global.$ = $;
global.view = view;
global.chai = require('chai');

exports.clearAndInit = function(opts){
  var {type,online} = opts,output = 'out';
  var env = online ? 'cloud' : 'local',
    out = path.resolve(process.cwd(),output);

  // 清空输出目录
  dir.clearDir(out,true);

  mkdirp(path.resolve(process.cwd(),output));

  // todo：设置全局log对象
  global.log = new Logger(require('npmlog'),out);
  // 预先删除当前的simulator
  simulator.delCurrentSimulator();

  // build目录清除
  var buildPath = dir.getBuildPath();
  try{
    // 清空build目录
    dir.clearDir(buildPath);

  }catch(e){
    log.error('sptt:','clear dir occur an error, check sptt\'s permission');
    process.exit(1);
  }


  var p = new Promise(function(res,rej){
    appium.initServer({
      output
    });
    runner.loadTestCases(res,{
      buildPath,
      type,
      output
    });
  });

  p.then(function(){
    log.info('准备运行环境');
    appium.initClient(appium.getClientConfig(env));
    global.debug = debug(driver);

    var mocha = new Mocha({
      reporter: 'mochawesome',
      reporterOptions: {
        reportDir: path.resolve(process.cwd(),output),
        reportFilename: 'testcaseReport',
        quiet: true,
        enableCharts: false
      }
    });

    // Add each .js file to the mocha instance
    fs.readdirSync(buildPath).filter(function(file){
      // Only keep the .js files
      return file.substr(-3) === '.js';

    }).forEach(function(file){
      mocha.addFile(
        path.join(buildPath, file)
      );
    });

    // Run the tests.
    mocha.run(function(failures){
      log.info('sptt:','now you can visit the reporter by the browser');
      process.exit(failures);
    });
  })
};

