"use strict";
var wd = require("wd")
  , Q = wd.Q
  , monocle = require("monocle-js")
  , apsc = function(obj) { return Array.prototype.slice.call(obj, 0); };

var yiewd = module.exports = {};

// 添加swipe动作
wd.addPromiseChainMethod('swipe', function swipe(opts) {
  var action = new wd.TouchAction(this);
  action
    .press({x: opts.startX, y: opts.startY})
    .wait(opts.duration)
    .moveTo({x: opts.endX, y: opts.endY})
    .release();
  return action.perform();
});

wd.addPromiseChainMethod('reportStatus', function(passed) {
  if (this._yiewd_sauce === null) {
    throw new Error("Status reporting is for Sauce Labs tests");
  }
  return Q.nfcall( this._yiewd_sauce.updateJob.bind(this._yiewd_sauce),
    this.sessionID , {passed: passed});
});

wd.addPromiseChainMethod('reportPass', function() {
  return this.reportStatus(true);
});

wd.addPromiseChainMethod('reportFail', function() {
  return this.reportStatus(false);
});

wd.addPromiseChainMethod('sauceInfo', function() {
  if (this._yiewd_sauce === null) {
    throw new Error("Showing job info is for Sauce Labs tests");
  }
  return Q.nfcall(
    this._yiewd_sauce.showJob.bind(this._yiewd_sauce), this.sessionID);
});

yiewd.remote = function() {
  var args = apsc(arguments);
  var d = wd.promiseChainRemote.apply(wd, args);
  d.defaultChainingScope = 'element';
  d.run = function(gen) { return monocle.run(gen, d); };
  return d;
};

yiewd.TouchAction = wd.TouchAction;
yiewd.MultiAction = wd.MultiAction;
yiewd.SPECIAL_KEYS = wd.SPECIAL_KEYS;
