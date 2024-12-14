import { logUserBehavior } from '@/service';
import jsbridge from '@/utils/jsbridge';
import indexedDB from '@/utils/indexedDB';
import { getUserInfo, getMidnight } from '@/utils/helpers';
import {
  getBookDialogCount, setBookDialogCount,
  getBookCacheData, setBookCacheData,
  getCacheCbid, setCacheCbid,
  getBannerAdUseConfig, setBannerAdUseConfig,
  getDownAdUseConfig, setDownAdUseConfig,
  getInsertAdUseConfig, setInsertAdUseConfig,
  getRewardAdUseConfig, setRewardAdUseConfig,
  clearChapterByCbid, setChapterByCbid,
} from '@/utils/cacheData';

// 判断是否functionswitch字段是否控制开关-functionSwitch
const isSwitchOpen = (numberValue, target) => {
  if (+numberValue === target) {
    return true
  }
  return false;
}

// 监听页面大小变化 ResizeObserver-resizeFn
const setResizeObserver = (cb) => {
  const element = document.querySelector('#read_html')
  if (element) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element) {
          cb && cb()
          // console.log('ResizeObserver', entry);
        }
      }
    });
    resizeObserver.observe(element)
  }
}

// 监听页面是否进入后台-visibilitychange
const getVisibility = () => {
  let status = ''
  if (document.visibilityState === 'visible') {
    status = 'visible'
    console.log('页面显示')
  } else {
    status = 'hide'
    console.log('页面隐藏')
  }
  return status
}

// 首章有进度且进度为 0
const isReadPZero = (progressRead, pageMode) => {
  if (progressRead && progressRead.chapterIndex <= 1) {
    const { isHorizontal, isVertical } = pageMode
    if (isHorizontal && parseInt(progressRead.horizontalOffset, 10) <= 1) {
      return true
    }
    if (isVertical && !parseInt(progressRead.verticalOffset, 10)) {
      return true
    }
  }
  return false
};
// 是否扉页
const isFeiYe = (progressRead, pageMode) => {
  let feiYe = false
  if (progressRead) {
    if (isReadPZero(progressRead, pageMode)) { // 首章进度为 0
      feiYe = true
    }
    if (pageMode.isHorizontal && progressRead.horizontalOffset === 2) { // 跳过扉页的
      feiYe = false
    }
  } else { // 无进度
    feiYe = true
  }
  return feiYe
};

// 关闭系统的加载态
function skeleton() {
  window.$config.loadIng = 2
  jsbridge.call('closeSkeleton')

  // 从页面加载到骨架屏关闭耗时上报
  const disTime = new Date() * 1 - window.$config.pageTime
  logUserBehavior({
    eventId: 'reader_wholePage_loading',
    eventCode: 'loading',
    eventInfo: {
      time_consuming: disTime
    },
  })
  console.log(`耗时统计4：进入页面->骨架屏关闭 ${disTime}`)
}
const skeletonFn = (time, cb) => {
  if (time) {
    setTimeout(() => {
      skeleton()
      cb && cb()
    }, time);
  } else {
    skeleton()
    cb && cb()
  }
}

// 提前把 indexedDB 缓存的章节数据 dump 到内存中
const getDBData = (cbid) => {
  if (cbid) {
    indexedDB.getLocalItem(cbid).then(res => {
      window.$config.indexedDBData = res
    })
  }
}
// 读取内存中的章节数据
const getMemData = () => {
  return new Promise((resolve, reject) => {
    // 先取内存数据，没有就间隔 20ms 去查，超时 200ms 就放弃
    let timer = null
    let timeOut = 0
    function getData() {
      clearTimeout(timer)
      const chapter = window.$config.indexedDBData
      if (chapter) {
        resolve(JSON.parse(JSON.stringify(chapter)))
      } else {
        if (timeOut >= 200) {
          reject(`getMemData timeout ${timeOut}`)
          return
        }
        timer = setTimeout(() => {
          timeOut += 20
          getData()
        }, 20)
      }
    }
    getData()
  })
}
// 缓存书籍，每本书存1章，最多存50本
let cacheCbid = []
const setCacheChapter = (cbid, foundChapter) => {
  if (!cacheCbid.includes(cbid)) {
    const cbids = getCacheCbid()
    if (!cbids) {
      setCacheCbid([cbid])
    }
    if (cbids && !cbids.includes(cbid)) {
      if (cbids.length >= 50) {
        const theCbid = cbids.splice(0, 1)
        clearChapterByCbid(theCbid[0])
      }
      setCacheCbid([...cbids, cbid])
    }
    cacheCbid.push(cbid)
  }
  setChapterByCbid(cbid, foundChapter);
}

