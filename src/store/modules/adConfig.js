import { getYwAdConfig, getTimeInfo } from '@/api/read';
import {
  getYwConfig, setYwConfig,
  getUserDaysInfo, setUserDaysInfo,
  getRewardInfo, setRewardInfo,
  getRewardTimeGap, setRewardTimeGap,
  getNovelInsideAdConfig, setNovelInsideAdConfig,
  getNovelBottomAdConfig, setNovelBottomAdConfig,
  getBannerAdCacheConfig, setBannerAdCacheConfig,
  getChapterBottomAdConfig, setChapterBottomAdConfig,
  getAdPrivacyConfig, setAdPrivacyConfig
} from '@/utils/cacheData';
import { trimAll, getUserInfo, isNewUser } from '@/utils/helpers';
import jsbridge from '@/utils/jsbridge';

function getAdFirstConfig(adConfig) { // 获取广告位优先请求配置
  if (adConfig && adConfig !== '0') {
      let config = []
      adConfig.split(',').forEach(val => {
        if (val && val.includes('-')) {
          const value = val.split('-')
          config.push({
            browserAdSplitConfigList: value[1]?.split('/'),
            adShowCountConfig: Number(value[0]),
          })
        }
      })
      if (config.length > 0) {
        const theConfig = config.filter(val => {
          // 次数大于 0 && 至少有 2 个字符
          const adList = val.browserAdSplitConfigList
          return val.adShowCountConfig > 0 && adList && adList.length > 0 && trimAll(adList[0]).length > 1
        })
        return theConfig
      }
    }
}
function getAdConfig(adConfig) { // 获取多广告位配置
  if (adConfig && adConfig !== '0') {
    let config = []
    adConfig.split(',').forEach(val => {
      config.push(val.split('/'))
    })
    if (config[0] && Array.isArray(config[0]) && config[0][0]) {
      if (trimAll(config[0][0]).length > 1) { // 至少有 2 个字符才算打开
        return config
      }
    }
  }
}
async function getFreeAdConfig(adConfig) { // 激励免广云控配置
  // 100_30_1_1_0/1/2/3/4/5/6/7/8/9,0_30_1_1_a/b/c/d/e/f
  // 次数_时间_起始_间隔_尾号
  if (adConfig) {
    adConfig = adConfig.split(',')
    for (let i = 0; i < adConfig.length; i++) { // 可以是多组配置
      const val = adConfig[i]
      if (val && val.includes('_')) {
        const value = val.split('_')
        const num = Math.floor(value[0]) // 当天最多展示次数，0 关闭、-1 不限次数
        const time = Math.floor(value[1]) // 免广时间，单位分钟，> 0
        const start = Math.floor(value[2]) // 章节内起始第几个插页广告被激励免广替换，>= 1
        const interval = Math.floor(value[3]) // 激励免广间隔几个插页广告，>= 0
        const ids = value[4] // 匹配的设备位号，all 全匹配
        if (num && time > 0 && start >= 1 && interval >= 0 && ids) {
          const config = { num, time, start, interval }
          if (ids.includes('all')) {
            return config
          }
          const { userId } = await getUserInfo()
          if (userId && ids.includes(userId.slice(-1))) { // 尾号命中
            return config
          }
        }
      }
    }
  }
}
async function getAdSwitch(config) { // 获取广告开关
  /*
    0 关闭
    1-1/2/3/4 尾号 1、2、3、4 打开
    1-all 全部打开
  */
  if (config && config.includes('-')) {
    const splitArr = config.split('-')
    const ids = splitArr[1]
    if (splitArr[0] === '1' && ids) {
      if (ids.includes('all')) { // all 全打开
        return true
      }
      const { userId } = await getUserInfo()
      if (userId && ids.includes(userId.slice(-1))) { // 尾号命中
        return true
      }
    }
  }
}

function transYwConfig(ywConfig, quadrant) { // amis 配置值转化
  if (ywConfig && Array.isArray(ywConfig.data)) {
    const result = ywConfig.data.find(val => { // 匹配到对应值
      return val.title.includes(quadrant)
    })
    if (result && result.infoList) {
      const obj = { serverTime: ywConfig.serverTime }
      result.infoList.forEach(v => {
        if (v.key) {
          obj[v.key] = v.content
        }
        // 书籍扉页运营素材：bookFeiyeImg1Show bookFeiyeImg2Show
        if (v.inTitlePageBookList) {
          obj[`${v.key}Show`] = v.inTitlePageBookList
        }
      })
      return obj
    }
  }
  return ywConfig
}

// 阅文 config 全部配置
const ywConfigCache = getYwConfig()

// 新老用户缓存数据-判断新老用户
const userDaysInfoCache = getUserDaysInfo() || null
if (userDaysInfoCache) {
  window.$config.userState = userDaysInfoCache.newDay
  if (!userDaysInfoCache.newUser) {
    window.$config.userState = 0 // 老用户设置为 0
  }
}

// 广告隐私策略
const adPrivacyCache = getAdPrivacyConfig()
let adPrivacy = adPrivacyCache || {}

// 激励视频免广
const rewardInfoCache = getRewardInfo() || null
const rewardTimeGapCache = getRewardTimeGap() || 0

// 插页广告
const novelInsideAdConfigCache = getNovelInsideAdConfig()
let novelInsideAdConfig = novelInsideAdConfigCache

