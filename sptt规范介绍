## 相关资源
**[如何开发sptt工程的原子操作](http://docs.showjoy.net/2017/03/22/ru-he-kai-fa-spttgong-cheng-de-yuan-zi-cao-zuo/)**

**[移动端测试方案--sptt](http://docs.showjoy.net/2017/03/14/yi-dong-duan-ce-shi-kuang-jia-sptt/)**
## sptt规范
一个标准的sptt工程的目录如下：
```
[sptt-project]
  | -- [ios]
  |      | -- [atoms]
  |      |      | -- login.yml
  |      |      | -- action.yml
  |      | -- [steps]
  |      |      | -- login.yml
  |      |      | -- buy.yml
  |      | -- [testcases]
  |      |      | -- firstcase.yml
  |      | -- caps.json
  | -- [android]
  |      | -- [atoms]
  |      |      | -- login.yml
  |      |      | -- action.yml
  |      | -- [steps]
  |      |      | -- login.yml
  |      |      | -- buy.yml
  |      | -- [testcases]
  |      |      | -- firstcase.yml
  |      | -- caps.json
```
sptt规定，测试用例的最小粒度为**atom**，即定义在atoms文件夹中的操作。多个atom操作按顺序可确定一个step，多个step操作组成一个测试用例。

### atom操作
sptt将测试领域的测试用例分解为最基本的原子操作，即atom。按照人机交互过程，每个atom操作包含以下元素:

- UI元素定位
- UI元素操作
- UI元素操作所需数据
- 断言
- 额外action

下面，将会详细这些元素

##### 元素定位
sptt提供了几种元素定位方式：

- id定位
通过在yml文件中配置**ui_id**属性实现定位:
```
  start notification alert:
    ui_id: Allow
    ui_action: click
```
如上例中的名为“start notification alert”的atom操作，采用了id定位方式。

- name定位
在yml中配置**ui_name**属性实现：
```
login:
    ui_name: 登录
    ui_action: click
```
上例中“login”的atom采用name定位方式选择登录按钮。

- className定位
在yml中配置**ui_className**属性实现，由于className的特殊性，一个className往往对应多个元素，因此在使用className定位元素时，需要配合**管道符**设定具体的元素索引值，索引值的范围为 [0, length-1]
```
  enter an hot sale's information:
    ui_className: Button|1
    ui_action: click
```
上例中名为“enter an hot sale's information”的atom操作中，选择className为**Button**的元素数组，并返回数组中的第二项Button元素。

*className定位*方式，必须使用管道符号**|**来通过索引定位具体的元素，否则会出现异常。

- xpath定位
通常使用xpath定位xml文档元素，在appium中可能无法采用上述提供的几种定位方式，但是xpath却肯定可以，因为appium将试图解析为一颗xml对象树，只要提供正确合理的xpath，理应总能找到对应元素。不过，由于遍历xml树的复杂度相对较高，appium服务端采用xpath方式定位效率很低，因此不在极端情况下尽量不要使用xpath定位方式。
```
  get orderId:
    ui_xpath: //XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTable[1]/XCUIElementTypeCell[4]/XCUIElementTypeStaticText[5]
    ui_action: getValue
```
上例采用了相对的xpath方式定位label元素，获取订单号。经测试性能很差。

- accessibilityId定位
accessibilityId是iOS开发中对象的一个属性，它给元素提供了一个可唯一标示的标识符，利用accessibilityId属性可以实现类似id定位的功能，在iOS开发中非常好用。
```
 return homepage:
    ui_accessibilityId: 回到首页
    ui_action: click
```

- css定位
css定位针对的是html5页面元素，在app中肯定有许多嵌入的html5页面，针对这些页面中的元素必须通过css进行定位，其中选择器的类型与js中“document.querySelector(selector)”相同。
```
  选择开店礼包:
    ui_css: .j_GiftItem:nth-child(2)
    ui_action: click
    sleep: 1000
  输入短信码:
    ui_css: .field>.checkcode>.checkcode-left>input
    ui_action: captcha
    data:
      tel: 15168253213
    sleep: 2000
```
##### 元素操作
sptt提供了7种元素操作，分别为

- click 点击
- clickWithCoordinate 点击坐标所在元素
- getValue 获取文本值
- type 输入
- doubleClick 双击
- swipe 滑动
- hideKeybord 隐藏键盘
- captcha 获取手机验证码操作
- removeApp 删除app
- installApp 安装app

对应在atom文件中配置**ui_action**属性。

不过，**clickWithCoordinate、type和swipe**操作需要提供所需数据。

####### 点击坐标
```
 enter order management:
    ui_action: clickWithCoordinate
    data:
      x: 20
      y: 300
```
clickWithCoordinate需要提供点击坐标的位置，可以不提供选择器（点击的坐标是绝对坐标，因此无需提供对应操作的元素）；**坐标信息可以通过[app-inspector](http://docs.showjoy.net/2017/03/22/ru-he-kai-fa-spttgong-cheng-de-yuan-zi-cao-zuo/)的bounds属性获得--bounds:10,30,72,29  意味坐标位置为（10，30），同时该元素的长度为72px，宽度为29px**

####### 输入框输入数据
```
input username:
    ui_xpath: //XCUIElementTypeOther/XCUIElementTypeTextField[1]
    ui_action: type
    data: showjohstp
```
type的数据为需要向输入框输入的源数据，“input username”atom操作向对应xpath的元素输入内容“showjohstp”；

####### 滑动
swipe则需提供滑动的相对视口（可理解为屏幕的长度和宽度）百分数和滑动时长。
```
  swipe down:
    ui_action: swipe
    data:
      sxRatio: 0.5
      syRatio: 0.8
      exRatio: 0.5
      eyRatio: 0.1
      duration: 400
```
“swipe down”操作则在0.4s内从起点坐标（0.5 * width，0.8 * height）滑动到（0.5 * width，0.1 * width）处，即向下滑动。sxRatio和exRatio指定相对视口宽度的相对值；syRatio和eyRatio指定相对视口高度的相对值。

####### 验证码操作
在做自动化时会遇到手机验证短信的情况，在sptt中采用一种hack方式：查询对应redis服务器获取验证码，因此性能比实际的短信获取更好，且安全性更高。

获取验证码操作需要提供手机号码（data中的tel数据）和需要填写的输入框（ui_css）：
```
 input captcha:
    ui_css: .field>.checkcode>.checkcode-left>input
    ui_action: captcha
    data:
      tel: 15168253213
    sleep: 2000
```

####### 删除app
如果需要删除某个app，需要使用该操作：
```
  remove app:
    ui_action: removeApp
    data: com.showjoy.shop
```
其中，data提供该app的包名，如达人店的“com.showjoy.shop”

####### 安装app
同理，安装app需要提供url：
```
install app:
    ui_action: installApp
    data: https://wireless-build.showjoy.net/job/ShopAndroid-develop/283/artifact/outputs/apk/shopandroid-2.0.1.1-forTest-20170413104803.apk
```

##### 数据
有些“ui_action”需要提供数据，如“type”操作。在上节中的某些实例中也有呈现，data可以是字符串，也可以设置为对象的形式，如:
```
enter order management:
    ui_action: clickWithCoordinate
    data:
      x: 20
      y: 300

```
上例中的data其实就是类似**{x: 20,y: 300}**的对象。

####### 动态生成数据
sptt提供了data的编程能力，可以在data中执行JavaScript表达式，执行结果作为data的值。其中，表达式需要放在**<% %>**占位符内部，如下例：
```
输入店铺名称:
    ui_xpath: //android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.RelativeLayout[1]/android.widget.LinearLayout[1]/android.widget.LinearLayout[2]/android.widget.RelativeLayout[3]/android.widget.RelativeLayout[1]/android.widget.LinearLayout[1]/android.widget.EditText[1]
    ui_action: type
    # <%%>内部执行JavaScript表达式
    data: <%String(Date.now()).slice(0,10)%>
```
此处填写店铺名称，由于店铺名称的唯一性（不可重复），因此在此处生成一个10位的时间戳作为店铺名称。

##### 断言和断言类型
测试离不开断言，UI自动化测试的断言比较简单，目前sptt仅仅是根据当前视图中是否存在另一个元素来判断atom操作是否成功。因为多数UI操作都会直接影响视图，所以这种断言方式可满足大多数操作。而针对不会影响视图的UI操作，sptt并未做断言处理，理论上来说也不需做处理，必应从产品角度上说每一次UI操作都会在视图层提醒用户状态的切换。

sptt规范目前提供了几种与断言相关的元素定位方式：
```
expectation_id
expectation_name
expectation_className
expectation_xpath
expectation_css（html5中的元素）
```
同时提供多种断言方式“expectation_type”：
```
expectation_type: none
expectation_type: exist
expectation_type: contain
```
针对**expectation_type: contain**方式，用来判断UI元素的内容是否包含给定为本，因此需要**expectation_data**属性进行搭配：
```
expectation_data: 家族纳新奖励收益
```
如下面的例子
```
  进入收益明细页面:
    ui_xpath: //android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.RelativeLayout[1]/android.widget.ScrollView[1]/android.widget.RelativeLayout[1]/android.widget.RelativeLayout[1]/android.widget.LinearLayout[1]
    ui_action: click
    sleep: 10000
    expectation_css: .income-detail-item:nth-child(1) .comm-info #获取文本"家族纳新收益。。。"
    expectation_type: contain
    expectation_data: 家族纳新奖励收益
```
点击xpath对应的元素，等待10s后，判断html5页面中选择器为“.income-detail-item:nth-child(1) .comm-info”的DOM元素的文本值是否包含给定的文本--“家族纳新奖励收益”，不包含则断言失败。

这里的“contain”是指包括，是给定文本的父集。

```
find info of good 1:
  ui_name: 商品详情
  ui_action: click
  sleep: 100
  expectation_id: 回到主页
  expectation_type: exist
```
在“find info of good 1”atom，点击“商品详情”按钮，等待100ms后，如果当前视图中**存在**id为**“回到主页”**的元素，那么我们就认为断言成功，即当前atom操作执行成功。

```
find info of good 2:
  ui_name: 商品详情
  ui_action: click
  sleep: 100
  expectation_name: 回到主页
  expectation_type: none
```
相反的，如果点击“商品详情”按钮，等待100ms后，视图中**不存在**name为“回到主页”的元素，则认为断言成功。

##### 额外操作
- sleep 
由于UI自动化测试是将人为性的操作转接为模拟器自行测试，无法做到像人那般灵活，因此为了尽量减少应用中视图切换延时造成的问题，sptt给atom操作添加了**sleep**操作。测试人员可以设定atom操作后sleep的时间，来确保下一个试图状态是我们所期待的。

> 在达人店iOS测试版本中，订单管理页面有两个tab栏：本店订单和个人订单。我们需要获取自己刚下的订单号，但是默认进入的本店订单tab页，同时加载数据，显示加载gif动态图。此时，我们通过yml配置响应流程，在订单管理页面直接进入个人订单tab页，会出现错误，无法正常进入。原来，这是由于在默认进入的本店订单页面，会像服务端加载订单数据，同时整个视口都会显示gif动态图，这样点击个人订单按钮就会失败，无法进入。 这种情况下，就需要使用sleep操作：在进入订单管理页面时，设置**sleep 5000**，待数据加载并渲染完成后再进行点击个人订单按钮。

- 网络请求
sptt默认提供了网络请求模块，使用者可以提供相关链接及头信息即可完成请求。网络模块提供了3个参数，分别为**url，qs和headers**，其中url为请求链接，qs为查询字符串，headers则为请求头部。
```
 fake pay:
    ui_action: net
    data:
      url: http://shopappserver.showjoy.net/Fake_Pay
      qs:
        orderNumber: ${idid}
        identify: ${x_request}
      headers:
        cookie: ${ticket}
```
示例代码中，**ui_action为net**，并设置data属性为一个包含“url、qs和headers”的对象。上例中data配置项中存在3个变量，分别为“idid，x_request和ticket”，分别对应“订单号、请求标示和登录信息”，这样携带以上信息的请求可以正常访问，实现伪支付的功能。

net请求可以不使用变量，但是如果像上例中使用变量的情况下需要在step操作中提供对应的变量值，**请看下例中的step操作**：
```
fake pay the order:
    - ActionAtoms | backward
    - ActionAtoms | fake pay:
        params:
          idid: ActionAtoms | get orderId
          x_request: 11232123
          ticket: tgc=bsK6KS0wQi;um_remember="5385980EA93F8265018C9FCD285B8ED7:2E175E4D7F73DDD96CC2524B965E12A6:CC1F08AA5F8A0FA68B8D3532EA3C68AC";
```
在名为“fake pay the order”的step操作中，包含了两个atom操作，其中第二个“fake pay”操作为前文例子中定义的atom操作。通过在此处配置**params**属性设置对应的变量值：

`idid: ActionAtoms | get orderId`: 变量idid的值为*get orderId*操作的返回值（*get orderId*是一个getValue类型的atom操作，它会返回订单号）

`x_request: 11232123`: 设置x_request的值为一个常量

`ticket: tgc=bsK6KS0wQi;um_remember="5385980EA93F8265018C9FCD285B8ED7:2E175E4D7F73DDD96CC2524B965E12A6:CC1F08AA5F8A0FA68B8D3532EA3C68AC";`：设置ticket值为一串登录信息，这段字符串包含了服务端认证用户的两个必须的cookie

sptt向使用者提供了可配置的接口文件，实现了网络请求。

### step操作
上节中详细介绍了atom操作的组成，了解到atom是sptt规范中的最小粒度，而step操作则是由若干个atom操作组成的，实现**有限功能**的atom集合。这里提到的有限功能是指，“实现部分流程化的可复用的部分”。

举一个例子，在“下订单”这个测试用例中，需要首先进行“用户登录”，再进入相关商品界面进行购买，下订单。那么，可以把“登录”流程封装为一个step操作，它实现了部分功能（登录），同时也可为其他测试用例复用，这就是一个规范的step划分。

在具体书写step操作时，每一个yml文件是一个steps集合，该集合中存放相关的step操作：
```
---
BuySteps:
  enter my shop and buy sth:
    - TestUIAtoms | enter my tab
    - TestUIAtoms | enter test entry
    - TestUIAtoms | enter my shop
    - TestUIAtoms | enter an hot sale's information
    - TestUIAtoms | buy now
    - TestUIAtoms | submit order

  fake pay the order:
    - ActionAtoms | backward
    - ActionAtoms | close webview
    - ActionAtoms | return homepage
    - TestUIAtoms | enter my tab
    - TestUIAtoms | enter test entry
    - TestUIAtoms | order management
    - TestUIAtoms | my orders
    - ActionAtoms | fake pay:
        params:
          idid: ActionAtoms | get orderId
          x_request: 11232123
          ticket: tgc=bsK6KS0wQi;um_remember="5385980EA93F8265018C9FCD285B8ED7:2E175E4D7F73DDD96CC2524B965E12A6:CC1F08AA5F8A0FA68B8D3532EA3C68AC";
```
在BuySteps集合中，包含了两个step操作：“enter my shop and buy sth” 和 “fake pay the order”，每个step操作中，按顺序执行atom操作。

### testcase操作
testcase操作即为测试领域的测试用例概念，一个testcase由若干个step有机组成。在编写yml时，我们是在配置testcases集合，每一组testcases集合共用相同的测试环境（系统、硬件和其他项）。
```
---
交易链路:
  config:
    timeout: 200000
    caps: ios/caps.json
  下订单流程:
    - LoginSteps | login
    - BuySteps | enter my shop and buy sth

  支付流程:
    - BuySteps | fake pay the order
```
在名为“交易链路”的套件（用例集）中，包含了两个测试用例，同时也有这个套件的相关配置项`timeout: 200000;caps: ios/caps.json`。 设置了这两个测试用例总共执行的时间不超过200s，否则报错默认执行失败；并提供环境变量的路径在ios/caps.json下。

### caps配置
sptt工程的ios和android目录下都有一个“caps.json”配置文件，该文件定义了测试环境。

**ios的caps.json配置**
```
{
  "appium-version": "1.6.3",
  "platformName": "iOS",
  "platformVersion": "10.2",
  "deviceName": "iPhone 7",
  "autoAcceptAlerts": true,
  "automationName": "xcuitest",
  "newCommandTimeout": 3600,
  "noReset": true,
  "app": "http://shop.showjoy.net/autotest/ios/0.0.3/DaRenShop.zip"
}
```
这里我们需要关心的主要是“platformName”、“platformVersion”、“deviceName”和“app”。

前三个对应于系统、版本号和硬件。“app”则为需要测试的包，ios下后缀名为“.app”,android下为“.apk”，在这里我们引用线上的测试包进行测试。测试包的发布，请看文章  [sptt命令详解](http://docs.showjoy.net/2017/03/14/yi-dong-duan-ce-shi-kuang-jia-sptt/)。

**android的caps.json配置**
```
{
  "appium-version": "1.6.3",
  "platformName": "Android",
  "deviceName": "darendian",
  "app": "/Users/showjoy/github/telentshop/shopandroid/build/outputs/apk/shopandroid-debug.apk",
  "noReset": true,
  "appPackage": "com.showjoy.shop",
  "appActivity": "com.showjoy.shop.module.splash.SplashActivity",
  "appWaitActivity": "com.showjoy.shop.module.login.LoginActivity"
}
```
android的配置与ios的配置大同小异，区别在于android下需要提供**deviceName、appPackage、appActivity和appWaitActivity**属性。

“deviceName” 在android下无须像ios那样指定设备类型，但是必须提供一串字符用以标明设备名称，**不能为空**；

“appPackage”为Android应用的包名；

“appActivity”为应用包中启动的 Android Activity 名称；

“appWaitActivity”为要等待启动的 Android Activity 名称。

**android的打包事项**

在gradle文件中，需要针对代码设置打包配置，此处需要设置debuggable、minifyEnabled、zipAlignEnabled等选项，在实际实践中发现，一旦**debuggable**设置为false，则无法进入webview上下文，因此此处需要特别注意。


**android下的weex页面**

android下的weex页面可以正常定位，不过如果要获取UI的文本值则需要获取view的“content-desc”属性，而通过sptt定位的元素没有该属性，通过阅读appium源码可发现“content-desc”对应的元素的“name”属性，因此在sptt内部通过“name”属性获取weex中的文本值。
