<p align="center">
  <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/reader-layout">
  <img alt="NPM Version" src="https://img.shields.io/npm/v/reader-layout">
  <img alt="NPM language" src="https://img.shields.io/badge/language-js-orange.svg">
  <a href="https://github.com/cjm0/reader-layout/blob/main/LICENSE"><img alt="NPM License" src="https://img.shields.io/npm/l/reader-layout"></a>
  <a href="https://cjm0.github.io/blog/page/list/"><img alt="个人博客" src="https://img.shields.io/badge/blog-@前端一锅煮-blue.svg"></a>
  <a href="https://www.zhihu.com/people/qian-duan-yiguo-zhu"><img alt="知乎" src="https://img.shields.io/badge/知乎-@前端一锅煮-blue.svg"></a>
</p>

# book-reader

vue2 vue-cli 构建的 h5 阅读器项目，支持横翻、竖翻阅读模式

## 快速开始

```bash
  git clone git@github.com:cjm0/book-reader.git

  cd book-reader

  yarn

  yarn dev

  访问链接：http://127.0.0.1:8005/read/22114917000488502
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

2. env 配置文件环境区分
  - dev 本地开发环境-proxy 代理后端预发接口
  - uat 开发环境-后端预发接口
  - test 测试环境-后端预发接口
  - pre 预发环境-后端预发接口
  - prod 生产环境-后端生产接口

3. 阅读器页面访问域名
  - 本地开发环境：http://127.0.0.1:8005/read/22114917000488502?functionswitch=111101110NNN&popBfWin=30&quadrant=1
  - 开发环境：https://uathwb-reader.yuewen.com
  - 测试环境：https://testhwb-reader.yuewen.com
  - 预发环境：https://prehwb-reader.yuewen.com
  - 正式环境：https://hwb-reader.yuewen.com

## 各期需求

看 CHANGELOG.md 文件

## 项目功能

### url 参数

1. query
- functionswitch url 控制开关：11110010NNNN
- popBfWin url popBfWin 配大于 0，阅读满 x 页自动弹出书架提示
- quadrant 通过 url 匹配到的 amis 广告配置组件（A、B、C、D 等）
- chapterId 外部传入的章节 id：跳指定章节
- readerVersion=v1 走灰度环境代码
- hwbid 书籍 id-客户端传入

2. params
- cbid 书籍 id

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