// 固底广告
const novelBottomAdConfigCache = getNovelBottomAdConfig()
let novelBottomAdConfig = novelBottomAdConfigCache

// 公告广告
const bannerAdConfigCache = getBannerAdCacheConfig()
let bannerAdConfig = bannerAdConfigCache

// 章末广告
const chapterBottomAdConfigCache = getChapterBottomAdConfig()
let chapterBottomAdConfig = chapterBottomAdConfigCache

// 本地开发环境调试广告样式
if (window.$config.debug) {
  novelInsideAdConfig = window.$debug.novelInsideAdConfig
  novelBottomAdConfig = window.$debug.novelBottomAdConfig
  bannerAdConfig = window.$debug.bannerAdConfig
  chapterBottomAdConfig = window.$debug.chapterBottomAdConfig
}
const state = {
  readUIConfig: window.$config.readUIConfig, // 阅读器 UI 控制开关
  freeAdConfig: window.$config.freeConfig, // 默认免广章节-阅文免广配置
  adKitConfig: 0, // kit 广告配置请求成功
  adYwConfig: 0, // 阅文广告配置请求完毕
  adPrivacy, // 广告隐私策略
  autoPageTurnFlag: window.$config.autoPageTurnFlag, // 点击广告返回是否跳过广告-横翻
  renderAdOpen: window.$config.renderAdOpen, // 全局开关-渲染广告
  renderAdIDs: window.$config.renderAdIDs, // id 尾号的就打开-渲染广告

  // 激励视频免广
  rewardInfo: rewardInfoCache,
  rewardFree: false, // 是否激励免广状态
  rewardTimeGap: rewardTimeGapCache, // 客户端和服务端时间差
  rewardAdNewStyle: false, // 是否开启新样式 false-关闭 true-打开
  rewardAdCpConfig: null, // 章首出激励视频广告

  // 插页广告
  novelInsideAdConfig, // 广告配置
  adStartPage: window.$config.adStartPage, // 提前N页预请求广告

  // 固底广告
  novelBottomAdConfig, // 广告配置
  controlBottomAd: { // 广告控制
    show: true, // 位置显隐控制
    anima: false, // 动效控制
    // string 而不是 bool 方便 setBottomAdOpen 判断
    isFree: 'false', // 免广控制
    empty: false, // 是否用占位图替换内容-暂未使用
  },
  adBottomReloadTime: {}, // 广告位间隔刷新时间配置

  // 公告广告
  bannerAdConfig,
  isShowBanner: true, // 是否已挂载展示

  // 章末广告
  chapterBottomAdConfig, // 广告章末

  // 锁章广告-插页广告
  controlLockAd: {
    lockIng: false, // 是否锁章状态中-锁章广告
    lockVertical: false, // 竖翻是否锁住状态-锁章广告
    lockDownIng: false, // 是否锁定状态中-激励下载广告
    lockInsertIng: false, // 是否锁定状态中-激励插页广告
  },

  // 缓存广告-插页广告
  cacheAdReqNum: 0, // 同1章内插页广告的请求次数
  cacheAds: [], // 缓存插页广告数据
  cacheAdCcid: '', // 缓存章节 ccid

  // 多广告位请求-插页广告
  adSplitConfig: null, // 多广告 id 配置
  originAdSplitConfig: null,
  adFirstConfig: null, // // 多广告 id 优先次数配置

  // 多广告位请求-固底广告
  adBottomSplitConfig: null, // 多广告 id 配置
  originAdBottomSplitConfig: null,
  adBottomFirstConfig: null, // // 多广告 id 优先次数配置

  // 激励下载广告-插页广告
  downAdConfig: null, // 云控配置
  downAdLock: false, // 限制翻页
  downAds: [], // 缓存广告数据以复用
  downAdDatas: [], // 弹窗广告数据
  downAdDataApps: [], // 弹窗广告数据 app 集合
  downAdBar: { // 激励下载管理栏
    type: '', // reward-权益生效中 down-下载中 open-打开
    bubble: false, // 是否出出气泡提醒
  },
  downAdReqNum: 0, // 请求复用次数
  downAdReq: [], // 请求复用广告数据以复用

  // 激励插页广告-插页广告
  insertAdConfig: null, // 云控配置（次数_时间_起始_间隔_尾号）
  insertAdLock: false, // 限制翻页
  insertAdSlotId: '', // 广告位配置

  // 推书弹窗配置
  booksConfig: null, // amis 推书配置-浅度推书弹窗
  bookUserConfig: {}, // 当前用户推书配置-浅度推书弹窗
  deepBooksConfig: null, // 当前用户推书配置-深度推书弹窗
  hasDeepBooks: null, // 是否获取到书籍-深度推书弹窗

  // 书籍扉页运营素材
  bookFeiyeImg1: {},
  bookFeiyeImg2: {},

  // 菜单栏运营位素材
  menuBarConfig: {},
  loginPopwinReadpage: 0,
};

