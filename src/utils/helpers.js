import {
  getLocalDeviceInfo, setLocalDeviceInfo,
  getLocalUserInfo, setLocalUserInfo,
} from './cacheData';
import crypto from './crypto';
import jsbridge from './jsbridge';

// 获取页面真实宽高，带小数点
let pageWidth = 0;
let pageHeight = 0;
const getClient = (refresh) => {
  if (refresh || !(pageWidth > 0 && pageHeight > 0)) {
    const { width, height } = document.documentElement.getBoundingClientRect();
    pageWidth = width
    pageHeight = height
  }
  return { clientWidth: pageWidth, clientHeight: pageHeight }
}

/**
 * html编码
 * @param  {string} str 要编码的字符串
 * @return {string}     编码后的字符串
 */
const escapeHTML = str => str
  .replace(/&/g, '&amp;')
  .replace(/>/g, '&gt;')
  .replace(/</g, '&lt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

/**
 * 根据QueryString参数名称获取值
 * @param  {string} name 需要获取的参数
 * @param  {string} url 链接地址
 * @return {string}      参数的值
 */
const getQueryByName = (name, url) => {
  // 当前页面的地址
  if (!url) {
    url = location.href;
  }
  // 传了特定地址
  const qIndex = url.indexOf('?');
  if (qIndex === -1) {
    return '';
  }

  const query = url.substr(qIndex);
  const result = query.match(new RegExp(`[?&]${name}=([^&]+)`, 'i'));
  if (result === null || result.length < 1) {
    return '';
  }
  return escapeHTML(decodeURIComponent(result[1]));
};

/**
 * 数字添加千分位
 * @param {int} num 数字
 * @returns {string} 千分位数字
 */
const addThousandthSign = (num) => {
  const regForm = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g;
  return num.toString().replace(regForm, '$1,');
};

// 删除前后空格
const trim = str => str.replace(/^\s+\s+$/gm, '');
// 删除字符串中的空格和换行符
const trimAll = str => {
  if (!str) {
    return ''
  }
  return String(str).replace(/[\s\n]+/gim, '')
}

/**
 * 格式化时间 formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')
 * @param {date} time new Date()
 * @param {string} format yyyy yy,MM M,dd d,HH H,mm m, ss s,
 * @return {String}
 */
function formatDate(time, format) {
  const o = {
    'M+': time.getMonth() + 1, // 月份
    'd+': time.getDate(), // 日
    'H+': time.getHours(), // 小时
    'm+': time.getMinutes(), // 分
    's+': time.getSeconds(), // 秒
    'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
    'f+': time.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k of Object.keys(o)) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return format
}
const formatNum = (num) => {
  const result = parseFloat((Math.floor(num / 1000) / 10).toFixed(1));
  return Number.isInteger(result) ? parseInt(result, 10) : result;
};

/**
 * 用户加入阅读的x天内判定为新用户（x=0&x=1效果一致），若设备清除app数据缓存，允许新老状态重置
 * @param {*} timestamp1 用户加入阅读的时间
 * @param {*} timestamp2 当前服务端返回的时间
 * @param {*} day 新增x天内判定为新用户
 * @returns
 */
const isNewUser = (timestamp1, timestamp2, day = 0) => {
  if (timestamp1 && timestamp2) {
    // 计算两个日期之间的毫秒数差值
    const timeDiff = timestamp2 - timestamp1

    // 将毫秒数差值转换为天数
    const dayDiff = Math.floor(timeDiff / (24 * 3600 * 1000))

    // 判断天数差值是否大于等于指定的天数
    if (dayDiff >= day) {
      return false
    }
  }
  return true
}

// 动态加载script标签
const caches = {};
const loadScript = url => new Promise((resolve, reject) => {
  if (caches[url]) {
    resolve('success !');
    return;
  }
  const domScript = document.createElement('script');
  domScript.setAttribute('type', 'text/javascript');
  domScript.setAttribute('src', url);
  document.getElementsByTagName('head')[0].appendChild(domScript);
  domScript.onload = () => {
    if (
      !domScript.readyState
        || 'loaded' === domScript.readyState
        || 'complete' === domScript.readyState
    ) {
      caches[url] = true;
      resolve('success !');
    }
  };

  domScript.onerror = () => {
    reject(Error('load error!'));
  };
});

// 节流
const throttle = function (fn, delay) {
  let preTime = Date.now();
  return function () {
    const context = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    const nowTime = Date.now();
    if (nowTime - preTime >= delay) {
      preTime = nowTime;
      fn.apply(context, args);
    }
  };
};
// 函数防抖
const debounce = (fn, wait) => {
  let timer = null;
  return function () {
    const context = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    // 如果此时存在定时器的话，则取消之前的定时器重新记时
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    // 设置定时器，使事件间隔指定事件后执行
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  };
};

// 上报广告埋点
const reportAd = (reportUrl) => {
  let img = new window.Image();
  // eslint-disable-next-line no-multi-assign
  img.onload = img.onerror = function () {
    // eslint-disable-next-line no-multi-assign
    img.onload = img.onerror = null; // 销毁一些对象
    img = null;
  };
  img.src = reportUrl;
};

// 是否出现滚动条
const hasScrollbar = id => {
  const { clientHeight } = getClient()
  return document.querySelector(`#${id}`).scrollHeight > (window.innerHeight || clientHeight);
}

// 生成全球唯一标识
const generateGUID = () => {
  let d = new Date().getTime();
  const guid = 'xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx-y'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

  return guid;
};

const px2vw = (px) => {
  const { clientWidth } = getClient()
  return (px / clientWidth) * (clientWidth / 360) * 100;
};

// 常用浏览器 UA判断
const getUA = () => {
  const ua = window.navigator.userAgent.toLowerCase();
  const testUa = (regexp) => regexp.test(ua);

  // const isAndroid = testUa(/android|adr/g);
  const isIOS = testUa(/ios|iphone|ipad|ipod|iwatch/g);
  // const isMobile = isAndroid || isIOS || testUa(/mobile/g);

  // const isWeixin = testUa(/micromessenger/g);
  // const isQQ = testUa(/qqbrowser/g);

  const isHwb = testUa(/harmony/g);
  // const inPPSEnv = isHwb && testUa(/gdttangrammobsdk/g);
  const isHmArk = isHwb && testUa(/arkweb/g);
  // const isHmArk = true;
  return {
    // isAndroid, // android系统
    isIOS, // iOS系统
    // isMobile, // 移动端
    // isWeixin, // 微信浏览器
    // isQQ, // QQ浏览器
    isHwb, // 华为浏览器
    // inPPSEnv, // 华为浏览器集成pps sdk
    isHmArk, // 华为Harmony5 及后续版本所携带的 Web 内核为 ArkWeb，纯血鸿蒙 - 鸿蒙单框机
  };
};

// 判断是否是合法的 ccid 章节id
const isValidCcid = ccid => ccid !== '-1' && ccid !== '0';

// 获取sign，通过hmac sha256算法加密所得
const getSign = (timestamp, nonce) => crypto.sha256(timestamp, nonce);

// http 转 https
const toHttps = (url) => {
  if (!url) {
    return url
  }
  return url.replace(/^http:\/\//gi, 'https://')
}
// 转换bookInfo
const formatBookInfo = (bookInfo) => {
  if (!bookInfo) {
    return {};
  }

  const { name, author, finished, wordCount, introduction, categoryList, ebookLabels, cover, maxChapterIndex, maxChapterId } = bookInfo?.ebookBasicInfo || {};
  const { readUsers, score } = bookInfo?.ebookStatisticInfo || {};
  const categoryName  = categoryList.length > 0 ? categoryList[0].categoryName : '';
  const labels = ebookLabels ? JSON.parse(ebookLabels) : [];
  return {
    title: name,
    author: author.authorName,
    finished,
    wordCount,
    intro: introduction,
    categoryName,
    labels: labels || [],
    coverHttps: cover.url || '',
    score,
    readingNum: readUsers,
    lastChapter: maxChapterIndex,
    lastChapterId: maxChapterId,
  };
};

// 广告
// 异常时间差处理
const getDisTime = (time) => {
  let disTime = new Date().getTime() - time
  if (time <= 20 * 1000) {
    disTime = -3 // 异常数据
  } else {
    if (disTime <= 0) {
      disTime = -1 // 异常小数据上报 -1
    } else if (disTime >= 20 * 1000) {
      disTime = -2 // 异常超大数据上报 -2
    }
  }
  return disTime
}
// 转换时间展示
const getTransTime = (time) => {
  if (time && time > 0) {
    // 若t≤120min，则展示”xx分钟“
    if (time <= 120) {
      return {
        time: time < 1 ? 1 : Math.floor(time),
        text: '分钟'
      }
    }
    // 若120min＜t≤ 2880min（即48h），则展示“xx小时”，其中t取整数值（向下取整）
    if (time > 120 && time <= 2880) {
      return {
        time: Math.floor(time / 60),
        text: '小时'
      }
    }
    // 若2880min（即48h）＜t，则展示“xx天”，其中t取整数值（向下取整）；
    if (time > 2880) {
      return {
        time: Math.floor(time / 1440),
        text: '天'
      }
    }
  }
  return {
    time: 0,
    text: '分钟'
  }
}
// 获取凌晨4点的时间戳
const getMidnight = () => {
  const now = new Date()
  // 计算当天凌晨4点的时间
  let midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4)
  // 如果当前时间已超过4点，则设置为明天的4点
  if (now.getHours() >= 4) {
    midnight.setDate(midnight.getDate() + 1)
  }

  return midnight * 1
}
// 获取滑动方向
const getDirection = (x, y, minDis) => {
  const mX = Math.abs(x)
  const mY = Math.abs(y)
  if (mX >= mY && mX > minDis) {
    return x > 0 ? 'left' : 'right'
  }
  if (mY > mX && mY > minDis) {
    return y > 0 ? 'up' : 'down'
  }
  return '';
}
// 获取下载广告按钮信息
const getButtonInfo = (APP_STATUS, status, progress, downloadText) => {
  let button = {
    progress,
    text: '',
    enabled: true,
    interval: 0,
    order: 1
  };

  switch (status) {
    case APP_STATUS.DOWNLOAD: // 下载未开始，应用初始状态
      button = { ...button, text: '安 装', interval: 1 }
      break;
    case APP_STATUS.RESUME: // 继续下载
    case APP_STATUS.DOWNLOADING: // 下载中
      button = { ...button, text: `${progress}%` }
      break;
    case APP_STATUS.PAUSE: // 下载暂停
      button = { ...button, text: '继续', interval: 1, }
      break;
    case APP_STATUS.WAITING_FOR_WIFI: // 等待Wifi下载
    case APP_STATUS.WAITING: // 下载等待中
      button = { ...button, text: '等待中', enabled: false, interval: 10 }
      break;
    case APP_STATUS.DOWNLOADFAILED: // 下载失败
      button = { ...button, text: '下载失败', interval: 1 }
      break;
    case APP_STATUS.DOWNLOADCANCELLED: // 下载取消
      button = { ...button, progress: 0, text: '安 装', interval: 1 }
      break;
    case APP_STATUS.DOWNLOADED: // 下载成功
    case APP_STATUS.INSTALL: // 等待安装
      button = { ...button, text: '等待安装', enabled: false, interval: 10 }
      break;
    case APP_STATUS.INSTALLING: // 安装中
      button = { ...button, text: '正在安装', enabled: false }
      break;
    case APP_STATUS.INSTALLED: // 安装完成
      button = { ...button, text: downloadText, interval: 1, order: 2 }
      break;
  }
  return button
}
// 获取广告名称
const getAppName = (adData, layout) => {
  if (!adData) {
    return ''
  }

  const { app, title } = adData
  if (layout === 'horizontal') { // 横版视频/图片样式
    return title || (app && app.appDesc) || ''
  }
  if (app && app.appName) {
    return app.appName
  }
  return title || ''
}
// 获取广告描述
const getAppDesc = (adData, layout) => {
  if (!adData) {
    return ''
  }

  const { app, source } = adData
  if (layout === 'horizontal') { // 横版视频/图片样式
    return source || (app && app.appName) || ''
  }
  if (app && app.appDesc) {
    return app.appDesc
  }
  return source || ''
}
// 获取屏幕类型
const getHwScreen = (clientWidth) => {
  /*
    根据华为屏幕宽度判断类型
    手机：360×780
    折叠屏：677×763
    Pad：800×1280

    折叠屏竖：684*734
    折叠屏横：771*647
    Pad竖版：640*993
    Pad横屏：1024*609
  */
  if (clientWidth >= 599 && clientWidth < 763) {
    return 'hw_fold' // 折叠屏-竖屏
  }
  if (clientWidth >= 763 && clientWidth < 800) {
    return 'hw_fold_max' // 折叠屏-横屏
  }
  if (clientWidth >= 800 && clientWidth < 1280) {
    return 'hw_pad' // pad-竖屏
  }
  if (clientWidth >= 1280) {
    return 'hw_pad_max' // pad-横屏
  }
  return 'hw_mobile'
}
// 获取边距
const getGap = (clientWidth) => {
  return clientWidth >= 599 ? 40 : 24;
}

// toast
let toastTimer
const toast = (message) => {
  const { isHmArk } = getUA();
  const { clientWidth } = getClient()
  let minWidth; let maxWidth;
  if (clientWidth < 599) {
    minWidth = (clientWidth - 24 * 2 - 12 * 3) / 2;
    maxWidth = (clientWidth - 24 * 2 - 12 * 3)
  } else if (clientWidth >= 599 && clientWidth < 840) {
    minWidth = (clientWidth - 32 * 2 - 12 * 7) / 8 * 3;
    maxWidth = (clientWidth - 32 * 2 - 12 * 7) / 8 * 6
  } else {
    minWidth = (clientWidth - 48 * 2 - 12 * 11) / 12 * 4;
    maxWidth = (clientWidth - 48 * 2 - 12 * 11) / 12 * 8
  }
  let toastElement = document.body.querySelector('#toast');
  if (!toastElement) {
    toastElement = document.createElement('div');
    toastElement.setAttribute('id', 'toast');
    document.body.appendChild(toastElement);
  }
  if (isHmArk) {
    minWidth = 0;
    toastElement.classList.add('ark_hw_toast');
  }
  toastElement.textContent = message;
  toastElement.style.display = 'block';
  toastElement.style.minWidth = `${minWidth}px`;
  toastElement.style.maxWidth = `${maxWidth}px`;
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    toastElement.style.display = 'none';
    toastElement.textContent = '';
  }, 1500);
};
const hideToast = () => {
  const toastElement = document.body.querySelector('#toast')
  if (toastElement) {
    clearTimeout(toastTimer)
    toastElement.style.display = 'none'
    toastElement.textContent = ''
  }
}
// 获取设备信息
let deviceInfo;
if (window.$debug) {
  deviceInfo = window.$debug.deviceInfo;
}
const getDeviceInfo = async () => {
  if (deviceInfo) {
    return Promise.resolve(deviceInfo);
  }
  const localDeviceInfo = getLocalDeviceInfo();
  if (localDeviceInfo) {
    deviceInfo = localDeviceInfo
    return Promise.resolve(localDeviceInfo);
  }
  try {
    const res = await jsbridge.call('getDeviceInfo');
    if (res) {
      deviceInfo = res
      setLocalDeviceInfo(res);
    }
    return  Promise.resolve(res);
  } catch (err) {
    return Promise.resolve({});
  }
};
// 获取用户信息
const getUserInfo = async () => {
  if (window.$config.userInfo) {
    return Promise.resolve(window.$config.userInfo);
  }
  const localUserInfo = getLocalUserInfo();
  if (localUserInfo) {
    window.$config.userInfo = localUserInfo
    return Promise.resolve(localUserInfo);
  }

  try {
    const res = await jsbridge.call('getUserInfo');
    if (res) {
      window.$config.userInfo = res
      setLocalUserInfo(res)
    }
    return Promise.resolve(res);
  } catch (err) {
    return Promise.resolve({});
  }
};
// 获取网络信息
let networkInfo;
if (window.$debug) {
  networkInfo = window.$debug.networkInfo;
}
const getNetworkInfo = async (refresh = false) => {
  if (networkInfo && !refresh) {
    return Promise.resolve(networkInfo);
  }
  try {
    const res = await jsbridge.call('getNetworkInfo');
    networkInfo = res;
    return Promise.resolve(res);
  } catch (err) {
    return Promise.resolve({});
  }
};