// 获取阅读缓存数据：阅读时间、阅读页数、数据有效截止时间
const getBookReadCache = (bookReadCache) => {
  let hasCache = false
  let before4 = false
  let cacheTimes = 0
  let cachePages = 0
  let cacheEndTime = 0
  if (bookReadCache) {
    const { readTime, readPage, endTime } = bookReadCache
    if (new Date() * 1 < endTime) { // 小于截止时间加上缓存
      cacheTimes = readTime
      cachePages = readPage
      cacheEndTime = endTime
      hasCache = true
      if (new Date().getHours() < 4) {
        before4 = true
      }
    }
  }
  return { hasCache, before4, cacheTimes, cachePages, cacheEndTime }
}

// 获取缓存的使用数据-公告广告
function getBannerCache() {
  let useConfig = {
    useDay: 0,
    useNum: 0,
    useInter: 0
  }
  const cacheConfig = getBannerAdUseConfig()
  if (cacheConfig) {
    try {
      useConfig = JSON.parse(cacheConfig)
    } catch (error) {
      console.error('getBannerCache', error)
    }
  }
  return useConfig
}
// 设置缓存使用数据-公告广告
const setBannerCache = (bannerAdConfig) => {
  if (bannerAdConfig) { // 配置打开才起效
    const { num, inter } = bannerAdConfig
    if (num > 0 || inter > 0) {
      const now = new Date() * 1
      let { useDay, useNum } = getBannerCache()
      if (useNum > 0 && (now - useDay > 24 * 3600 * 1000)) { // 超过1天重置次数
        useNum = 0
      }
      setBannerAdUseConfig(JSON.stringify({
        useDay: useNum > 0 ? useDay : now,
        useNum: useNum + 1,
        useInter: now
      }))
    }
  }
}
// 每天最大展示次数、最小展示间隙控制-公告广告
const canShowBanner = (bannerAdConfig) => {
  if (bannerAdConfig) {
    const now = new Date() * 1
    const { num, inter } = bannerAdConfig
    const { useDay, useNum, useInter } = getBannerCache()
    if (num > 0 && useNum >= num) {
      if (now - useDay < 24 * 3600 * 1000) {
        return false
      }
    }
    if (inter > 0 && (now - useInter < inter * 60 * 1000)) {
      return false
    }
  }
  return true
};

