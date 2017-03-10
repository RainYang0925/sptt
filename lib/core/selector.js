'use strict';

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

exports.hasElement = function*(type,selector){
  var ret = false;
  switch(type){
    case 'id':
      ret = yield driver.hasElementById(selector);
      break;
    case 'accessibilityId':
      ret = yield driver.hasElementByAccessibilityId(selector);
      break;
    case 'className':
      ret = yield driver.hasElementByClassName(selector);
      break;
    case 'name':
      ret = yield driver.hasElementByName(selector);
      break;
    case 'xpath':
      ret = yield driver.hasElementByXPath(selector);
      break;
  }
  return ret;
};
