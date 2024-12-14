/**
 * @Description : 全局变量
 * @Author      : chenjianmin
 * @Date        : 2023-02-03 17:44:14
 */

import Mock from '@mock'

window.$config = {
  debug: process.env.NODE_ENV === 'development', // 控制本地开发环境调试
  userInfo: null, // 用户 id
  addBookBarCloseTime: 5 * 1000, // 加书架提示条自动关闭时
  progressLine: { // 记录竖翻滚动行进度
    timeStart: 0, // 加载滚动等开始时间
    timeEnd: 0, // 加载滚动等结束时间
    ccid: '',
    pCid: 0,
    pIndex: 0,
    textIndex: -1,
    cache: false,
  },
  loadIng: 1, // 页面加载状态：1-初始态，2-骨架屏关闭，3-新的loading 4-新的loading关闭
  pageTime: 0, // 页面加载完耗时统计
  baseLog: null, // 批量上报公共字段
  readUIConfig: 1, // 加书架、菜单栏、进度条、书详等启用新的样式
  ab_test: 2, // 新老UI测试：1-老阅读页 2-新阅读页
  userState: 1, // 0-老用户，1-当天新增，2-昨天新增，3-前天新增
  quadrant: '1', // 通过 url 人群标识匹配到的 amis 广告配置组件（A、B、C、D 等）
  guid: -1, // 上报给后端的标识
  isGray: false, // 是否灰度用户
  isReward: false, // 是否激励免广状态
  reportTime: 10, // 阅读时长上报 - 累积 10 个再上报
  reportPage: 30, // 公共数据上报 - 累积 30 个再上报
  status: 'hidden', // 系统状态栏状态

  // 广告相关
  freeConfig: 5, // 默认前5章免广
  renderAdOpen: true, // 全局开关-渲染广告
  renderAdIDs: [], // id 尾号命中的就打开-渲染广告
  adStartPage: 3, // 提前N页预请求广告-插页广告
  autoPageTurnFlag: 0, // 横翻模式点击广告返回是否跳过广告-插页广告
  lockCacheCcids: [], // 缓存已经锁过的章节id-锁章广告
  lockIngCcid: '', // 正在锁定的章节id-锁章广告
  downLockCcid: '', // 正在锁定的章节id-激励下载广告
  downAdIndex: 0, // 预设广告个数-激励下载广告
  downAdCpIndex: 1, // 跨章计算索引-激励下载广告
  insertLockCcid: '', // 正在锁定的章节id-激励插页广告
  insertAdIndex: 0, // 预设广告个数-激励插页广告
  insertAdCpIndex: 1, // 跨章计算索引-激励下载广告
  downToCache: false, // 数据是否已推入缓存集合-复用广告
  beforeClass1: '', // 显隐标识-固底广告
  beforeClass2: '', // 显隐标识-固底广告

  // 阅读器
  preloadPrevState: 0, // 初始化预加载预渲染前1章-竖翻
  indexedDBData: null, // 读取 indexedDB 章节数据
}

if (window.$config.debug) {
  window.$debug = Mock
  window.$config.userInfo = {
    personal: "0",
    userId: "fb4bb0043b08581feccf922d5d549ac2924de903044eeafeac7b67ddc5d48c2a"
  }
}