// 用锁章广告替换插页广告-锁章广告
const addLockAd = (result, cid, ccid, nextCcid, originCid, intervel) => {
  // 出锁章广告条件：当前章节索引大于等于起始章节索引 && 章节索引和起始章节索引间隔 intervel 章
  let lastAdIndex = -1
  if (intervel >= 0 && cid >= originCid && (cid - originCid + 1) % (intervel + 1) === 0) {
    result.forEach((val, index) => {
      if (val.ad) {
        lastAdIndex = index
      }
    })
  }
  // 最后一章不锁
  if (nextCcid === '-1') {
    lastAdIndex = -1
  }
  // 锁章广告
  if (lastAdIndex > -1) {
    if (window.$config.lockCacheCcids.includes(ccid)) {
      // 被锁章挪移过的广告不再恢复加载
      result.splice(lastAdIndex, 1)
    } else {
      // 把最后一个常规插页广告挪至章尾，作为该章的拦截式插页广告
      result.push({ ...result.splice(lastAdIndex, 1)[0], lock: true })
    }
  }

  // console.log(333, 'contentList', result);
  return result
}
// 用激励下载广告替换插页广告-激励下载广告
const addDownAd = (result, downAdConfig, cid, originCid) => {
  if (downAdConfig) {
    const { num, start, interval } = downAdConfig
    const useConfig = getDownAdUseConfig()
    const now = new Date() * 1
    let hasNum = num
    if (useConfig) {
      if (now - useConfig.time <= 24 * 60 * 60 * 1000) {
        hasNum = num - useConfig.num // 1天内剩余展示次数
      } else {
        setDownAdUseConfig({ num: 0, time: 0 }) // 超过1天重置时间
      }
    }
    if (num === -1 || hasNum > 0) {
      const crossCp = cid >= originCid // 是否跨章计算
      let tag = false
      let adIndex = crossCp ? window.$config.downAdCpIndex : 1 // 章节内第几个插页广告
      result.map((val) => {
        if (val.ad && !val.lock) { // 锁章广告不能被替换
          if (num === -1 || window.$config.downAdIndex < hasNum) {
            if (adIndex === start) { // 章节内起始第几个插页广告被激励下载广告替换
              tag = true
            } else if (adIndex > start) { // 激励下载广告之间间隔几个插页广告
              if (interval === 0 || (adIndex - start) % (interval + 1) === 0) {
                tag = true
              }
            }
          }
          if (tag) {
            val.adType = 'downAd'
            window.$config.downAdIndex += 1 // 预设加1
            tag = false
          }
          adIndex += 1
          // 跨章索引计算
          if (crossCp) {
            window.$config.downAdCpIndex += 1
          }
        }
        return val
      })
    }
  }
  return result
}
// 用激励插页替换插页广告-激励插页广告
const addInsertAd  = (result, insertAdConfig, cid, originCid) => {
  if (insertAdConfig) {
    const { num, start, interval } = insertAdConfig
    const useConfig = getInsertAdUseConfig()
    const now = new Date() * 1
    let hasNum = num
    if (useConfig) {
      if (now - useConfig.time <= 24 * 60 * 60 * 1000) {
        hasNum = num - useConfig.num // 1天内剩余展示次数
      } else {
        setInsertAdUseConfig({ num: 0, time: 0 }) // 超过1天重置时间
      }
    }
    if (num === -1 || hasNum > 0) {
      const crossCp = cid >= originCid // 是否跨章计算
      let tag = false
      let adIndex = crossCp ? window.$config.insertAdCpIndex : 1 // 章节内第几个插页广告
      result.map((val) => {
        if (val.ad && !val.lock && val.adType !== 'downAd') { // 锁章广告、激励下载广告不能被替换
          if (num === -1 || window.$config.insertAdIndex < hasNum) {
            if (adIndex === start) { // 章节内起始第几个插页广告被激励插页替换
              tag = true
            } else if (adIndex > start) { // 激励插页之间间隔几个插页广告
              if (interval === 0 || (adIndex - start) % (interval + 1) === 0) {
                tag = true
              }
            }
          }
          if (tag) {
            val.insertAd = true
            tag = false
            window.$config.insertAdIndex += 1 // 预设加1
          }
          adIndex += 1
          // 跨章索引计算
          if (crossCp) {
            window.$config.insertAdCpIndex += 1
          }
        }
        return val
      })
    }
  }
  return result
}

// 判断是否在免广告时区间-激励免广
const inRewardAd = (rewardInfo, rewardTimeGap) => {
  const { rewardTime, startTime } = rewardInfo
  const now = new Date().getTime() + rewardTimeGap // 加上时间差
  const timeDiff = Math.abs((now - startTime) / 1000 / 60)
  if (timeDiff <= Number(rewardTime)) {
    return true
  }
  return false
}
// 获取章首激励视频广告-激励免广
const getRewardAdCP = (rewardAdCpConfig, swiperCpNum) => {
  if (rewardAdCpConfig) {
    const { allNum, num, interval } = rewardAdCpConfig

    // 减掉用过的次数
    const useConfig = getRewardAdUseConfig()
    let hasAllNum = allNum // 剩余总次数
    let hasNum = num // 弹窗剩余次数
    if (useConfig) {
      const { useAll, useNum, time, agree } = useConfig
      const now = new Date() * 1
      const day7 = now - agree <= 7 * 24 * 60 * 60 * 1000 // 7天内
      const day1 = now - time <= 24 * 60 * 60 * 1000 // 1天内
      if (useAll > 0 && day1) {
        hasAllNum = hasAllNum - useAll // 1天内剩余总展示次数
        hasNum = hasNum - useNum // 1天内剩余弹窗展示次数
      } else {
        setRewardAdUseConfig({ useAll: 0, useNum: 0, time: 0, agree: agree || 0 }) // 超过1天重置时间
      }
      if (num === -1) { // 弹窗入口不限次数
        hasNum = -1
      }
      if (agree && day7) { // 7天内不出提示
        hasNum = 0
      }
    }

    // -1不限总次数 || 总次数有剩余
    if (allNum === -1 || hasAllNum > 0) {
      if (hasNum === -1 || hasNum > 0) { // 弹窗入口不限次数 || 符合间隔次数规则就出弹窗入口
        if (interval === 0 || (swiperCpNum - 1) % (interval + 1) === 0) {
          return 'dialog'
        }
      }
      return 'bottom'
    }
  }
  return ''
}

