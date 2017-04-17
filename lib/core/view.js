'use strict';
var _ = require('lodash');
var yiewd = require('./yiewd');
var redisUtil = require('../redis/redisUtil');

var scrollHorizontal = function* (el,direction){
  var windowSize = yield driver.getWindowSize();
  var location = yield el.getLocationInView();
  if(direction == 'left'){
    yield driver.swipe({
      startX: location.x,
      startY: location.y,
      endX: -windowSize.width,
      endY: 0,
      duration: 400
    });
  }else{
    yield driver.swipe({
      startX: 0,
      startY: location.y,
      endX: windowSize.width,
      endY: 0,
      duration: 400
    });
  }
};

// todo: 仅针对ios做自适应滚动
var scroll = exports.scroll = function* (el,direction){
  if(OSType.toLowerCase() == 'ios'){
    switch(direction){
      case 'down':
        yield driver.execute("mobile: scroll", [{direction: 'down'}]);
        break;
      case 'up':
        yield driver.execute("mobile: scroll", [{direction: 'up'}]);
        break;
      case 'left':
      case 'right':
        scrollHorizontal(el,direction);
        break;
    }
  }

};

var getWindowSize = function* (){
  var size;
  try{
    size = yield driver.getWindowSize();
  }catch(e){
    log.info('sptt:','get current window size occur error');
    size = {
      width: 1080,
      height: 1920
    };
  }

  return size;
};

// todo: 仅针对ios做自适应滚动
var scrollToView = exports.scrollToView = function* (el){
  if(OSType.toLowerCase() !== 'ios')
    return;

  if(yield el.isDisplayed()){
    return;
  }

  log.info('sptt:','begin scrollToView[↓]');
  yield *scroll(el,'down');
  // wd模块无法判断 查找元素的绝对位置，因此无法自动定位至可视窗口，只能采用先向下查找后向上查找的办法定位
  if(yield el.isDisplayed())
    return;

  log.info('sptt:','again scrollToView[↓]');
  yield *scroll(el,'down');
  if(yield el.isDisplayed())
    return;

  log.info('sptt:','last scrollToView[↓]');
  yield *scroll(el,'down');
  if(yield el.isDisplayed())
    return;

  // 回到起点
  yield *scroll(el,'up');
  yield *scroll(el,'up');
  yield *scroll(el,'up');

  // 如果向下滑动三次仍然没有找到元素，则向上滑动三次
  log.info('sptt:','begin scrollToView[↑]');
  yield *scroll(el,'up');
  if(yield el.isDisplayed())
    return;

  log.info('sptt:','again scrollToView[↑]');
  yield *scroll(el,'up');
  if(yield el.isDisplayed())
    return;

  log.info('sptt:','last scrollToView[↑]');
  yield *scroll(el,'up');
  if(yield el.isDisplayed())
    return;
  else{
    log.error('sptt:','cannot scroll to view');
  }
};

// 点击定位元素
var click = function* (op){
  var el = op.el,
    selector = op.selector,
    selectorType = op.selectorType;
  if(!el){
    log.warn('sptt:',`"${op.atomName}",current element[${selector}](${selectorType}) is null, so click is not done`);
    return;
  }

  try {
    if(yield el.isDisplayed()){
      log.info('sptt:',`"${op.atomName}",begin click element[${selector}](${selectorType})`);

      // todo：示例
      yield debug.screenShot(`${selector}@${selectorType}[click]`);
      yield el.click();
    }else{
      yield *scrollToView(el);
      log.info('sptt:',`"${op.atomName}",begin click element[${selector}](${selectorType})`);
      yield el.click();
    }

    // 默认为native上下文
    yield checkToNative(selectorType);
  }catch(e){
    log.error('sptt:',`"${op.atomName}",click [${selector}](${selectorType}) occur an error, ${e.stack}`);
    yield debug.screenShot(`${selector}@${selectorType}[click]`);
    process.exit(1);
  }
};

// 点击坐标对应的元素
var clickWithCoordinate = function* (op){
  var data = op.data,
    selectorType = op.selectorType,
    action;

  if(!(data.x || data.X) || !(data.y || data.Y)){
    log.warn('sptt:',`"${op.atomName}",you must supply (x,y) information to click`);
    return;
  }

  try{
    log.info('sptt:',`"${op.atomName}",begin click the coordinate(${data.x ? data.x : data.X},${data.y ? data.y : data.Y})`);
    action = new yiewd.TouchAction(driver);
    action
      .tap({ x: parseInt(data.x ? data.x : data.X), y: parseInt(data.y ? data.y : data.Y)});
    yield driver.performTouchAction(action);

    // 默认为native上下文
    yield checkToNative(selectorType);
  }catch(e){
    log.error('sptt:',`"${op.atomName}",click the coordinate (${data.x ? data.x : data.X},${data.y ? data.y : data.Y}) occur an error, ${e.stack}`);
    process.exit(1);
  }
};

