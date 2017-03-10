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

  }
});

module.exports = Debugger;