// 从 kit 获取推荐书
function transBook(books, hwbid) { // 书籍转换
  let arrBook = []
  books.forEach((val) => {
    const hwBookId = val?.ebookInfo?.hwBookId
    const baseInfo = val?.ebookInfo?.ebookBasicInfo
    let introduction = baseInfo?.introduction
    if (introduction) {
      introduction = introduction.replace(/\u3000+/gi, '')
    }
    let cpExtInfo = val?.ebookInfo?.cpExtInfo
    if (cpExtInfo) {
      cpExtInfo = JSON.parse(cpExtInfo)
    }
    let clickLinkList = val?.action?.clickLinkList
    let clickLink = ''
    if (clickLinkList && clickLinkList.length > 0) {
      clickLinkList = clickLinkList.filter(v => v.type === '0')
      clickLink = clickLinkList?.[0]?.url
    }
    // 过滤掉当前书籍以及无 clickLink 书籍
    if (hwBookId !== hwbid && clickLink) {
      arrBook.push({
        hwBookId, // 华为书籍 id
        cbid: val.oriDocId, // 阅文书籍id
        cover: baseInfo?.cover?.url,
        name: baseInfo?.name,
        categoryNameList: baseInfo?.categoryList.map(item => {
          return item.categoryName
        }),
        categoryName: baseInfo?.categoryList?.[0]?.categoryName,
        wordCount: Math.ceil((baseInfo?.wordCount || 0) / 10000), // 字数
        finished: baseInfo?.finished === 1 ? '已完结' : '连载中', // 1-完结 0-连载
        subscribeInfo: val?.ebookInfo?.subscribeInfo?.subscribeStatus === 1, // 1 已加书架
        isAddBook: false,
        introduction, // 简介
        cpExtInfo,
        link: clickLink,
        score: val?.ebookInfo?.ebookStatisticInfo?.score
      })
    }
  })
  return arrBook
}
const getRecommendBooks = async (hwbid, type, bookLen) => {
  let tip = type === '1' ? '浅度推书' : '深度推书'
  tip = bookLen === 15 ? '章尾推书' : tip
  try {
    const userInfo = await getUserInfo()
    const userId = userInfo.userId || ''
    const repId = String(new Date() * 1) + '_' + userId
    const requestExtParam = JSON.stringify({ bookLen, repId })
    const recommendBooks = await jsbridge.call('getReaderRecommendEBook', hwbid, type, requestExtParam)

    console.log(`获取推荐书成功：${tip}`, recommendBooks);
    if (recommendBooks && recommendBooks.length > 0) {
      return [recommendBooks, transBook(recommendBooks, hwbid)]
    }
  } catch (error) {
    console.log(`获取推荐书失败：${tip}`, error)
  }
}
// 获取推荐书籍弹窗是否展示-浅度推书弹窗
const getBookDialogShow = (bookUserConfig, readDuration) => {
  const { bookDialog = 0, popShowbookStartTime = 0, popShowbookEndTime = 0, popShowbookDayCount = 1 } = bookUserConfig
  let show = true

  // 未获取到书籍不显示
  if (!bookDialog) {
    show = false
  }
  //  a≤t≤b 不设置，则没有时间限制 s
  if (popShowbookStartTime && readDuration < popShowbookStartTime) {
    show = false
  }
  if (popShowbookEndTime && readDuration > popShowbookEndTime) {
    show = false
  }
  // 当日最多可展示多少次推书弹窗
  const nowTime = new Date() * 1
  let count = getBookDialogCount()
  if (count) {
    // 超过1天重置 count
    count = nowTime - count.time >= 24 * 3600 * 1000 ? 0 :  count.count
    if (popShowbookDayCount <= count) {
      show = false
    }
  }

  // 记录使用信息
  if (show) {
    setBookDialogCount({
      count: count + 1,
      time: nowTime
    })
  }

  return { show }
}
// 是否出深度弹窗-深度推书弹窗
const isDeepBookDialogShow = (cbid, bookDayCount, bookSpanReadTime, isSetCache = true) => {
  // 次数和时间间隔限制
  const nowTime = new Date() * 1
  const bookCacheData = getBookCacheData() || {}
  const caheBook = bookCacheData[cbid]
  let endTime = getMidnight() // 今日凌晨4点时间戳
  let useCount = 0
  let show = true

  if (caheBook) {
    const { deepBookCount, deepBookEndTime, deepBookShowTime } = caheBook

    // 未超过截止时间，保持缓存的 deepBookCount、deepBookStartTime
    if (nowTime < deepBookEndTime) {
      useCount = deepBookCount
      endTime = deepBookEndTime
    }
    // 展示次数已用完
    if (useCount >= bookDayCount) {
      show = false
    }
    // 展示时间间隔小于配置的时间间隔
    if (nowTime - deepBookShowTime < bookSpanReadTime * 60 * 1000) {
      show = false
    }
  }

  // 记录使用信息
  if (show && isSetCache) {
    bookCacheData[cbid] = {
      ...caheBook,
      deepBookCount: useCount + 1, // 出现次数
      deepBookEndTime: endTime, // 出现次数截止清零时间
      deepBookShowTime: nowTime, // 出现时间
    }
    setBookCacheData(bookCacheData)
  }

  return show
}
// 获取推荐书籍弹窗是否展示-深度推书弹窗
const getDeepBookDialogShow = (hasDeepBooks, booksConfig, readTimes, cbid) => {
  // 如果没有推荐书籍数据 || 没有深度推书弹窗配置，则不展示弹窗
  if (!hasDeepBooks || !booksConfig) {
    return false
  }

  // amis 配置
  const { bookReadTime, bookSpanReadTime, bookDayCount } = booksConfig[0]

  // 阅读时长 < 配置的阅读时长
  if (readTimes < bookReadTime * 60) {
    return false
  }
  // 获取是否出深度弹窗
  const show = isDeepBookDialogShow(cbid,  bookDayCount, bookSpanReadTime, true)

  return show
}

