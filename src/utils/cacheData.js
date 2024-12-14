import { PAGE_CHANGE_MODE } from '@/constants';
import { getLocal, setLocal, clearOneLocal } from './storage';

// 本地存储的key的名称列表
const storageNames = getStorageNames();

/**
 * 获取本地存储的key的名称列表
 * @returns {object} 本地存储的key的名称列表
 */
function getStorageNames() {
  // 前缀 storage名称列表
  return {
    // 阅读页相关
    read: {
      themeIndex: 'read-theme-index', // 阅读页主题设置
      count: 'count', // 记录用户第几次进入阅读页
      fontSizeLevel: 'read-font-size-level', // 阅读页字号设置
      lineHeightLevel: 'read_line_height_level', // 阅读页行高设置
      pageChangeMode: 'page_change_mode', // 翻页模式
      showOnbroading: 'show_onbroading', // 手势引导图
      autoAddBook: 'auto_add_book', // 自动加书架
      cacheBarTheme: 'cache_bar_theme', // 导航栏背景色
    },
  };
}

const read = {
  // 字号
  getFontSizeLevel() {
    return getLocal(storageNames.read.fontSizeLevel) || 4;
  },
  setFontSizeLevel(data) {
    setLocal(storageNames.read.fontSizeLevel, data);
  },

  // 行高
  getLineHeightLevel() {
    return getLocal(storageNames.read.lineHeightLevel) || 2;
  },
  setLineHeightLevel(data) {
    setLocal(storageNames.read.lineHeightLevel, data);
  },

  // 翻页模式
  getPageChangeMode() {
    return getLocal(storageNames.read.pageChangeMode) || PAGE_CHANGE_MODE.HORIZONTAL;
  },
  setPageChangeMode(data) {
    setLocal(storageNames.read.pageChangeMode, data);
  },

  // 手势引导图
  getShowOnbroading() { // 获取手势引导图是否出现
    return  getLocal(storageNames.read.showOnbroading) || { vertical: false, horizontal: false };
  },
  setShowOnbroading(data) { // 设置手势引导图是否展示过
    setLocal(storageNames.read.showOnbroading, data);
  },

  // 自动加书架开关
  getAutoAddBook() {
    return getLocal(storageNames.read.autoAddBook)
  },
  setAutoAddBook(data) {
    setLocal(storageNames.read.autoAddBook, data)
  },

  // 缓存导航栏背景色
  getCacheBarTheme() {
    return getLocal(storageNames.read.cacheBarTheme)
  },
  setCacheBarTheme(data) {
    setLocal(storageNames.read.cacheBarTheme, data)
  },
};

const setSessionId = sessionId => setLocal('session_id', sessionId);
const getSessionId = () => getLocal('session_id');

const setStatusBarHeight = height => setLocal('status_bar_height', height);
const getStatusBarHeight = () => getLocal('status_bar_height') || 0;
const setNavigationBarHeight = height => setLocal('navigation_bar_height', height);
const getNavigationBarHeight = () => getLocal('navigation_bar_height') || 0;

const setLocalDeviceInfo = deviceInfo => setLocal('device_info', deviceInfo);
const getLocalDeviceInfo = () => getLocal('device_info');

// 存用户 userInfo
const setLocalUserInfo = userInfo => setLocal('user_info', userInfo);
const getLocalUserInfo = () => getLocal('user_info');

// 缓存书籍 cbid 集合
const setCacheCbid = cbids => setLocal('db_cbid', cbids);
const getCacheCbid = () => getLocal('db_cbid');

// 阅文 config 配置
const setYwConfig = ywConfig => setLocal('ywAdConfig', ywConfig);
const getYwConfig = () => getLocal('ywAdConfig');

// 新老用户数据信息
const setUserDaysInfo = userInfo => setLocal('userDaysInfo', userInfo);
const getUserDaysInfo = () => getLocal('userDaysInfo');

// 机器阅读数据缓存：阅读时间、阅读页数、数据有效截止时间
const setReadCacheData = readData => setLocal('readCacheData', readData);
const getReadCacheData = () => getLocal('readCacheData');

// 单本书阅读数据缓存：阅读时间、阅读时间有效截止时间、深度推书弹窗-出现时间、出现次数、出现次数截止清零时间
const setBookCacheData = bookData => setLocal('bookCacheData', bookData);
const getBookCacheData = () => getLocal('bookCacheData');

// 广告
const setRewardInfo = rewardInfo => setLocal('rewardInfo', rewardInfo);
const getRewardInfo = () => getLocal('rewardInfo');
const setRewardTimeGap = rewardTimeGap => setLocal('rewardTimeGap', rewardTimeGap);
const getRewardTimeGap = () => getLocal('rewardTimeGap');
const setRewardAdUseConfig = useAdConfig => setLocal('rewardAdUseConfig', useAdConfig);
const getRewardAdUseConfig = () => getLocal('rewardAdUseConfig');