const mutations = {
  // UI 控制开关 1-a/b/c/d-只走缓存当前不生效
  async setReadUIConfig(state, list) {
    let tag = 1
    try {
      if (list === '0') {
        tag = 0
      } else if (list && list.includes('-')) {
        const splitArr = list.split('-')
        const ids = splitArr[1]
        if (splitArr[0] === '0' && ids) {
          if (ids.includes('all')) { // all 全关闭
            tag = 0
          }
          const { userId } = await getUserInfo()
          if (userId && ids.includes(userId.slice(-1))) { // 尾号命中
            tag = 0
          }
        }
      }
      // 启用旧 UI
      if (tag === 0) {
        window.$config.ab_test = 1
      }
    } catch (error) {
      console.log('setReadUIConfig', error);
    }
    state.readUIConfig = tag
  },

  // 新老用户免广配置-只走缓存当前不生效 10-0/1/2/3/4/5/6/7/8/9/a/b/c/d/e/f
  async setFreeAdConfig(state, { oldConfig, newConfig }) {
    const isOld = window.$config.userState === 0
    let config = isOld ? oldConfig : newConfig
    if (config && config.includes('-')) {
      config = config.split('-')
      const count = config[0]
      const ids = trimAll(config[1]) // 去掉空格换行等字符干扰
      if (count && ids && ids.length > 0) {
        if (ids.includes('all')) { // all 全匹配
          state.freeAdConfig = Number(count)
          return
        }
        const { userId } = await getUserInfo()
        if (userId && ids.includes(userId.slice(-1))) { // userId 尾号命中
          state.freeAdConfig = Number(count)
        }
      }
    }
  },
  // 判断新老用户 '1'
  setUserConfig(state, { serverTime, userDays }) {
    if (serverTime) {
      if (userDaysInfoCache) {
        let newUser = true
        if (userDays >= 0) {
          const day = userDays >= 1 ? userDays : 1 // 0和1都算1
          newUser = isNewUser(userDaysInfoCache.serverTime, serverTime, Number(day))
        }
        let newDay = serverTime - userDaysInfoCache.serverTime
        newDay = Math.floor(newDay / (24 * 3600 * 1000)) || 1
        setUserDaysInfo({
          ...userDaysInfoCache,
          newUser, // 此时是否新用户
          newDay, // 到现在几天了
        })
      } else {
        // 第1次进来都是新用户
        setUserDaysInfo({
          serverTime,
          newUser: true,
          newDay: 1
        })
      }
    }
  },

  setYwAdConfig(state, number) {
    state.adYwConfig = number
  },
  setKitConfig(state, number) {
    state.adKitConfig = number;
  },
  /*
    默认-全量走华为
    adIfShow 1 true
    adIfShowConfigList []

    全量走阅文
    adIfShow 0 false
    adIfShowConfigList null

    走阅文，尾号命中部分走华为
    adIfShow 0 false
    adIfShowConfigList ['a', 'b', 'asdf1223443443']
  */
  setRenderAdOpen(state, adIfShow) {
    const num = Number(adIfShow)
    if (window.$config.renderAdOpen) { // 华为控制优先
      if (num === 0) {
        state.renderAdOpen = false
      } else {
        state.renderAdOpen = true
      }
    } else { // 阅文控制优先
      if (num === 1) {
        state.renderAdOpen = true
      } else {
        state.renderAdOpen = false
      }
    }
  },
  setRenderAdIDs(state, adIfShowConfig) {
    let useIds = adIfShowConfig
    useIds = useIds ? useIds.split(',') : useIds
    if (useIds && Array.isArray(useIds)) {
      state.renderAdIDs = useIds
    }
  },
  setAdPrivacy(state, adPrivacy) {
    state.adPrivacy = adPrivacy;
  },
  setAutoPageTurnFlag(state, flag) {
    if (flag > 0) {
      state.autoPageTurnFlag = Number(flag)
    }
  },

  // 激励视频免广
  setReward(state, reward = {}) { // 设置免广告时长权益
    const rewardInfo = {
      startTime: reward.time,
      rewardTime: reward.rewardTime,
    }
    state.rewardInfo = rewardInfo
    setRewardInfo(rewardInfo)
  },
  setRewardFree(state) { // 控制免广立马生效
    state.rewardFree = true
  },
  removeReward(state) { // 移除奖励免广告权益
    state.rewardInfo = null
    state.rewardFree = false
    setRewardInfo(null)
  },
  setRewardGap(state, timeGap) { // 设置客户端和服务端时间差
    state.rewardTimeGap = timeGap // ms
    setRewardTimeGap(timeGap)
  },
  async setRewardAdNewStyle(state, config) { // 是否开启新样式
    const openAd = await getAdSwitch(config)
    if (openAd) {
      state.rewardAdNewStyle = true
    }
  },
  async setRewardAdCpConfig(state, config) { // 章首激励视频广告
    // -1_3_1_a/b/c/d/e/f_1_10 总次数_弹窗次数_间隔_尾号
    if (config && config.includes('_')) {
      const adConfig = config.split('_')
      const allNum = Math.floor(adConfig[0]) // 当天最多展示总次数，0关闭、-1不限次数
      const num = Math.floor(adConfig[1]) // 弹窗入口当天最多展示次数，0关闭、-1不限次数
      const interval = Math.floor(adConfig[2]) // 弹窗入口间隔几个章节出现，>= 0
      const ids = adConfig[3] // 匹配的设备位号，all 全匹配
      let timeConfig = adConfig[4] // 最低阅读时长（单位min）
      let pageConfig = adConfig[5] // 最少翻页次数

      if (allNum && interval >= 0 && ids) {
        timeConfig = timeConfig >= 0 ? Math.floor(timeConfig) : 0
        pageConfig = pageConfig >= 0 ? Math.floor(pageConfig) : 0
        const config = { allNum, num, interval, timeConfig, pageConfig }
        if (ids.includes('all')) {
          state.rewardAdCpConfig = config
          return
        }
        const { userId } = await getUserInfo()
        if (userId && ids.includes(userId.slice(-1))) { // 尾号命中
          state.rewardAdCpConfig = config
          return
        }
      }
    }
  },
  // 插页
  setInsideAdConfig(state, config) {
    state.novelInsideAdConfig = config;
  },
  setAdStartPage(state, page) {
    if (page > 1) {
      state.adStartPage = Number(page)
    }
  },
  // 固底
  setBottomdAdConfig(state, config) {
    state.novelBottomAdConfig = config;
  },
  setBottomAdOpen(state, params) {
    // 章节免广状态不接受变更
    if (!params.extra && !params.isFree && state.controlBottomAd.isFree === 'true') {
      return
    }
    state.controlBottomAd = {
      ...state.controlBottomAd,
      ...params
    }
  },
  setAdBottomReloadTime(state, config) { // 广告位间隔刷新时间配置
    // o0xm17nc7x_10/q9khzjhs36_15 广告位1_间隔10s刷新/广告位2_间隔15s刷新
    if (config && config.includes('_')) {
      let timeConfig = {}
      config.split('/').forEach((val) => {
        if (val.includes('_')) {
          const result = val.split('_')
          const key = result[0]
          const time = result[1]
          if (key && time && time > 0) {
            timeConfig[key] = Math.floor(time)
          }
        }
      })
      state.adBottomReloadTime = timeConfig
    }
  },
  // 公告 公告广告配置：0,0-不限次数和时间、10,15-限15次间隔15分钟、-1,-1-关闭公告页
  setBannerAdConfig(state, adConfig) {
    let config = []
    if (adConfig && adConfig.includes(',')) {
      config = adConfig.split(',')
    }
    const count = config[0];
    const time = config[1];
    let theConfig = {
      num: -1, // 默认关闭公告
      inter: 0
    }

    if (count && count >= 0) {
      theConfig.num = Number(count)
    }
    if (time && time >= 0) {
      theConfig.inter = Number(time)
    }
    if (theConfig.num === -1) { // 没拿到次数则关闭公告
      theConfig = null
    }
    state.bannerAdConfig = theConfig
    setBannerAdCacheConfig(theConfig)
  },
  setShowBanner(state, bool) {
    state.isShowBanner = bool
  },
  // 章末
  setChapterBottomAdConfig(state, config) {
    state.chapterBottomAdConfig = config;
  },
  // 锁章
  setControlLockAd(state, params) {
    state.controlLockAd = {
      ...state.controlLockAd,
      ...params
    }
  },

  // 缓存广告-插页广告
  setAdReqNum(state, num) {
    if (num > 0) {
      state.cacheAdReqNum = Math.floor(num)
    }
  },
  pushCacheAds(state, params) { // 设置插页缓存广告-缓存广告
    const { ad, ccid, useNum } = params
    if (state.cacheAdReqNum > 0 && ad && ccid && useNum > 1) {
      // 章节 id 相同 push，不同重置
      if (ccid === state.cacheAdCcid) {
        state.cacheAds.push({ ad, useNum: useNum - 1 })
      } else {
        state.cacheAds = [{ ad, useNum: useNum - 1 }]
        state.cacheAdCcid = ccid
      }
    }
  },
  useCacheAds(state, params) { // 使用插页缓存广告-缓存广告
    const { adId, type = 'delete' } = params
    if (state.cacheAdReqNum > 0 && adId && state.cacheAds.length > 0) {
      const index = state.cacheAds.findIndex(v => v.ad.adId === adId)
      if (index !== -1) {
        if (type === 'delete') { // 删除
          state.cacheAds.splice(index, 1)
          return
        }
        if (type === 'use') { // 使用
          if (state.cacheAds[index].useNum <= 1) {
            state.cacheAds.splice(index, 1)
          } else {
            state.cacheAds[index].useNum -= 1
          }
        }
      }
    }
  },

  // 多广告位请求-插页广告 [["r69p1vd24y", "x7i1r3mwer"], "q4w3th8bgi", "x7i1r3mwer"]]
  setAdSplitConfig(state, adConfig) {
    const config = getAdConfig(adConfig)
    if (config) {
      state.adSplitConfig = config
      state.originAdSplitConfig = JSON.parse(JSON.stringify(config))
      return
    }
    console.log('多广告位请求已关闭-插页', adConfig)
  },
  useAdSplit(state) {
    state.adSplitConfig = state.adSplitConfig.slice(1)
    if (state.adSplitConfig.length === 0) { // 轮询重来
      state.adSplitConfig = state.originAdSplitConfig.slice(0)
    }
  },
  // 广告位优先请求配置-插页广告
  setAdFirstConfig(state, adConfig) {
    const theConfig = getAdFirstConfig(adConfig)
    if (theConfig && theConfig.length > 0) {
      state.adFirstConfig = theConfig
      return
    }
    console.log('多广告位优先请求已关闭-插页', adConfig)
  },
  useAdFirst(state) {
    state.adFirstConfig[0].adShowCountConfig -= 1
    if (state.adFirstConfig[0].adShowCountConfig <= 0) { // 用完就没了
      state.adFirstConfig = state.adFirstConfig.slice(1)
    }
  },

  // 多广告位请求-固底广告
  setAdBottomSplitConfig(state, adConfig) {
    const config = getAdConfig(adConfig)
    if (config) {
      state.adBottomSplitConfig = config
      state.originAdBottomSplitConfig = JSON.parse(JSON.stringify(config))
      return
    }
    console.log('多广告位请求已关闭-固底', adConfig)
  },
  useAdBottomSplit(state) {
    state.adBottomSplitConfig = state.adBottomSplitConfig.slice(1)
    if (state.adBottomSplitConfig.length === 0) { // 轮询重来
      state.adBottomSplitConfig = state.originAdBottomSplitConfig.slice(0)
    }
  },
  // 多广告位优先请求配置-固底广告
  setAdBottomFirstConfig(state, adConfig) {
    const theConfig = getAdFirstConfig(adConfig)
    if (theConfig && theConfig.length > 0) {
      state.adBottomFirstConfig = theConfig
      return
    }
    console.log('多广告位优先请求已关闭-固底', adConfig)
  },
  useAdBottomFirst(state) {
    state.adBottomFirstConfig[0].adShowCountConfig -= 1
    if (state.adBottomFirstConfig[0].adShowCountConfig <= 0) { // 用完就没了
      state.adBottomFirstConfig = state.adBottomFirstConfig.slice(1)
    }
  },

  // 激励下载广告
  // 100_30_1_1_0/1/2/3/4/5/6/7/8/9,0_30_1_1_a/b/c/d/e/f
  // 次数_时间_起始_间隔_尾号
  async setDownAd(state, adConfig) {
    const theConfig = await getFreeAdConfig(adConfig)
    if (theConfig) {
      state.downAdConfig = theConfig
    }
  },
  setDownAdLock(state, adLock) { // 限制翻页开关
    if (adLock && adLock > 0) {
      state.downAdLock = true
    }
  },
  setDownAds(state, data) { // 设置缓存广告-缓存复用广告
    state.downAds = data
  },
  setDownAdDatas(state, params) { // 设置弹窗广告数据
    const { type, appId, data, button } = params
    const dataApps = state.downAdDataApps
    let downAdDatas = state.downAdDatas

    if (type === 'push' && !dataApps.includes(appId)) {
      downAdDatas.push(data)
      downAdDatas.sort((a, b) => { // 排序
        return b.button.order - a.button.order
      })
      state.downAdDatas = downAdDatas
      state.downAdDataApps.push(appId)
      return
    }
    if (type === 'update') {
      downAdDatas = downAdDatas.map(val => {
        if (val.adId === appId) {
          val.button = button
        }
        return val
      })
      downAdDatas.sort((a, b) => { // 排序
        return b.button.order - a.button.order
      })
      state.downAdDatas = downAdDatas
      return
    }
    if (type === 'delete' && appId.length > 0) {
      state.downAdDatas = downAdDatas.filter(val => !appId.includes(val.adId))
      const result = dataApps.filter(val => !appId.includes(val))
      state.downAdDataApps = result
      // 广告全部销毁需要重置激励管理栏
      if (result.length <= 0) {
        state.downAdBar = { type: '', bubble: false }
      }
    }
  },
  setDownAdBar(state, params) { // 激励管理栏控制
    if (params.type && params.type === 'all') {
      if (state.downAdDataApps.length <= 0) {
        return
      }
      const downAdDatas = state.downAdDatas.filter(val => val.button.status === 'INSTALLED')
      params.type = downAdDatas.length > 0 ? 'open' : 'down'
    }
    state.downAdBar = {
      ...state.downAdBar,
      ...params,
    }
  },
  setDownAdReqNum(state, num) { // 广告可复用次数-请求复用广告
    if (num > 0) {
      state.downAdReqNum = Math.floor(num)
    }
  },
  updateDownAdReq(state, params) { // 更新插页缓存广告-请求复用广告
    const { uuid, data, type = 'delete' } = params
    if (type === 'push') { // 推入
      state.downAdReq.push({
        uuid,
        ad: data,
        useNum: state.downAdReqNum
      })
      return
    }
    const index = state.downAdReq.findIndex(v => v.uuid === uuid)
    if (index !== -1) {
      if (type === 'use') { // 使用
        state.downAdReq[index].useNum -= 1
      } else if (type === 'update') { // 更新
        state.downAdReq[index].ad = data
      } else if (type === 'delete') { // 删除
        state.downAdReq.splice(index, 1)
      }
    }
  },

  // 激励插页广告
  async setInsertAd(state, adConfig) {
    const theConfig = await getFreeAdConfig(adConfig)
    if (theConfig) {
      state.insertAdConfig = theConfig
    }
  },
  async setInsertAdLock(state, adLock) { // 限制翻页开关
    const openAd = await getAdSwitch(adLock)
    if (openAd) {
      state.insertAdLock = true
    }
  },
  setInsertAdSlotId(state, config) { // 广告位配置
    /*
      0 关闭，复用插页广告位
      0-x7i1r3mwer 关闭，复用插页广告位
      1-x7i1r3mwer 打开并用此广告位请求
    */
    if (config && config.includes('-')) {
      const splitArr = config.split('-')
      const slotId = splitArr[1]
      // slotId 至少有 2 个字符才算
      if (splitArr[0] === '1' && slotId && trimAll(slotId).length > 1) {
        state.insertAdSlotId = slotId
      }
    }
  },

  // 推书弹窗配置-浅度
  setBookConfig(state, configList) {
    // 1/30/0/1/0,1,2,3,4,5,6,7  大于30s 上不限制 只出1次
    if (configList && configList !== '0' && configList.includes('/')) {
      let list = []
      configList.split('\n').forEach(val => {
        if (val && val.includes('/')) {
          const value = val.split('/')
          list.push({
            popIfShowbookConfig: 0,
            popShowbookType: Number(value[0]),
            popShowbookStartTime: Number(value[1]),
            popShowbookEndTime: Number(value[2]),
            popShowbookDayCount: Number(value[3]),
            popShowbookList: value[4].split(','),
          })
        }
      })
      if (list.length > 0) {
        state.booksConfig = list
      }
    }
  },
  setBookUserConfig(state, config) { // 设置当前用户推书配置
    if (config) {
      state.bookUserConfig = config
    }
  },
  // 推书弹窗配置-深度
  async setDeepBookConfig(state, configList) {
    // 1/1/2/3/0,1,2,3,4,5,6,7 大于1min，间隔2min，每天弹出次数不多于3次，尾号匹配0,1,2,3,4,5,6,7
    if (configList && configList !== '0' && configList.includes('/')) {
      const { userId } = await getUserInfo()
      let list = []

      configList.split('_').forEach(val => {
        if (val && val.includes('/')) {
          const value = val.split('/')
          const readTime = Number(value[1]) // 阅读时长配置 min
          const spanReadTime = Number(value[2]) // 时间间隔配置 min
          const dayCount = Number(value[3]) // 24 小时内出现次数配置
          const ids = value[4].split(',') // 用户 id 配置
          let isHit = ids.includes('all') // 全命中
          if (userId && ids.includes(userId.slice(-1))) { // 尾号命中
            isHit = true
          }
          if (readTime >= 0 && spanReadTime >= 0 && dayCount >= 0 && isHit) {
            list.push({
              bookType: Number(value[0]),
              bookReadTime: readTime,
              bookSpanReadTime: spanReadTime,
              bookDayCount: dayCount,
            })
          }
        }
      })
      if (list.length > 0) {
        state.deepBooksConfig = list
      }
    }
  },
  setDeepBooks(state, boolean) { // 深度推送书
    state.hasDeepBooks = boolean
  },

  // 书籍扉页运营素材配置
  async setBookFeiyeImg1(state, configImg) {
    if (configImg && configImg.bookFeiyeImg1 && configImg.bookFeiyeImg1.includes('_')) {
      const value = configImg.bookFeiyeImg1.split('_')
      const imgUrl = value[0] // 素材 url
      const imgUrlDark = value[1] // 夜间模式素材 url
      const ids = value[2] // 匹配的设备位号，all 全匹配
      const cbids = value[3] || '' // 匹配的书籍 id

      // url1_url2_a,b,b_x1,x2,x3,x4 必须配上素材 url，设备尾号必须配置
      if (imgUrl && imgUrlDark && ids) {
        const config = { imgUrl, imgUrlDark, cbids, show: configImg.show }
        if (ids.includes('all')) {
          state.bookFeiyeImg1 = config
          return
        }
        const { userId } = await getUserInfo()
        if (userId && ids.includes(userId.slice(-1))) { // 尾号命中
          state.bookFeiyeImg1 = config
        }
      }
    }
  },
  async setBookFeiyeImg2(state, configImg) {
    if (configImg && configImg.bookFeiyeImg2 && configImg.bookFeiyeImg2.includes('_')) {
      const value = configImg.bookFeiyeImg2.split('_')
      const imgUrl = value[0] // 素材 url
      const ids = value[1] // 匹配的设备位号，all 全匹配
      const cbids = value[2] || '' // 匹配的书籍 id

      // url_a,b,b_x1,x2,x3,x4 必须配上素材 url，设备尾号必须配置
      if (imgUrl && ids) {
        const config = { imgUrl, cbids, show: configImg.show }
        if (ids.includes('all')) {
          state.bookFeiyeImg2 = config
          return
        }
        const { userId } = await getUserInfo()
        if (userId && ids.includes(userId.slice(-1))) { // 尾号命中
          state.bookFeiyeImg2 = config
        }
      }
    }
  },

  // 菜单栏运营位素材配置
  async setMenuBarConfig(state, configImg) {
    if (configImg && configImg.includes('_$tag_')) {
      const value = configImg.split('_$tag_')
      const imgUrl = value[0] // 素材 url
      const ids = value[1] // 匹配的设备位号，all 全匹配
      const linkUrl = value[2] || '' // 跳转链接
      // 跳转类型：1-阅读器其他书籍、2-浏览器端链接、3-阅读器外h5
      let linkType = 1
      if (value[3] && value[3] > 0 && value[3] < 4) {
        linkType = Math.floor(value[3])
      }

      // imgurl_a,b,b_linkUrl_linkType 必须配上素材 url，设备尾号必须配置
      if (imgUrl && ids) {
        const config = { imgUrl, linkUrl, linkType }
        if (ids.includes('all')) {
          state.menuBarConfig = config
          return
        }
        const { userId } = await getUserInfo()
        if (userId && ids.includes(userId.slice(-1))) { // 尾号命中
          state.menuBarConfig = config
        }
      }
    }
  },

  // 数据上报批量条数配置
  setReportConfig(state, reportPageEvent) {
    if (reportPageEvent && reportPageEvent.includes('_')) {
      const report = trimAll(reportPageEvent).split('_')
      const reportPage = Number(report[0])
      const reportTime = Number(report[1])
      // 限制最大 30 条
      if (reportPage <= 30 && reportPage >= 1) {
        window.$config.reportPage = reportPage
      }
      if (reportTime <= 30 && reportTime >= 1) {
        window.$config.reportTime = reportTime
      }
    }
  },
  setLoginPopwinReadpage(state, second) {
    state.loginPopwinReadpage = Number(second);
  },
};

