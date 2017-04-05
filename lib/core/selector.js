'use strict';

var view = require('./view');

// 用于native端定位
exports.findElementByName = function*(name){
  var el;
  try{
    el = yield driver.waitForElementByName(name);
  }finally{
    return el;
  }
};

exports.findElementByAccessibilityId = function*(id){
  var el;
  try{
    el = yield driver.waitForElementByAccessibilityId(id);
  }finally{
    return el;
  }
};

exports.findElementById = function*(id){
  var el;
  try{
    el = yield driver.waitForElementById(id);
  }finally{
    return el;
  }
};

// 抓取第index个classname的元素
exports.findElementByClassName = function*(classname,index){
  var el;
  try{
    el = yield driver.waitForElementsByClassName(classname).at(index);
  }finally{
    return el;
  }
};

exports.findElementByXPath = function*(path){
  var el;
  try{
    el = yield driver.waitForElementByXPath(path);
  }finally{
    return el;
  }
};

// 添加webview中查找元素，selector语法与jQuery语法类似
exports.findElementByCssSelector = function* (selector){
  yield view.checkToWebview();
  return yield driver.waitForElementByCssSelector(selector);
};

exports.hasElement = function*(type,selector){
  var ret = false;
  switch(type){
    case 'id':
      ret = yield driver.hasElementById(selector);
      if(!ret){
        yield view.checkToWebview();
        ret = yield driver.hasElementById(selector);
      }
      break;
    case 'accessibilityId':
      ret = yield driver.hasElementByAccessibilityId(selector);
      if(!ret){
        yield view.checkToWebview();
        ret = yield driver.hasElementByAccessibilityId(selector);
      }
      break;
    case 'className':
      ret = yield driver.hasElementByClassName(selector);
      if(!ret){
        yield view.checkToWebview();
        ret = yield driver.hasElementByClassName(selector);
      }
      break;
    case 'name':
      ret = yield driver.hasElementByName(selector);
      if(!ret){
        yield view.checkToWebview();
        ret = yield driver.hasElementByName(selector);
      }
      break;
    case 'xpath':
      ret = yield driver.hasElementByXPath(selector);
      if(!ret){
        yield view.checkToWebview();
        ret = yield driver.hasElementByXPath(selector);
      }
      break;
  }
  return ret;
};
