## sptt
sptt是移动端UI自动化测试的一种解决方案，全称为*special tool of test*。sptt提供了一套测试解决方案，并使用命令行完成相关操作，最终可集成在各种后续的流程中。

sptt内部整合了第三方测试框架-appium，由appium层抹平iOS和android环境下的测试差异，同时sptt又针对appium的相关接口做了二次开发层面上的优化，封装了可直接使用的操作接口，并提供了开发和调试相关功能，方便使用。

关于规范介绍，请看

 **[sptt规范介绍](http://docs.showjoy.net/2017/03/20/spttgui-fan-jie-shao/)**

关于如何开发atom实例，请看

**[如何开发sptt工程的原子操作](http://docs.showjoy.net/2017/03/22/ru-he-kai-fa-spttgong-cheng-de-yuan-zi-cao-zuo/)**

## 安装sptt环境
为了测试的灵活性，sptt提供两种测试方式：

- 本地测试
- 云端测试

由于本地测试需要在本地环境部署相关的测试环境，因此在这里并不推荐测试人员使用本地测试。具体如何在本地部署环境请看[官方文档](https://github.com/appium/appium/tree/master/docs/cn)。

首先，确保电脑上已经安装nodejs环境，并设置npm的仓库为公司的内部私有仓库：
```
npm config set registry http://npm.showjoy.net
```

然后，运行命令，安装sptt:
```
sudo npm install -g sptt
```
这样，sptt命令行安装完毕。

针对一个ios工程，在对应目录下运行云端测试：
```
sptt run -t ios --online 10.1.2.49
```
针对android工程，则有：
```
sptt run -t android --online 10.1.2.49
```

## sptt命令使用
sptt提供了三个子命令：
```
sptt init
、
sptt run
和
sptt publish
```
"sptt init"用于初始化目录结构，并提供了相关模板。再创建一个新的sptt测试工程时，应该使用命令行进入当前目录，执行**sptt init**初始化目录；

“sptt run”执行测试用例，其中有多个选项：

    “-t”指定运行测试用例的环境，可以取值“ios、android”；

    “--online”指定云端测试主机的ip地址，如果不设置online则在本地环境运行测试用例；

    “-n”指定执行具体名称的testcase文件，而不是执行默认的所有测试用例，如果要执行多个文件，必须使用**“，”**连接多个文件名。

    sptt run -t ios --online 10.1.2.49 -n test1,test2,test3
    //执行test1、test2和test3这3个测试用例集合

"sptt publish"用于发布ios的测试包(*需要在在测试包所在目录下运行命令*)，android测试包的发布使用android包发布流程。需要注意的是，ios测试包是编译后的运行在模拟器上的**.app**文件，android则是**.apk**文件。

测试包的发布必须制定版本号，格式为**x.x.x**.

    cd pwd(DaRenShop.app) // 切换到app文件所在的目录
    sptt publish 0.0.5
## 示例
首先，从gitlab的testcase组中clone示例工程（http://git.showjoy.net/testcases/first-blood）；

```
pwd  //out: /Users/showjoy/github
git clone http://git.showjoy.net/testcases/first-blood
cd /Users/showjoy/github/first-blood
```
其次，确保示例文件“ios/caps.json”中的app路径正确，默认引用的是我主机上的测试包；

最后，执行命令
```
sptt run -t ios --online 10.1.2.49
```

## 调试
sptt提供了调试功能，它分为两部分：

- 日志
- 截图

#### 日志
其中，日志功能在macbook上有两个文件：命令行输出文件**sptt.runtime.log**和sptt内核-appium输出文件**appium.log**。

**sptt.runtime.log**输出的信息也就是命令行中输出的信息，它用来记录执行命令的所有输出；

**appium.log**记录云端或本地的appium服务器输出信息，当测试用例出错时，通过sptt.runtime.log文件不足以找出错误所在，这样可以通过查找**appium.log**来分析sptt与appium交互，并将相关的错误反映给开发者。

> 需要注意的是，在windows系统的cmd命令默认未提供相关功能，因此sptt并未提供appium.log文件。

#### 截图
sptt在每次原子操作执行失败后保存当前视图快照，方便测试人员快速定位错误页面和步骤，集中重点debug。快照存放在工程的“out/snapshoot”目录中，图片的名称按照**“name-content@name[action]{timer}.png”**格式命名，透过名称可以了解当前元素的选择器和执行的操作及其时间，语义化调试。

## 结果分析
sptt运行完测试用例集合后，会生成相关报表。目前测试报表路径在“out/testcaseReport.html”中，记录了测试用例集合运行的总时间、每个测试用例执行时间以及运行结果，对使用者更人性化。
