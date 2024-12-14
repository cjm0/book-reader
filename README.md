# hwb_reader

vue2 vue-cli 构建的华为浏览器内嵌 h5 阅读器项目，支持横翻、竖翻阅读模式

## 快速开始

```bash
  git clone git@git.woa.com:YuewenGroup/OpenPlatform/Web/hwb_reader.git

  cd hwb_reader

  npm install

  npm run dev

  访问链接：http://127.0.0.1:8005/read/22114917000488502?functionswitch=111101110NNN&popBfWin=30&quadrant=1
```

## 基础信息

### 开发版本创建

- 根据提测时间创建 git 分支版本，举例：dev_822
- .env 文件修改代码版本：v2.8.0.20230822
- serviceWorker.js 文件修改 serviceWorker 版本：v20230822（这个一般不用修改）

### 各环境区分

1. 代码分支
  - feature/xxx 功能分支代码
  - dev_xxx 开发、测试分支代码
  - pre 预发环境代码
  - gray 生产环境代码-版本灰度代码
  - product 生产环境代码-线上最终代码
  - master 生产环境代码-线上最终代码备份

2. 流水线环境
  - test 开发环境
  - custom 测试环境
  - pre 预发环境
  - hw_gray 生产环境-灰度
  - formal 生产环境

3. 123 服务环境
  - test 开发环境
  - open-fe-uat 测试环境
  - pre 预发环境
  - hw_gray 生产环境-灰度
  - formal 生产环境

4. env 配置文件环境区分
  - dev 本地开发环境-proxy 代理后端预发接口
  - uat 华为开发环境-后端预发接口
  - test 华为测试环境-后端预发接口
  - pre 华为预发环境-后端预发接口
  - prod 华为生产环境-后端生产接口

5. 阅读器页面访问域名
  - 本地开发环境：http://127.0.0.1:8005/read/22114917000488502?functionswitch=111101110NNN&popBfWin=30&quadrant=1
  - 华为开发环境：https://uathwb-reader.yuewen.com
  - 华为测试环境：https://testhwb-reader.yuewen.com
  - 华为预发环境：https://prehwb-reader.yuewen.com
  - 华为正式环境：https://hwb-reader.yuewen.com

6. 开发调试
  - 本地开发：广告以及配置数据本地模拟
  - 真机调试：华为手机安装测试环境包

7. 测试发布
  - uat 发布到浏览器开发环境：蓝盾流水线 env-test code_tag-自选代码分支，举例 dev_0717
  - test 发布到浏览器测试环境：蓝盾流水线 env-custom code_tag-自选代码分支，举例 dev_0717
  - pre 发布到浏览器预发环境：蓝盾流水线 env-pre code_tag-pre

8. 灰度发布：gray 发布到浏览器灰度环境
  - 分支打 tag（会自动打包然后发布到灰度服务 hw_gray 环境）
  - 123 平台「镜像版本」导入123平台其它环境的镜像
  - 「节点管理」依次手动发布两台机器
  - 正式 url 拼 readerVersion=v1 参数，强制走灰度环境

9. 上线发布：product 发布到浏览器现网环境
  - 走 mr 合并评审流程，把 gray 代码合并到 product 分支
  - product 分支打 tag（会自动打包，发布到正式服务 formal 环境）
  - oa 流程中心提发布流程
  - 企微「生态发布审批流程」群通知
  - 「节点管理」依次手动发布两台机器
  - 发布成功后邮件通知
  - 微信群通知
  - 企微群通知