const setNovelInsideAdConfig = adConfig => setLocal('novelInsideAdConfig', adConfig);
const getNovelInsideAdConfig = () => getLocal('novelInsideAdConfig');

const setNovelBottomAdConfig = adConfig => setLocal('novelBottomAdConfig', adConfig);
const getNovelBottomAdConfig = () => getLocal('novelBottomAdConfig');

const setBannerAdCacheConfig = adConfig => setLocal('bannerAdConfig', adConfig);
const getBannerAdCacheConfig = () => getLocal('bannerAdConfig');
const setBannerAdUseConfig = useAdConfig => setLocal('bannerAdUseConfig', useAdConfig);
const getBannerAdUseConfig = () => getLocal('bannerAdUseConfig');

const setChapterBottomAdConfig = adConfig => setLocal('chapterBottomAdConfig', adConfig);
const getChapterBottomAdConfig = () => getLocal('chapterBottomAdConfig');

const setDownAdUseConfig = useAdConfig => setLocal('downAdUseConfig', useAdConfig);
const getDownAdUseConfig = () => getLocal('downAdUseConfig');

const setInsertAdUseConfig = useAdConfig => setLocal('insertAdUseConfig', useAdConfig);
const getInsertAdUseConfig = () => getLocal('insertAdUseConfig');

const setAdPrivacyConfig = adPrivacy => setLocal('adPrivacy', adPrivacy);
const getAdPrivacyConfig = () => getLocal('adPrivacy');

// 推荐书出现次数-浅度推荐
const setBookDialogCount = count => setLocal('bookDialogCount', count);
const getBookDialogCount = () => getLocal('bookDialogCount');
// 缓存出现过的推荐书-浅度推荐
const setBookDialog = bookIds => setLocal('bookDialog', bookIds);
const getBookDialog = () => getLocal('bookDialog');

// 缓存出现过的推荐书-深度推荐
const setDeepBookDialog = bookIds => setLocal('deepBookDialog', bookIds);
const getDeepBookDialog = () => getLocal('deepBookDialog');

// 存储书籍章节内容数据
const setChapterByCbid = (cbid, chapter) => setLocal(cbid, chapter);
const getChapterByCbid = cbid => getLocal(cbid);
const clearChapterByCbid = cbid => clearOneLocal(cbid);

// 数据上报
const setGuid = guid => setLocal('yw_guid', guid);
const getGuid = () => getLocal('yw_guid');
const setBaseLog = baseLog => setLocal('baseLog', baseLog);
const getBaseLog = () => getLocal('baseLog');
const setReportLog = logs => setLocal('reportLog', logs);
const getReportLog = () => getLocal('reportLog');
const setReportAdLog = adLogs => setLocal('reportAdLog', adLogs);
const getReportAdLog = () => getLocal('reportAdLog');
const setReportTimeLog = timeLogs => setLocal('reportTimeLog', timeLogs);
const getReportTimeLog = () => getLocal('reportTimeLog');

export {
  read,
  setSessionId,
  getSessionId,
  setStatusBarHeight,
  getStatusBarHeight,
  setNavigationBarHeight,
  getNavigationBarHeight,
  setLocalDeviceInfo,
  getLocalDeviceInfo,
  setLocalUserInfo,
  getLocalUserInfo,
  setCacheCbid,
  getCacheCbid,

  setYwConfig,
  getYwConfig,
  setUserDaysInfo,
  getUserDaysInfo,
  setReadCacheData,
  getReadCacheData,
  setBookCacheData,
  getBookCacheData,

  setRewardInfo,
  getRewardInfo,
  setRewardTimeGap,
  getRewardTimeGap,
  setRewardAdUseConfig,
  getRewardAdUseConfig,
  setNovelInsideAdConfig,
  getNovelInsideAdConfig,
  setNovelBottomAdConfig,
  getNovelBottomAdConfig,
  setBannerAdCacheConfig,
  getBannerAdCacheConfig,
  setBannerAdUseConfig,
  getBannerAdUseConfig,
  setChapterBottomAdConfig,
  getChapterBottomAdConfig,
  setDownAdUseConfig,
  getDownAdUseConfig,
  setInsertAdUseConfig,
  getInsertAdUseConfig,
  setAdPrivacyConfig,
  getAdPrivacyConfig,

  setBookDialogCount,
  getBookDialogCount,
  setBookDialog,
  getBookDialog,

  setDeepBookDialog,
  getDeepBookDialog,

  setChapterByCbid,
  getChapterByCbid,
  clearChapterByCbid,

  setGuid,
  getGuid,
  setBaseLog,
  getBaseLog,
  setReportLog,
  getReportLog,
  setReportAdLog,
  getReportAdLog,
  setReportTimeLog,
  getReportTimeLog,
};
