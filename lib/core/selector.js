'use strict';

var view = require('./view');
exports.findElementByName = function*(name){
  var el;
  try{
    el = yield driver.waitForElementByName(name);
  }catch(e){
    yield view.checkToWebview();
    el = yield driver.waitForElementByName(name);
  }finally{
    return el;
  }
};

exports.findElementByAccessibilityId = function*(id){
  var el;
  try{
    el = yield driver.waitForElementByAccessibilityId(id);
  }catch(e){
    yield view.checkToWebview();
    el = yield driver.waitForElementByAccessibilityId(id);
  }finally{
    return el;
  }
};

exports.findElementById = function*(id){
  var el;
  try{
    el = yield driver.waitForElementById(id);
  }catch(e){
    yield view.checkToWebview();
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
  }catch(e){
    yield view.checkToWebview();
    el = yield driver.waitForElementsByClassName(classname).at(index);
  }finally{
    return el;
  }
};

exports.findElementByXPath = function*(path){
  var el;
  try{
    el = yield driver.waitForElementByXPath(path);
  }catch(e){
    yield view.checkToWebview();
    el = yield driver.waitForElementByXPath(path);
  }finally{
    return el;
  }
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
