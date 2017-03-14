'use strict';

var path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  yml = require('js-yaml');

/**
 *
 * atoms:
 *
 * { ForumSteps:
   { 'enter Forum page':
      { control_id: 'btnMenuForum',
        control_action: 'click',
        expectation: '社区' } } }

 * steps:
 *
 * { AccountFeatures:
   { 'login with valid test account':
      [ 'AccountSteps | enter My Account page',
        'AccountSteps | enter Login page',
        'AccountSteps | input test EmailAddress',
        'AccountSteps | input test Password',
        'AccountSteps | login',
        'AccountSteps | close coupon popup window(optional)' ],
     'login with valid production account':
      [ 'AccountSteps | enter My Account page',
        'AccountSteps | enter Login page',
        'AccountSteps | input production EmailAddress',
        'AccountSteps | input production Password',
        'AccountSteps | login',
        'AccountSteps | close coupon popup window(optional)' ],
     logout:
      [ 'AccountSteps | enter My Account page',
        'SettingsSteps | enter Settings page',
        'AccountSteps | logout' ],
     'Change Shipping Address to China':
      [ 'AccountSteps | enter My Account page',
        'SettingsSteps | enter ShoppingInfo page',
        'SettingsSteps | enter ShippingAddress page',
        'SettingsSteps | switch Shipping Address to China',
        'SettingsSteps | confirm Shipping Address selection',
        'SettingsSteps | back to last page' ] } }

   testcases:

 { 'Login and Logout':
   [ 'SettingsFeatures | initialize first startup',
     'AccountFeatures | login with valid production account',
     'AccountFeatures | logout' ] }
 * @type {{}}
 */

var ymlData = {
  atoms: {},
  steps: {},
  testcases: {}
};

var getUISelector = function(st){
  if(st.ui_id)
    return 'id';
  if(st.ui_accessibilityId)
    return 'accessibilityId';
  if(st.ui_name)
    return 'name';
  if(st.ui_xpath)
    return 'xpath';
  if(st.ui_className)
    return 'className';

  // 如果不显式制定selectorType，则默认针对当前视图page操作，如滑动swipe
  return 'page';
};

var getExpectationSelector = function(st){
  if(st.expectation_id)
    return 'id';
  if(st.expectation_accessibilityId)
    return 'accessibilityId';
  if(st.expectation_name)
    return 'name';
  if(st.expectation_xpath)
    return 'xpath';
  if(st.expectation_className)
    return 'className';

  return 'page';
};
var verifyAction = function(action){
  var list = {
    click: 1,
    doubleClick: 1,
    swipe: 1,
    type: 1,
    scroll: 1,
    hideKeybord: 1
  };
  return list[action];
};

const EXPECTATION_TYPE = {
  none: 1,
  exist: 1,
};