// ios下可以使用"getValue"API，而在android下获取文本则需使用getAttribute
var getValue = function* (op){
  var el = op.el,
    selector = op.selector,
    selectorType = op.selectorType,
    value;
  if(!el){
    log.warn('sptt:',`"${op.atomName}",current element[${selector}](${selectorType}) is null, so can not get its value`);
    return;
  }

  try {
    log.info('sptt:',`"${op.atomName}",begin get element[${selector}](${selectorType})'s value`);
    // 首先获取value属性
    try{
      value = yield el.getValue();
      return value;
    }catch(e){
      value = yield el.getAttribute('text');
      if(!value){
        value = yield el.getAttribute('name');
      }
    }

    if(value == undefined){
      throw new FetchError('can not get the value of elements');
    }
  }catch(e){
    log.error('sptt:',`"${op.atomName}",get [${selector}](${selectorType})'s value occur an error, ${e.stack}`);
    yield debug.screenShot(`${selector}@${selectorType}[getValue]`);
    process.exit(1);
  }

  return value;
};

// 针对输入操作，根据输入数据是否满足JS表达式来完成输入数据的处理
// 如 `('' + Date.now()).slice(0,10)`，则返回时间戳的前10位
var type = function* (op){
  var el = op.el,
    data = op.data,
    selector = op.selector,
    selectorType = op.selectorType;

  if(!el){
    log.warn('sptt:',`"${op.atomName}",current element[${selector}](${selectorType}) is null, so type action is not done`);
    return;
  }

  try{
    if(yield el.isDisplayed()){
      log.info('sptt:',`"${op.atomName}",begin type element[${selector}](${selectorType})`);
      yield el.type(data);
    }else{
      yield *scrollToView(el);
      log.info('sptt:',`"${op.atomName}",begin type element[${selector}](${selectorType})`);
      yield el.type(data);
    }

    // 默认为native上下文
    yield checkToNative(selectorType);
  }catch(e){
    log.error('sptt:',`"${op.atomName}",type [${selector}](${selectorType}) occur an error when input "${data}", ${e.stack}`);
    yield debug.screenShot(`${selector}@${selectorType}[type]`);
    process.exit(1);
  }
};

var doubleClick = function* (op){
  var el = op.el,
    selector = op.selector,
    selectorType = op.selectorType;

  if(!el){
    log.warn('sptt:',`"${op.atomName}",current element[${selector}](${selectorType}) is null, so doubleClick action is not done`);
    return;
  }

  try {
    if(yield el.isDisplayed()){
      log.info('sptt:',`"${op.atomName}",begin doubleClick element[${selector}](${selectorType})`);
      yield el.doubleClick();
    }else{
      yield *scrollToView(el);
      log.info('sptt:',`"${op.atomName}",begin doubleClick element[${selector}](${selectorType})`);
      yield el.doubleClick();
    }

    // 默认为native上下文
    yield checkToNative(selectorType);
  }catch(e){
    log.error('sptt:',`"${op.atomName}",doubleClick [${selector}](${selectorType}) occur an error, ${e.stack}`);
    yield debug.screenShot(`${selector}@${selectorType}[doubleClick]`);
    process.exit(1);
  }
};

var swipe = function* (op){
  var startX = op.startX,
    startY = op.startY,
    offsetX = op.offsetX,
    offsetY = op.offsetY,
    duration = op.duration;
  try{
    log.info('sptt:',`"${op.atomName}",begin swipe page from [${startX},${startY}] to [${offsetX},${offsetY}] during ${duration}`);
    yield driver.swipe({
      startX: startX,
      startY: startY,
      endX: offsetX,
      endY: offsetY,
      duration: duration
    });
  }catch(e){
    log.error('sptt:',`"${op.atomName}",swipe action occur an error: ` + e.stack);
    process.exit(1);
  }
};

// 采用相对于widow的坐标进行滑动，这只是一种实现方式，目前并不使用
var swipeWithRatio = function* (op){
  var {sxRatio,syRatio,exRatio,eyRatio,duration} = op;
  var {width,height} = yield getWindowSize();
  var startX = Math.floor(width * sxRatio),
    startY = Math.floor(height * syRatio);
  duration = duration || 800;
  try{
    log.info('sptt:',`"${op.atomName}",begin swipe page from [${startX},${startY}] to [${width * exRatio},${height * eyRatio}] during ${duration}`);

    // todo: ios和android滑动的终点坐标不同
    if(OSType.toLowerCase() == 'ios'){
      yield driver.swipe({
        startX: startX,
        startY: startY,
        endX: Math.floor(width * exRatio) - startX,
        endY: Math.floor(height * eyRatio) - startY,
        duration: duration
      });
    }else if(OSType.toLowerCase() == 'android'){
      yield driver.swipe({
        startX: startX,
        startY: startY,
        endX: Math.floor(width * exRatio),
        endY: Math.floor(height * eyRatio),
        duration: duration
      });
    }

  }catch(e){
    log.error('sptt:',`"${op.atomName}",swipe action occur an error: ` + e.stack);
    process.exit(1);
  }
};