// 埋点上报统一处理
const report = (eventId, eventInfo = {}, batch = true) => {
  let logData = eventId
  if (eventId) {
    const eventCode = eventId.split('_')
    logData = {
      eventId,
      eventCode: eventCode[eventCode.length - 1],
      eventInfo: { ...eventInfo },
    }
  }
  logUserBehavior(logData, batch);
}
// 上报阅读时长事件
const logReader = (hwbid, chapter, stayTime, catalogLen, totalChapterIds, functionSwitch) => {
  /*
    1. 竖翻+扉页+滑动大于0+初次：启动计时器，30s 后上报阅读时长
    2. 横翻+每翻1页+无计时器在跑：启动计时器，30s 后上报阅读时长

    3. 页面显示（切走再现显示：切广告、切后台等）：重置计时器，30s 后上报阅读时长
    4. 页面隐藏（切走：切广告、切后台等）+已有计时器在跑：上报阅读时长

    5. 新章节加载+非首章：启动计时器，30s 后上报阅读时长
    6. 离开阅读器前（退出加书架弹窗退出、顶部导航栏返回）：上报阅读时长
    7. 切换章节（目录切章、进度条切章、翻页章节切换等各种）：上报阅读时长
  */
  if (!chapter) {
    return;
  }
  const { duration, totalDuration, totalPages, isTail } = stayTime;
  const percent = catalogLen > 0 ? Math.floor((chapter.cid / catalogLen) * 100) : 0;
  const totalChapterCount = Array.from(new Set(totalChapterIds)).length;
  const ywParams = {
    duration,
    chap_no: chapter.ccid, // 阅读章节 id
    ext1: isTail, // 从目录或进度切章上报0
    ext2: chapter.cid, // 阅读章节数
    ext9: functionSwitch, // 阅读功能开关
    pages: totalPages,
  };
  const hwParams = {
    totalChapterCount, // 总阅读章数
    percent, // 阅读百分比
    hwbookId: hwbid, // 华为书id
    duration: totalDuration, // 总阅读时长
    segDuration: duration, // 分段阅读时长
    totalPageCount: totalPages, // 总阅读页数
  };
  // console.log('ywParams', ywParams);
  // console.log('hwParams', hwParams);
  report('reader_read_time', ywParams);
  jsbridge.commitReadEvent(hwParams);
}

export {
  isSwitchOpen,
  setResizeObserver,
  getVisibility,
  isReadPZero,
  isFeiYe,
  skeletonFn,
  getDBData,
  getMemData,
  setCacheChapter,
  getBookReadCache,

  setBannerCache,
  canShowBanner,
  addLockAd,
  addDownAd,
  addInsertAd,
  inRewardAd,
  getRewardAdCP,

  getRecommendBooks,
  getBookDialogShow,
  isDeepBookDialogShow,
  getDeepBookDialogShow,

  report,
  logReader,
};
