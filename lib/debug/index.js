'use strict';

var path = require('path');

function Debugger(driver){
  if(!(this instanceof Debugger)){
    return new Debugger();
  }
  this.driver = driver;
}

Object.assign(Debugger.prototype, {
  /**
   * @param callFormat 我的主页@name[click]
   */
  screenShot: function*(callFormat){
    var contexts;
    // 如果当前视图在webview中，需要切换为native
    if(callFormat.indexOf('@css') !== -1){
      contexts = yield driver.contexts();
      yield driver.context(contexts[0]);
      yield driver.sleep(10);
    }
    var d = new Date(),
      timeFormat = (d.getMonth() + 1) + '.' + d.getDate() + '-' + d.getHours() + '：' + d.getMinutes() + '：' + d.getSeconds(),
      fileName;

    callFormat = callFormat.replace(/\//g,'%');
    fileName = callFormat + '{' + timeFormat + '}.png';

    try{
      yield driver
        .takeScreenshot()
        .saveScreenshot(path.join(snapshootLocation,fileName));
    }catch(e){
      log.warn('sptt:','screenshot error with ' + fileName);
    }

    if(callFormat.indexOf('@css') !== -1){
      // 切换为webview
      yield driver.context(contexts[contexts.length - 1]);
    }

  }
});

module.exports = Debugger;