10. 快速发布
  浏览器开发环境、浏览器测试环境可通过 dtools 来快速发布。

  [使用 dtools 快速发布测试环境](https://iwiki.woa.com/p/4012039114)：https://iwiki.woa.com/p/4012039114

11. 各环境关系
  - 测试环境：浏览器测试包、测试域名、测试kit、测试 ADS、新功能代码、测试后端接口
  - 预发环境：浏览器预发包、预发域名、预发kit、正式 ADS、新功能代码、测试后端接口
  - 灰度环境：浏览器正式包、正式域名、正式kit、正式 ADS、新功能代码、正式后端接口
  - 正式环境：浏览器正式包、正式域名、正式kit、正式 ADS、现网代码、正式后端接口

12. 安装包
  - performance 开发包 uathwb-reader.yuewen.com
  - algol envTest 测试包 testhwb-reader.yuewen.com
  - online 预发包 prehwb-reader.yuewen.com

## 前端各期需求

看 CHANGELOG.md 文件

## 项目功能

### url 参数

1. query
- functionswitch url 控制开关：11110010NNNN
- popBfWin url popBfWin 配大于 0，阅读满 x 页自动弹出书架提示
- quadrant 通过 url 匹配到的 amis 广告配置组件（A、B、C、D 等）
- chapterId 外部传入的章节 id：跳指定章节
- readerVersion=v1 走灰度环境代码
- hwbid 书籍 id-华为

2. params
- cbid 书籍 id-阅文

### 版本灰度发布

正式链接 https://hwb-reader.yuewen.com/read

指向 123 opentrpc.hwb_reader formal 这个服务环境

灰度链接 https://hwb-reader.yuewen.com/read?readerVersion=xxx

指向 123 opentrpc.hwb_reader_gray hw_gray 这个服务环境

[华为浏览器-灰度和强制更新方案](https://doc.weixin.qq.com/doc/w3_AbQA6gYuAH4wmWNIJ10QbCHRH0lKD?scode=AFoA2wfSABEacHhJQGAbQA6gYuAH4&is_precreate=1&isEnterEdit=1&dver=3.0.0)

### 性能优化

[wikis 文档地址](https://iwiki.woa.com/p/4010047188)：https://iwiki.woa.com/p/4010047188

### 翻页实现

[wikis 文档地址](https://iwiki.woa.com/p/4010047184)：https://iwiki.woa.com/p/4010047184

[标点符号处理参考](https://www.figma.com/file/YqCuxXPZVAylf0Arn3rXAq/%E9%98%85%E8%AF%BB%E5%99%A8-%E6%96%87%E5%AD%97%E6%8E%92%E5%8D%B0%E4%BC%98%E5%8C%96?node-id=1%3A32&mode=dev)

### 数据埋点上报

[wikis 文档地址](https://iwiki.woa.com/p/4010047182)：https://iwiki.woa.com/p/4010047182

### 阅读时长上报逻辑

[wikis 文档地址](https://iwiki.woa.com/p/4010808385)：https://iwiki.woa.com/p/4010808385

### 广告

[pps 广告文档](https://developer.huawei.com/consumer/cn/doc/development/HMSCore-Guides/publisher-service-js-native-0000001179595233)：https://developer.huawei.com/consumer/cn/doc/development/HMSCore-Guides/publisher-service-js-native-0000001179595233

[广告实现](https://iwiki.woa.com/p/4010047183)：https://iwiki.woa.com/p/4010047183

[固底广告请求逻辑](https://iwiki.woa.com/p/4010047180)：https://iwiki.woa.com/p/4010047180

[插页广告请求逻辑](https://iwiki.woa.com/p/4010760308)：https://iwiki.woa.com/p/4010760308

## Amis 平台世界树配置

[世界树地址](https://amis.yuewen.com/group/bookportal/node?pageId=233&page=1&size=20&method=list&biz=node)

页面id：20221122001

[wikis 文档地址](https://iwiki.woa.com/p/4010047181)

## 文档

1. iwiki 文档地址：https://iwiki.woa.com/p/4010047178

2. 代码仓库地址：https://git.woa.com/YuewenGroup/OpenPlatform/Web/hwb_reader

3. 需求地址：
  https://tapd.woa.com/HUAWEIBrowser/prong/iterations/card_view/1070019823001818563?q=4d12f24ed0d849c24847dd94b4f59c5d

4. 需求排期表：
  https://doc.weixin.qq.com/sheet/e3_AMAAsgZkAMErZPOzQ0PRTaFQ3GylY?scode=AFoA2wfSABEs7308SJAMAAsgZkAME&tab=i2katf

5. 数据埋点需求表：
  https://doc.weixin.qq.com/sheet/e3_AIIAwQZ2AMIc3E9PGX0TjCvqVG5U6?scode=AFoA2wfSABERccPOgmADAADgbcAAg

6. figma地址：
  https://www.figma.com/file/o4SpyjWEd1FlY6uVW1Kqj0/%E5%8D%8E%E4%B8%BA%E6%B5%8F%E8%A7%88%E5%99%A8%E5%B0%8F%E8%AF%B4%E8%AE%BE%E8%AE%A1%E9%9C%80%E6%B1%82?node-id=1539%3A124231&mode=dev

  https://www.figma.com/design/K1yaHy6wtgBUqPEkBf3h26/%E5%8D%8E%E4%B8%BA%E6%B5%8F%E8%A7%88%E5%99%A8?node-id=2596-283754&m=dev

7. 服务端api文档：
  https://doc.weixin.qq.com/doc/w3_AMAAsgZkAMEkHw6dHlQSD2xb0EnlY?scode=AFoA2wfSABEPkkbHLGADAADgbcAAg

8. 华为测试问题同步
  https://workplace.cbgcpm.huawei.com/#/group/smart-selection/Issue_Collaboration_Main

9. 蓝盾流水线地址：
  https://devops.woa.com/console/pipeline/yw-openplatform/p-51c03392622843d5a0237b5c8064c59f/history

10. 123服务地址：
  https://123.woa.com/v2/formal#/server-manage/index?app=opentrpc&server=hwb_reader&tab=nodeManage

11. 七彩石配置
  http://rainbow.oa.com/console/e88674c3-52a5-4180-9a85-3e486016ee77/pre/list

12. serviceWorker 更新方案
  https://doc.weixin.qq.com/doc/w3_AbQA6gYuAH4wmWNIJ10QbCHRH0lKD?scode=AFoA2wfSABEacHhJQGAbQA6gYuAH4

13. sentry
  项目名称：hwb-reader
  上报逻辑：开发、测试、预发包加 sentry 错误上报
  https://sentry-inner.yuewen.com/organizations/yue/issues/4182744/?project=54&query=is%3Aunresolved

14. yep
  public/index.html 中，已注释掉
  https://yep-inner.yuewen.com/#/overview/10110

## 注意

1. 版本
- node 版本要求：node 16
- vue-cli ~5.0.0-beta.7
- vue ^2.6.11
- vue-router ^3.5.2
- vuex ^3.6.2
- vant ^2.12.39
- webpack 5.76.0
- eslint ^6.7.2

2. 说明
- userInfo.userId => X-HW-HBID-HASH: fb4bb0043b08581feccf922d5d549ac2924de903044eeafeac7b67ddc5d48c25

## Git 提交规范

dev 分支上线后要及时删除

- feat：新增feature
- fix：修复bug
- perf：优化相关，比如提升性能、体验
- refactor：代码重构，没有加新功能或者修复bug
- docs：仅仅修改了文档，比如README, CHANGELOG, CONTRIBUTE等等
- style：仅仅修改了空格、格式缩进、逗号等等，不改变代码逻辑
- test：测试用例，包括单元测试、集成测试等
- chore：改变构建流程、或者增加依赖库、工具等
- revert：回滚到上一个版本