const actions = {
  // 获取广告配置-第一次没缓存去更新，第二次有缓存后只更新缓存
  async getAdConfig(context, apply) {
    try {
      console.time('获取广告配置接口耗时：');
      const { novelInsideAdConfig, novelBottomAdConfig, chapterBottomAdConfig } = await jsbridge.call('getAdConfig');
      console.timeEnd('获取广告配置接口耗时：');

      // 插页广告
      if (!novelInsideAdConfigCache || apply) {
        context.commit('setInsideAdConfig', novelInsideAdConfig);
      }
      setNovelInsideAdConfig(novelInsideAdConfig);

      // 固底广告
      if (!novelBottomAdConfigCache || apply) {
        context.commit('setBottomdAdConfig', novelBottomAdConfig);
      }
      setNovelBottomAdConfig(novelBottomAdConfig);

      // 章末广告
      if (!chapterBottomAdConfigCache || apply) {
        context.commit('setChapterBottomAdConfig', chapterBottomAdConfig);
      }
      setChapterBottomAdConfig(chapterBottomAdConfig);

      context.commit('setKitConfig', 1);
    } catch (err) {
      console.log('getAdConfig', err);
      context.commit('setKitConfig', 2);
    }
  },
  // 获取APP广告隐私开关-第一次没缓存去更新，第二次有缓存后只更新缓存
  async getAdPrivacy(context) {
    const res = await jsbridge.call('getAppAdPrivacy')
    if (!adPrivacyCache) {
      context.commit('setAdPrivacy', res)
    }
    setAdPrivacyConfig(res)
  },
  // 获取阅文 amis 配置
  async getYwAdConfig(context, route) {
    try {
      const { params, query } = route
      const cbid = params.cbid || ''
      const quadrant = query.quadrant || '1'
      window.$config.quadrant = quadrant

      let ywConfig = ywConfigCache
      if (!ywConfigCache) { // 无缓存读取接口数据
        ywConfig = await getYwAdConfig(cbid)
        setYwConfig(ywConfig)
      }

      // 值转化
      const ywConfigData = transYwConfig(ywConfig, quadrant) || {}
      const {
        distributeSwitchesByUser, // UI 控制开关
        BrowserMaxFreeChapterConfig, // 阅文老用户免广配置
        BrowserNewUserFreeConfig, // 阅文新用户免广配置
        BrowserUserJoinedDaysConfig = -1, // 新老用户数据
        serverTime, // 服务器时间
        adIfShow, // 渲染广告全局开关
        adIfShowConfig, // 渲染广告特性开关
        readPageAdStartPage, // 提前几页预加载广告-插页广告
        autoPageTurnSwitch, // 点击广告返回是否跳过广告-插页广告
        adShowInsertCountConfig, // 控制广告请求次数-插页广告
        AdSplitConfig, // 多广告位请求配置-插页广告
        BrowserAdSplitConfigInfo, // 多广告位优先请求配置-插页广告
        downLoadAd, // 云控配置-激励下载广告
        downLoadAdLock, // 限制翻页开关-激励下载广告
        downAdReqNum, // 请求复用次数-激励下载广告
        insertAd, // 云控配置-激励插页广告
        insertAdLock, // 限制翻页开关-激励插页广告
        insertAdSlotId, // 广告位配置-激励插页广告
        BottomAdSplitConfig, // 多广告位请求配置-固底广告
        BrowserAdSplitThirdConfigInfo, // 多广告位优先请求配置-固底广告
        BottomAdReloadTime, // 广告位间隔刷新时间配置-固底广告
        AnnouncementAdConfig, // 展示次数,最小展示间隙-公告广告
        rewardAdNewStyle, // 新样式开关-激励视频广告
        rewardAdChapterConfig, // 章首出激励视频广告-激励视频广告
        PopShowBookConfig, // 推书弹窗配置-浅度
        deepPopShowBookConfig, // 推书弹窗配置-深度
        menuBarConfig, // 菜单栏运营位素材配置
        reportPageEvent, // 数据上报条数配置
        login_popwin_readpage // 鸿蒙单框未登录，多少秒弹窗
      } = ywConfigData
      if (ywConfigCache) { // 这两个只用缓存数据
        context.commit('setReadUIConfig', distributeSwitchesByUser)
        context.commit('setFreeAdConfig', { oldConfig: BrowserMaxFreeChapterConfig, newConfig: BrowserNewUserFreeConfig })
      }
      context.commit('setUserConfig', { serverTime, userDays: BrowserUserJoinedDaysConfig })
      context.commit('setRenderAdOpen', adIfShow)
      context.commit('setRenderAdIDs', adIfShowConfig)
      context.commit('setAdStartPage', readPageAdStartPage)
      context.commit('setAutoPageTurnFlag', autoPageTurnSwitch)
      context.commit('setAdReqNum', adShowInsertCountConfig)
      context.commit('setAdSplitConfig', AdSplitConfig)
      context.commit('setAdFirstConfig', BrowserAdSplitConfigInfo)
      context.commit('setDownAd', downLoadAd)
      context.commit('setDownAdLock', downLoadAdLock)
      context.commit('setDownAdReqNum', downAdReqNum)
      context.commit('setInsertAd', insertAd)
      context.commit('setInsertAdLock', insertAdLock)
      context.commit('setInsertAdSlotId', insertAdSlotId)
      context.commit('setAdBottomSplitConfig', BottomAdSplitConfig)
      context.commit('setAdBottomFirstConfig', BrowserAdSplitThirdConfigInfo)
      context.commit('setAdBottomReloadTime', BottomAdReloadTime)
      context.commit('setBannerAdConfig', AnnouncementAdConfig)
      context.commit('setRewardAdNewStyle', rewardAdNewStyle)
      context.commit('setRewardAdCpConfig', rewardAdChapterConfig)
      context.commit('setBookConfig', PopShowBookConfig)
      context.commit('setDeepBookConfig', deepPopShowBookConfig)
      context.commit('setMenuBarConfig', menuBarConfig)
      context.commit('setReportConfig', reportPageEvent)
      context.commit('setYwAdConfig', 1)
      context.commit('setLoginPopwinReadpage', login_popwin_readpage)

      if (ywConfigCache) { // 有缓存更新缓存
        ywConfig = await getYwAdConfig(cbid)
        setYwConfig(ywConfig)

        // 值转化，书籍扉页运营素材依赖接口实时返回数据，不走缓存
        const ywConfigData2 = transYwConfig(ywConfig, quadrant) || {}
        const {
          bookFeiyeImg1, // 书籍扉页运营素材1
          bookFeiyeImg1Show, // 书籍扉页运营素材1-后端配置的 ccid
          bookFeiyeImg2, // 书籍扉页运营素材2
          bookFeiyeImg2Show, // 书籍扉页运营素材2-后端配置的 ccid
        } = ywConfigData2
        context.commit('setBookFeiyeImg1', { bookFeiyeImg1, show: bookFeiyeImg1Show || '' })
        context.commit('setBookFeiyeImg2', { bookFeiyeImg2, show: bookFeiyeImg2Show || '' })
      }
    } catch (err) {
      console.error('getYwAdConfig', err)
      context.commit('setYwAdConfig', 2)
    }
  },
  // 更新广告配置缓存-暂不使用
  updateAdConfig(context) {
    // 插页广告
    const novelInsideAdConfig = getNovelInsideAdConfig();
    if (JSON.stringify(novelInsideAdConfig) !== JSON.stringify(context.state.novelInsideAdConfig)) {
      context.commit('setInsideAdConfig', novelInsideAdConfig);
    }

    // 固底广告
    const novelBottomAdConfig = getNovelBottomAdConfig();
    if (JSON.stringify(novelBottomAdConfig) !== JSON.stringify(context.state.novelBottomAdConfig)) {
      context.commit('setBottomdAdConfig', novelBottomAdConfig);
    }

    // 章末广告
    const chapterBottomAdConfig = getChapterBottomAdConfig();
    if (JSON.stringify(chapterBottomAdConfig) !== JSON.stringify(context.state.chapterBottomAdConfig)) {
      context.commit('setChapterBottomAdConfig', chapterBottomAdConfig);
    }
  },
  // 激励视频获奖设置
  async setRewardTime(context, detail) {
    const { rewardTime, adData, reason } = detail
    context.commit('setRewardFree')

    /*
      针对系统时间修改，现网有专门的处理逻辑：
      1. 进页面以及获取章节的时候会拿到服务器时间，对比本地时间，计算出两个 gap
      2. 获取奖励的时候发现有 gap 值，调后端接口获取服务器时间
      3. 切章判断 时间1：本地时间+gap，时间2：服务器时间，比较时间1和时间2
     */
    let time = new Date() * 1
    if (context.state.rewardTimeGap) {
      try {
        // 获取服务器时间
        const { now } = await getTimeInfo()
        time = now * 1000
      } catch (error) {
        console.log('setRewardTime', error)
      }
    }
    context.commit('setReward', { rewardTime, time })

    // 更新 kit 免广激励信息
    jsbridge.call('updateAdFreeInfo', {
      reason,
      adData: adData && adData.adId ? adData : {},
      freeTimeInSecond: Math.floor(rewardTime * 60), // 本次激励获得的时长，单位为秒
      lastUpdateTime: time, // 传精准时间戳过去
    });
  },
  // 获取 kit 激励免广信息
  async getAdFreeInfo(context, freeAdInfo) {
    /*
      reason	Integer	必选  免广原因取最新1次的免广信息更新状态为准，包括：
        1：激励视频免广
        2：激励下载免广
        3：激励插页广告
        4：特定人群免广（预留）
      freeTimeInSecond	Long	必选	本次免广更新的免广时间，单位秒。例如免广的时长，3600s
      deadlineTime	Long	必选	UTC时间（毫秒），存储当前用户免广截止时间戳
      lastUpdateTime	Long	必选	UTC时间（毫秒），存储最后更新时间
     */
    const { freeTimeInSecond, lastUpdateTime } = freeAdInfo
    if (freeTimeInSecond) {
      context.commit('setReward', {
        rewardTime: Math.floor(freeTimeInSecond / 60), // 免广时长 s
        time: lastUpdateTime // 时间戳
      })
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};