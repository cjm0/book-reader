// jsBridge文档 https://doc.weixin.qq.com/doc/w3_m_JhjvmszyFFMj?scode=AJEAIQdfAAo8ZjJiJzAMcAHQaaACc
import { APIKIT_ERROR_TIPS, EVENT_CASE } from '@/constants';
import { getSessionId } from '@/utils/cacheData';
import { logUserBehavior } from '@/service';

window.hwReaderApiKit = {}
const errorMsg = '请在华为浏览器中打开';
const jsbridge = {
  /**
   * @returns <Promise>
   */
  call() {
    const context = this;
    // onReady((jsbridge) => {})
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line prefer-rest-params
      const args = [...arguments];
      const method = args[0];
      if (!window.hwReaderApiKit) {
        reject(errorMsg);
        this.reportErr(method, errorMsg)
        return;
      }
      const promiseResult = context[method](...args.slice(1));
      console.log(`【${method}】:`, promiseResult);
      if (promiseResult) {
        promiseResult.then((res) => {
          console.log(1111111111111, method, res);
          resolve(res);
        }).catch((err) => {
          console.log(2222222222222, method, err);
          err.errMsg = APIKIT_ERROR_TIPS[err.errorCode] || err.errMsg;
          reject(err);
          this.reportErr(method, err)
        });
      } else {
        resolve();
      }
    });
  },
  reportErr(method, err) { // kit 失败上报
    logUserBehavior({
      eventId: 'reader_kit_error',
      eventCode: 'error',
      eventInfo: {
        ext1: method,
        ext2: err.errorCode ? err.errorCode : err,
        ext3: err.errMsg ? err.errMsg : err,
      },
    });
  },
  // 初始化ReaderKit
  init() {
    const { base } = window.hwReaderApiKit;
    const initInfo = {
      readerVersion: process.env.VUE_APP_VERSION,
      sessionId: getSessionId(),
      url: window.location.href,
    };
    base.init(initInfo);
  },
  /**
   * 获取阅读器sdk基础信息
   */
  getReaderBaseInfo() {
    const { base } = window.hwReaderApiKit;
    return base.getBaseInfo();
  },

  /**
   * 获取作品的详情、阅读进度及订阅状态
   * @param {*} hwbid 华为书籍id
   * @returns Promise
   */
  getBookInfo(hwbid) {
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve(window.$debug.bookInfo);
    }

    const { readerExperience } = window.hwReaderApiKit;
    return readerExperience.getEBookCoverInfo(hwbid);
  },
  /**
   * 获取阅读进度和订阅状态
   * @param {*} hwBookId 华为book id
   * @returns
   */
  async getReadProgress(hwBookId) {
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({ hwBookId, ...window.$debug.bookProgress });
    }

    try {
      const { readerExperience } = window.hwReaderApiKit;
      const data = await readerExperience.getReadProgress(hwBookId);
      return Promise.resolve(data);
    } catch (err) {
      return Promise.reject(err)
    }
  },
  /**
   * 同步阅读进度
   * @param hwbid 由华为生成小说唯一ID
   * @param case 阅读进度更新原因。包括：
                1：切换章节
                2：翻页（左右滑动）
                3：上下滑动停止（上下滑动模式）
                4：退出阅读器
                注：其中切换章节、退出阅读器需要立即更新阅读进度。其他原因采用定时更新阅读进度。
   * @param cid 章节序号
   * @param ccid 章节id
   * @param verticalOffset 上下滑动偏移量
   * @param horizontalOffset 左右滑动偏移量
   * @param chapterName 章节名称
   */
  updateReadProgress(params) {
    const { readerExperience } = window.hwReaderApiKit;
    const { caseType, hwbid, cid = '', ccid, title, verticalOffset = '', horizontalOffset = '', maxChapterIndex = '', maxChapterId = '' } = params;
    console.log(333, 'updateReadProgress', JSON.stringify(params))
    return readerExperience.updateReadProgress(caseType, hwbid, {
      chapterIndex: String(cid),
      chapterId: ccid,
      verticalOffset: String(verticalOffset),
      horizontalOffset: String(horizontalOffset),
      chapterName: title,
      maxChapterIndex: String(maxChapterIndex),
      maxChapterId: String(maxChapterId),
    });
  },
  /**
   * 书籍订阅接口
   * @param hwBookId 作品id>cbid
   * @returns Promise
   */
  subscribeEBook(hwBookId, operate = '1', feedsCardInfo) {
    const { readerExperience } = window.hwReaderApiKit;
    if (feedsCardInfo) {
      return readerExperience.subscribeEBook(hwBookId, operate, feedsCardInfo);
    }
    return readerExperience.subscribeEBook(hwBookId, operate);
  },
  /**
   * 阅读器内推荐接口
   * @param {String} hwBookId 华为书籍id
   * @param {String} recommendType 推荐场景号
   * @param {String} requestExtParam 请求额外信息
   * @returns {Promise} feedsCardInfoList 小说卡片对象列表
   */
  getReaderRecommendEBook(hwBookId, recommendType, requestExtParam) {
    if (process.env.NODE_ENV === 'development') { // 本地调试
      return Promise.resolve(window.$debug.recommendBooks);
    }

    const { readerExperience } = window.hwReaderApiKit
    return readerExperience.getReaderRecommendEBook(hwBookId, recommendType, requestExtParam)
  },
  /**
   * 小说跳转接口-小说卡片点击时先调用此接口
   * @param {FeedsCardInfo} feedsCardInfo 小说卡片对象
   * @returns null
   */
  clickFeedsCard(feedsCardInfo) {
    const { readerExperience } = window.hwReaderApiKit
    return readerExperience.clickFeedsCard(feedsCardInfo)
  },

  // 获取广告配置 Promise
  getAdConfig() {
    const { readerAdvertisement } = window.hwReaderApiKit;
    return readerAdvertisement.getAdConfig();
  },
  // 获取APP广告隐私开关查询入口
  getAppAdPrivacy() {
    const { readerAdvertisement } = window.hwReaderApiKit;
    return readerAdvertisement.getAppAdPrivacy();
  },
  // 查询免广激励信息
  getAdFreeInfo() {
    try {
      const { readerAdvertisement } = window.hwReaderApiKit;
      if (readerAdvertisement.getAdFreeInfo) {
        const data = readerAdvertisement.getAdFreeInfo();
        return Promise.resolve(data);
      }
      return Promise.reject('getAdFreeInfo 方法不存在')
    } catch (err) {
      return Promise.reject(err)
    }
  },
  // 更新免广激励信息
  updateAdFreeInfo(adFreeInfo) {
    const { readerAdvertisement } = window.hwReaderApiKit
    if (readerAdvertisement.updateAdFreeInfo) {
      return readerAdvertisement.updateAdFreeInfo(adFreeInfo)
    }
  },

  // 获取当前主题色
  getBackground() {
    const { readerSettings } = window.hwReaderApiKit;
    return readerSettings.getBackground();
  },
  /**
   * 设置背景色
   * @param {*} color 主题色
   */
  setBackground(color) {
    const { readerSettings } = window.hwReaderApiKit;
    return readerSettings.setBackground(color);
  },
  /**
   * 获取日夜间模式
   * @param {*} feedDisplayMode day-日间，night-夜间
   * @returns Promise
   */
  getFeedDisplayMode() {
    const { pageExperience } = window.hwReaderApiKit;
    return pageExperience.getDisplayMode();
  },
  /**
   * 设置日夜间模式
   * @param {*} mode day-日间，night-夜间
   * @returns Promise
   */
  setFeedDisplayMode(mode) {
    const { pageExperience } = window.hwReaderApiKit;
    return pageExperience.setDisplayMode({ mode });
  },
  /**
   * 设置状态栏信息
   * @param status 状态栏状态
                    immersive: 沉浸式，显示状态栏，背景透明（状态栏区域可以展示内容）默认情况下，浏览器展示为沉浸式
                    fixed: 固定显示状态，状态栏区域不可展示内容
                    hidden: 隐藏
   * @param textColor 状态栏文字颜色，light:白色，dark:黑色
   */
  setStatusBarInfo(status, textColor) {
    const { pageExperience } = window.hwReaderApiKit;
    if (status === 'hidden') {
      return pageExperience.setStatusBarInfo('hidden');
    }
    return pageExperience.setStatusBarInfo(status, textColor, false);
  },
  // 获取状态栏信息
  getStatusBarInfo() {
    const { pageExperience } = window.hwReaderApiKit;
    return pageExperience.getStatusBarInfo();
  },
  // 获取AI导航栏信息
  getAiNavigationBarInfo() {
    const { pageExperience } = window.hwReaderApiKit;
    return pageExperience.getAiNavigationBarInfo();
  },
  /*
    是否可使用信号栏的位置绘制
    True：可占用信号栏位置绘制
    False：不可占用信号栏位置绘制，如下场景返回false
    1).ROM低于9.0
    2).悬浮窗
    3).智慧分屏（说明，其它分屏返回true）
  */
  isStatusBarDrawable() {
    const { device } = window.hwReaderApiKit;
    return device.isStatusBarDrawable();
  },
  // 获取手机设备信息
  async getDeviceInfo() {
    const { device } = window.hwReaderApiKit;
    return device.getDeviceInfo();
  },
  // 获取网络信息 useCache 是否使用缓存
  async getNetworkInfo() {
    const { device } = window.hwReaderApiKit;
    return device.getDeviceNetworkInfo();
  },
  // 获取用户信息 userId
  async getUserInfo() {
    const { account } = window.hwReaderApiKit;
    return account.getUserInfo();
  },
  // 撤销骨架屏，请求章节信息和章节内容接口完成后调用
  closeSkeleton() {
    const { pageExperience } = window.hwReaderApiKit;
    return pageExperience.closeSkeleton();
  },
  // 离开阅读器
  goBack() {
    const { pageExperience } = window.hwReaderApiKit;
    return pageExperience.goBack();
  },
  // 监听系统返回
  onBack(callback) {
    const { pageExperience } = window.hwReaderApiKit;
    return pageExperience.onBack(callback);
  },
  // 取消监听系统返回
  offBack(callback) {
    const { pageExperience } = window.hwReaderApiKit;
    return pageExperience.offBack(callback);
  },

  /**
   * 数据上报
   * @param {*} caseType 事件上报原因 0: 性能统计事件上报1: 广告事件上报2: 阅读事件上报
   * @param {*} eventType 事件类型
   * @param {*} eventInfo 事件信息
   */
  commitEvent(caseType, eventType, eventInfo) {
    const { readerEventAdapter } = window.hwReaderApiKit;
    const time = new Date().getTime();
    const event = { eventType, time, eventInfo: JSON.stringify(eventInfo) };
    readerEventAdapter.commitEvent(caseType, [event]);
  },
  /**
   * 上报阅读事件
   * @param {*} eventInfo
   */
  commitReadEvent(eventInfo) {
    this.call('commitEvent', EVENT_CASE.READING, 'LPER', eventInfo);
  },
  /**
   * 上报广告事件
   * @param {*} eventType
   * @param {*} eventInfo
   */
  commitAdEvent(eventType, eventInfo) {
    this.call('commitEvent', EVENT_CASE.ADVERTISE, eventType, eventInfo);
  },
  /**
   * 上报性能事件
   * @param {*} eventInfo
   */
  commitPerformanceEvent(eventInfo) {
    this.call('commitEvent', EVENT_CASE.PERFORMANCE, 'RP', eventInfo);
  },

  /**
   * 查询用户当前登录状态
   */
  hasLogin() {
    const { account } = window.hwReaderApiKit;
    if (Object.prototype.hasOwnProperty.call(account, 'hasLogin')) {
      return account.hasLogin();
    }
    return Promise.reject('hasLogin 方法不存在');
  },

  /**
   * 拉起登录界面进行登录。
   * 注：如果账号已经登录，调用本接口直接返回成功并携带用户信息
   */
  login() {
    const { account } = window.hwReaderApiKit;
    if (Object.prototype.hasOwnProperty.call(account, 'login')) {
      return account.login();
    }
    return Promise.reject('login 方法不存在');
  },
  /**
   * 监听字体变化
  */
  onFontChanged(cb) {
    const { device } = window.hwReaderApiKit;

    if (Object.prototype.hasOwnProperty.call(device, 'onFontChanged')) {
      return device.onFontChanged(cb);
    }
    return Promise.reject('onFontChanged 方法不存在');
  },
  /**
   * 取消监听字体变化
  */
  offFontChanged(cb) {
    const { device } = window.hwReaderApiKit;

    if (Object.prototype.hasOwnProperty.call(device, 'offFontChanged')) {
      return device.offFontChanged(cb);
    }
    return Promise.reject('offFontChanged 方法不存在');
  },
};

export default jsbridge;