/**
 * 设置主题模式
 * @param {*} isLight 日间模式
 */
const setThemeMode = (isLight = true) => {
  document.body.setAttribute('data-theme', isLight ? 'light' : 'dark');
};
const getTheme = async () => {
  let feedMode = 'day';
  let colorOption = {
    currentColor: '1', // 默认白色
    allColor: ['1', '2', '3', '4'],
  };
  // 获取日夜间模式和背景色
  const getBackground = jsbridge.call('getBackground');
  const getFeedDisplayMode = jsbridge.call('getFeedDisplayMode');
  try {
    const result = await getBackground
    if (result) {
      colorOption = result
    }

    const result2 = await getFeedDisplayMode
    if (result2 && result2.mode) {
      feedMode = result2.mode
    }
  } catch (err) {
    console.log(err);
  }
  return { feedMode, colorOption };
};
// 设置状态栏信息
const setStatusBarInfo = (feedDisplayMode, showTool = -1) => {
  const textColor = feedDisplayMode === 'day' ? 'dark' : 'light';
  let status = showTool ? 'immersive' : 'hidden';
  if (showTool === -1) { // 无 showTool 值
    status = window.$config.status
  } else {
    window.$config.status = status
  }
  jsbridge.call('setStatusBarInfo', status, textColor);
}

export {
  getClient,
  getQueryByName,
  addThousandthSign,
  trim,
  trimAll,
  formatDate,
  formatNum,
  isNewUser,
  loadScript,
  throttle,
  debounce,
  reportAd,
  hasScrollbar,
  generateGUID,
  px2vw,
  getUA,
  isValidCcid,
  getSign,
  toHttps,
  formatBookInfo,

  getDisTime,
  getTransTime,
  getMidnight,
  getDirection,
  getButtonInfo,
  getAppName,
  getAppDesc,
  getHwScreen,
  getGap,

  toast,
  hideToast,
  getDeviceInfo,
  getUserInfo,
  getNetworkInfo,
  setThemeMode,
  getTheme,
  setStatusBarInfo,
};