var selectAnCaptcha = function* (op){
  var {el,selectorType,selector,data,atomName} = op;
  var key = `shop:captcha:${data.tel}`,reply;
  // 获取验证码
  try{
    log.info('sptt:',`"${atomName}"`);
    reply = JSON.parse(yield redisUtil.getRedis(key));
  }catch(e){
    log.info('sptt:',`"${atomName}",get captcha occur an error!`);
    process.exit(1);
  }
  yield el.type(reply.code);
};

var checkToWebview = function* (notTryAgain){
  var contexts;
  try{
    contexts = yield driver.contexts();
    // 设置数组末尾项为当前webview的上下文
    yield driver.context(contexts[contexts.length - 1]);
    yield driver.sleep(10);
    log.info('sptt:','check to webview successfully');
  }catch(e){
    log.error('sptt:','check to webview occur error');
    yield debug.screenShot(`page[checkToWebview]`);
    if(!notTryAgain){
      yield checkToWebview('donotTryAgain');
    }
  }
};

var checkToNative = function* (type){
  if(type == 'css'){
    var contexts = yield driver.contexts();
    yield driver.context(contexts[0]);
    yield driver.sleep(10);
    log.info('sptt:','check to native successfully');
  }
};

var hideKeybord = function* (){

  try{
    // iOS下达人店的键盘添加了第三方模块，点击“完成”按钮即可隐藏
    if(yield driver.hasElementByName('完成')){
      log.info('sptt:','begin hide keybord');
      yield driver.elementByName('完成').click();
    }else{
      // 针对android，点击空白区实现
      log.info('sptt:','begin hide keybord');
      yield driver.hideKeyboard({strategy: 'tapOutside'});
    }
  }catch(e){
    log.error('sptt:','hideKeybord occur an error, ' + e.stack);
    yield debug.screenShot(`page[hideKeybord]`);
    process.exit(1);
  }

};

// 删除应用，默认删除包名为com.showjoy.shop的应用
var removeApp = function* (appPackage){
  appPackage = appPackage ? appPackage : 'com.showjoy.shop';
  log.info('sptt:',`remove the app: ${appPackage}`);
  yield driver.removeAppFromDevice(appPackage);
};

// 安装应用
var installApp = function* (url){
  if(!url){
    log.error('sptt:','you must give the url of the app package');
    process.exit(1);
  }

  log.info('sptt:',`install the app which url is ${url}}`);
  yield driver.installAppOnDevice(url);
};

exports.checkToWebview = checkToWebview;
exports.checkToNative = checkToNative;

exports.do = function* (op){
  var el = op.el,
    action = op.action,
    data = op.data,
    jsExpReg = /<%(.+?)%>/i,jsExp;

  if(typeof data == 'string'){
    jsExp = data.match(jsExpReg);
    if(jsExp)
      data = eval(_.trim(jsExp[1]));
  }

  try{
    switch(action){
      case 'click':
        yield *click({
          atomName: op.atomName,
          el: el,
          selectorType: op.selectorType,
          selector: op.selector
        });
        break;
      case 'clickWithCoordinate':
        try{
          data = typeof data == 'string' ? JSON.parse(data) : data;
        }catch(e){
          log.error('sptt:','parse the position occur error');
          process.exit(1);
        }
        yield *clickWithCoordinate({
          atomName: op.atomName,
          selectorType: op.selectorType,
          data: data
        });
        break;
      case 'getValue':
        return yield *getValue({
          atomName: op.atomName,
          el: el,
          selectorType: op.selectorType,
          selector: op.selector
        });
        break;
      case 'type':
        yield *type({
          atomName: op.atomName,
          el: el,
          data: data,
          selectorType: op.selectorType,
          selector: op.selector
        });
        break;
      case 'doubleclick':
        yield *doubleClick({
          atomName: op.atomName,
          el: el,
          selectorType: op.selectorType,
          selector: op.selector
        });
        break;
      /*
      @deprecated
      case 'swipe':
        yield *swipe({
          startX: data.startX,
          startY: data.startY,
          offsetX: data.offsetX,
          offsetY: data.offsetY,
          duration: data.duration
        });
        break;*/
      case 'swipe':
        try{
          data = typeof data == 'string' ? JSON.parse(data) : data;
        }catch(e){
          log.error('sptt:','parse the relative position occur error');
          process.exit(1);
        }

        yield *swipeWithRatio({
          atomName: op.atomName,
          sxRatio: data.sxRatio,
          syRatio: data.syRatio,
          exRatio: data.exRatio,
          eyRatio: data.eyRatio,
          duration: data.duration
        });
        break;
      case 'hideKeybord':
        yield *hideKeybord();
        break;
      // 获取验证码,需配合手机号
      case 'captcha':
        try{
          data = typeof data == 'string' ? JSON.parse(data) : data;
        }catch(e){
          log.error('sptt:','parse data occur error');
          process.exit(1);
        }
        yield selectAnCaptcha({
          atomName: op.atomName,
          el,
          data,
          selectorType: op.selectorType,
          selector: op.selector
        });
        break;
      case 'removeApp':
        yield *removeApp(data);
        break;
      case 'installApp':
        yield *installApp(data);
        break;
    }
  }catch(e){
    log.error('sptt:','doing "' + type + '" occur an error, ' + e.stack);
    process.exit(1);
  }

};