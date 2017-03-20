'use strict';

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

var scroll = exports.scroll = function* (el,direction){
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

var scrollToView = exports.scrollToView = function* (el){
  if(yield el.isDisplayed()){
    return;
  }

  log.info('sptt:','begin scrollToView[↓]');
  yield *scroll(el,'down');
  // wd模块无法判断 查找元素的绝对位置，因此无法自动定位至可视窗口，只能采用先向下查找后向上查找的办法定位
  if(yield el.isDisplayed())
    return;
  log.info('sptt:','begin scrollToView[↑]');
  yield *scroll(el,'up');
  if(!(yield el.isDisplayed())){
    log.error('sptt:','cannot scroll to view');
  }
};

var click = function* (op){
  var el = op.el,
    selector = op.selector,
    selectorType = op.selectorType;
  if(!el){
    log.warn('sptt:',`current element[${selector}](${selectorType}) is null, so click is not done`);
    return;
  }

  try {
    if(yield el.isDisplayed()){
      log.info('sptt:',`begin click element[${selector}](${selectorType})`);

      // todo：示例
      yield debug.screenShot(`${selector}@${selectorType}[click]`);
      yield el.click();
    }else{
      yield *scrollToView(el);
      log.info('sptt:',`begin click element[${selector}](${selectorType})`);
      yield el.click();
    }
  }catch(e){
    log.error('sptt:',`click [${selector}](${selectorType}) occur an error, ${e.stack}`);
    yield debug.screenShot(`${selector}@${selectorType}[click]`);
    process.exit(1);
  }
};

var getValue = function* (op){
  var el = op.el,
    selector = op.selector,
    selectorType = op.selectorType,
    value;
  if(!el){
    log.warn('sptt:',`current element[${selector}](${selectorType}) is null, so can not get its value`);
    return;
  }

  try {
    if(yield el.isDisplayed()){
      log.info('sptt:',`begin get element[${selector}](${selectorType})'s value`);
      value = yield el.getValue();
    }else{
      yield *scrollToView(el);
      log.info('sptt:',`begin get element[${selector}](${selectorType})'s value`);
      value = yield el.getValue();
    }
  }catch(e){
    log.error('sptt:',`get [${selector}](${selectorType})'s value occur an error, ${e.stack}`);
    yield debug.screenShot(`${selector}@${selectorType}[getValue]`);
    process.exit(1);
  }

  return value;
};

var type = function* (op){
  var el = op.el,
    data = op.data,
    selector = op.selector,
    selectorType = op.selectorType;

  if(!el){
    log.warn('sptt:',`current element[${selector}](${selectorType}) is null, so type action is not done`);
    return;
  }

  if(!el)
    return;
  try{
    if(yield el.isDisplayed()){
      log.info('sptt:',`begin type element[${selector}](${selectorType})`);
      yield el.type(data);
    }else{
      yield *scrollToView(el);
      log.info('sptt:',`begin type element[${selector}](${selectorType})`);
      yield el.type(data);
    }
  }catch(e){
    log.error('sptt:',`type [${selector}](${selectorType}) occur an error when input "${data}", ${e.stack}`);
    yield debug.screenShot(`${selector}@${selectorType}[type]`);
    process.exit(1);
  }
};

var doubleClick = function* (op){
  var el = op.el,
    selector = op.selector,
    selectorType = op.selectorType;

  if(!el){
    log.warn('sptt:',`current element[${selector}](${selectorType}) is null, so doubleClick action is not done`);
    return;
  }

  try {
    if(yield el.isDisplayed()){
      log.info('sptt:',`begin doubleClick element[${selector}](${selectorType})`);
      yield el.doubleClick();
    }else{
      yield *scrollToView(el);
      log.info('sptt:',`begin doubleClick element[${selector}](${selectorType})`);
      yield el.doubleClick();
    }
  }catch(e){
    log.error('sptt:',`doubleClick [${selector}](${selectorType}) occur an error, ${e.stack}`);
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
    log.info('sptt:',`begin swipe page from [${startX},${startY}] to [${offsetX},${offsetY}] during ${duration}`);
    yield driver.swipe({
      startX: startX,
      startY: startY,
      endX: offsetX,
      endY: offsetY,
      duration: duration
    });
  }catch(e){
    log.error('sptt:','swipe action occur an error: ' + e.stack);
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
    log.info('sptt:',`begin swipe page from [${startX},${startY}] to [${width * exRatio},${height * eyRatio}] during ${duration}`);
    yield driver.swipe({
      startX: startX,
      startY: startY,
      endX: Math.floor(width * exRatio) - startX,
      endY: Math.floor(height * eyRatio) - startY,
      duration: duration
    });
  }catch(e){
    log.error('sptt:','swipe action occur an error: ' + e.stack);
    process.exit(1);
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

exports.do = function* (op){
  var el = op.el,
    action = op.action,
    data = op.data;
  try{
    switch(action){
      case 'click':
        yield *click({
          el: el,
          selectorType: op.selectorType,
          selector: op.selector
        });
        break;
      case 'getValue':
        return yield *getValue({
          el: el,
          selectorType: op.selectorType,
          selector: op.selector
        });
        break;
      case 'type':
        yield *type({
          el: el,
          data: data,
          selectorType: op.selectorType,
          selector: op.selector
        });
        break;
      case 'doubleclick':
        yield *doubleClick({
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
    }
  }catch(e){
    log.error('sptt:','doing "' + type + '" occur an error, ' + e.stack);
    process.exit(1);
  }

};