var execute = {
  loadTestCases: function(done,setting){
    var {buildPath,type,output} = setting,
      pwd = process.cwd(),
      stamp = Date.now(),
      self = this;

    type = type.toLowerCase();
    // 首先解析iOS测试用例文件
    var curpath = path.join(pwd,`${type}/atoms`);
    fs.readdirSync(curpath,'utf8').forEach(function(name){
      ymlData.atoms= _.assign(ymlData.atoms,yml.safeLoad(fs.readFileSync(path.join(curpath,name),'utf8')));
    });

    curpath = path.join(pwd,'ios/steps');
    fs.readdirSync(curpath,'utf8').forEach(function(name){
      ymlData.steps = _.assign(ymlData.steps,yml.safeLoad(fs.readFileSync(path.join(curpath,name),'utf8')));
    });

    curpath = path.join(pwd,'ios/testcases');
    fs.readdirSync(curpath,'utf8').forEach(function(name){
      ymlData.testcases = _.assign(ymlData.testcases,yml.safeLoad(fs.readFileSync(path.join(curpath,name),'utf8')));
    });

    _.forEach(ymlData.testcases,function(v,k){
      if(!v)
        return;
      var fileName = stamp + '_' + k;
      try{
        fs.writeFileSync(`${buildPath}/${fileName}.js`,self.runSeriesCases(k),'utf8');
      }catch(e){
        log.error('sptt:','can not write to file when execute runSeriesCases()');
        console.log(e)
        process.exit(1);
      }
    });

    // 开始执行promise的then链
    // 等待appium服务开启
    setTimeout(function(){
      done();
    },4000);

  },
  runSeriesCases: function(k){
    var self = this,
      config = ymlData.testcases[k].config,
      ts = Object.keys(ymlData.testcases[k]),
      defaultTimeout = 100000,caseTimeout;
    if(ts[0] !== 'config'){
      log.error('sptt:','the first item must be "config"');
      process.exit(1);
    }
    if(!config.caps){
      log.error('sptt:','you must apply the caps in testcase.yml');
      process.exit(1);
    }

    // 移除队列首位的’config‘元素
    ts.shift();

     caseTimeout = config.timeout || defaultTimeout;
     var code = `var path = require('path');
     var expect = chai.expect;
     describe('${k}',function(){
      this.timeout( ${caseTimeout} );`;

     // 初始化appium配置，如platformName、deviceName等
     code += `
       before(function(done){
        driver.run(function*(){
          yield driver.init(require(path.join(process.cwd(),'${config.caps}')));
          done();
        });
     });`;

    ts.forEach(function(ca){
      if(!ca) return;
      code +=self.execTestcase(k,ca);
    });

    code += `
    });`;
    return code;
  },
  execTestcase: function(k,testcaseDesc){
    var self = this,
      testcase = ymlData.testcases[k][testcaseDesc];
    // 测试用例代码
    var code = `
      it("${testcaseDesc}",function(done){
        driver.run(function*(){
        `;

    // 设置测试用例
    testcase.forEach(function(func){
      var action = func.split('|'),
        funFlag = _.trim(action[0]),
        funName = _.trim(action[1]);

      code += self.execSteps(funFlag,funName);
    });

    code += `
        done();
      });
    });`;
    return code;

  },
  execSteps: function(k,actionName){
    var self = this,code = '';
    var steps = ymlData['steps'][k][actionName];

    steps.forEach(function(st){
      let step,stepFlag,stepName,isOptional = false;
      if(typeof st == 'string'){
        step = st.split('|');
        stepFlag = _.trim(step[0]);
        stepName = _.trim(step[1]);
        if(stepName.indexOf('(optional)') != -1){
          stepName = _.trim(stepName.replace(/\(optional\)/gi,''));
          isOptional = true;
        }
        code += self.execAtom(stepFlag,stepName,isOptional);
      }else if(typeof st == 'object'){
        _.forEach(st,function(v,k){
          // 创建闭包
          code += `yield *(function*(){`;

          // 参数计算
          if('params' in v){
            if(v.hasOwnProperty('params')){

              // 遍历params属性，计算参数并替换对应值
              _.forEach(v['params'],function(v,k){
                try{
                  let step = v.split('|'),
                    stepFlag = _.trim(step[0]),
                    stepName = _.trim(step[1]);
                  code += `
                var ${k} = ` + self.execAtom(stepFlag,stepName,false);
                }catch(e){
                  code += `
                var ${k} = '${v}';`;
                }

              });
            }
          }

          // 参数计算完毕，开始主流程
          var step = k.split('|'),
            stepFlag = _.trim(step[0]),
            stepName = _.trim(step[1]);
          code += self.execAtom(stepFlag,stepName,false);
          code += `
          })();`;
        });
      }
    });
    return code;
  },
  /**
   *
   * @param k
   * @param atomName
   * @param isOptional 若为true，则不进行断言
   * @returns {string}
   */
  execAtom: function(k,atomName,isOptional){
    var atom = ymlData['atoms'][k][atomName];
    var code = '',
      selectType = getUISelector(atom),
      expectationSelectType = getExpectationSelector(atom),
      selector = atom['ui_' + selectType],
      action = atom.ui_action,
      data = atom.data || '',
      sleep = atom.sleep,
      expectation_mark = atom['expectation_' + expectationSelectType],
      expectation_type = atom.expectation_type;

    switch(selectType){
      case 'id':
        code += `
        yield * (function*(){
          var el = yield $.findElementById('${selector}');
          yield view.do({
            el: el,
            selectorType: 'id',
            selector: '${selector}',
            action: '${action}',
            data: '${data}'
          });
        })();
        `;
        break;

      case 'accessibilityId':
        code += `
        yield * (function*(){
          var el = yield $.findElementByAccessibilityId('${selector}');
          yield view.do({
            el: el,
            selectorType: 'accessibilityId',
            selector: '${selector}',
            action: '${action}',
            data: '${data}'
          });
        })();
        `;
        break;

      case 'name':
        code += `
        yield * (function*(){
          var el = yield $.findElementByName('${selector}');
          yield view.do({
            el: el,
            selectorType: 'name',
            selector: '${selector}',
            action: '${action}',
            data: '${data}'
          });
        })();
        `;
        break;

      case 'xpath':
        code += `
         yield * (function*(){
          var el = yield $.findElementByXPath('${selector}');
          return yield view.do({
            el: el,
            selectorType: 'xpath',
            selector: '${selector}',
            action: '${action}',
            data: '${data}'
          });
        })();
        `;
        break;

      case 'className':
        // 当selector为className时，需要提供className的索引值
        // format: ui_className: Button|1
        let cls = selector.split('|'),
          cn = _.trim(cls[0]),
          index = _.trim(cls[1]);
        code += `
        yield * (function*(){
          var el = yield $.findElementByClassName('${cn}',${index});
          yield view.do({
            el: el,
            selectorType: 'className',
            selector: '${cn}|${index}',
            action: '${action}',
            data: '${data}'
          });
        })();
        `;
        break;

       default:
         if(action != 'net'){
           // 当selector未指定时，默认针对当前视口
           code += `
         yield * (function*(){
         yield view.do({
         selectorType: 'page',
         action: '${action}',
         data: '${data}'
         });
         })();
         `;
         }else{
           // 支付操作无需制定UI元素
           let paramReg = /\${(\w+?)}/g;
           var getVariablesFromData = function(data){

             if(typeof data == 'string'){
               data = data.replace(paramReg,function(all,name){
                 return name;
               });
               return data;
             }else if(typeof data == 'object'){
               var datastr = '{';
               _.forEach(data,function(v,k){

                 if(typeof v == 'object'){
                   datastr += getVariablesFromData(v);
                   return;
                 }

                 if(v.match(paramReg)){
                   v.replace(paramReg,function(all,name){
                     if(name){
                       datastr += `'${k}': ${name},`;
                     }
                   });
                 }else{
                   datastr += `'${k}': '${v}',`;
                 }

               });

               datastr += '}';
               return datastr;
             }
           };

           code += `var promise = (function(){
         var request = require('request');
         return new Promise(function(resolve,reject){
          request.get({
             url: '${getVariablesFromData(data.url)}',
             qs: ${getVariablesFromData(data.qs)},
             headers: ${getVariablesFromData(data.headers)}
          },function(error,res,body){
             if (!error && res.statusCode == 200) {
               var info = JSON.parse(body);
               expect(info.isSuccess).to.equal(1);
               resolve();
             }else{
              reject();
             }
           });
          });
         })();
         yield promise;`;
         }

       break;
    }

    // 延时操作
    if(sleep && _.isNumber(+sleep)){
      code += `
      log.info('sptt:','sleeping ${sleep}ms');
      yield driver.sleep(${sleep});
      `;
    }

    if(expectation_mark && expectation_type && !isOptional){
      let assertion = `
            switch('${expectation_type}'){
              case 'none':
                expect(el).to.not.exist;
                break;
              case 'exist':
                expect(el).to.exist;
                break;
            }`;
      switch(expectationSelectType){
        case 'id':
          code += `yield* (function* checkExp(){
            var el = yield *$.findElementById('${expectation_mark}');` +
            assertion +
           `})();`;
          break;
        case 'name':
          code += `yield* (function* checkExp(){
            var el = yield *$.findElementByName('${expectation_mark}');` +
            assertion +
            `})();`;
          break;
        case 'xpath':
          code += `yield* (function* checkExp(){
            var el = yield *$.findElementByXPath('${expectation_mark}');` +
            assertion +
            `})();`;
          break;
        case 'className':
          // 当selector为className时，需要提供className的索引值
          // format: ui_className: Button|1
          let cls = expectation_mark.split('|'),
            cn = _.trim(cls[0]),
            index = _.trim(cls[1]);
          code += `yield* (function* checkExp(){
            var el = yield *$.findElementByClassName('${cn}',${index});` +
            assertion +
            `})();`;
          break;
      }
    }

    return code;
  }
};

module.exports = execute;