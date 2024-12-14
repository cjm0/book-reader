// ajax请求模块
import axios from 'axios';
import qs from 'query-string';
import store from '@/store';
import { REQUEST_ERROR_TIPS } from '@/constants';
import { generateGUID, getDeviceInfo, getNetworkInfo, getSign, getUserInfo } from '@/utils/helpers';
import {
  setBaseLog, getBaseLog,
  setReportLog, getReportLog,
  setReportAdLog, getReportAdLog,
  setReportTimeLog, getReportTimeLog,
} from '@/utils/cacheData';

const whiteList = [
  '/browser/huawei/common/reportPageEvent', // 单条上报-暂未使用
  '/browser/huawei/common/batch/reportPageEvent', // 混合批量上报
  '/browser/huawei/common/reportReadTime', // 阅读时长上报
  '/browser/huawei/common/adInfo', // 广告上报-1120版本合并到 reportPageEvent 里面上报
  '/browser/huawei/chapter/content', // 章节内容
];
const pending = []; // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识
const cancelToken = axios.CancelToken;
const removePending = (ever) => {
  pending.forEach((obj) => {
    // console.log(ever);
    if (obj.u === `${ever.url}&${ever.method}` && !whiteList.includes(ever.url)) {
      // 当当前请求在数组中存在时执行函数体
      obj.f(); // 执行取消操作
      pending.splice(obj, 1); // 把这条记录从数组中移除
    }
  });
};
// create an axios instance
const service = axios.create({
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000, // request timeout
  baseURL: process.env.VUE_APP_SERVER_HOST || '',
  headers: {
    accept: '*/*',
    'Content-Type': 'application/json',
  },
});
// 请求拦截器
service.interceptors.request.use((config) => {
  const { method, data } = config;
  const isGetMethod = method.toLowerCase() === 'get';
  if (isGetMethod && !config.params) {
    // eslint-disable-next-line no-param-reassign
    config.params = {};
  }
  const body = isGetMethod ? config.params : data;
  const nonce = generateGUID();
  const timestamp = Math.floor(new Date().getTime() / 1000);
  body.timestamp = timestamp;
  body.nonce = nonce;
  body.sign = getSign(timestamp, nonce);

  removePending(config); // 在一个ajax发送前执行一下取消操作
  // eslint-disable-next-line new-cap
  config.cancelToken = new cancelToken((c) => {
    // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
    pending.push({ u: `${config.url}&${config.method}`, f: c });
  });
  return config;
});
// 响应拦截器
service.interceptors.response.use(
  // 成功
  (response) => {
    removePending(response.config); // 在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
    const res = response.data || {};
    // 操作成功
    if (res.code === 0) {
      return Promise.resolve(res.data);
    }
    // 除埋点上报接口外，接口失败上报异常事件
    const resUrl = response.config.url
    if (!resUrl.includes('reportPageEvent') && !resUrl.includes('reportReadTime') && !resUrl.includes('adInfo') && !resUrl.includes('chapter/content')) {
      logUserBehavior({
        eventId: 'reader_Abnormal_shown',
        eventCode: 'shown',
        eventInfo: {
          ext1: 1,
          ext2: resUrl,
          ext3: res.code,
          ext4: res.msg,
        },
      });
    }
    // 后端操作失败
    return Promise.reject(res);
  },
  // 失败
  (error) => {
    if (error.message === undefined) {
      return;
    }
    let errInfo = error && error.response && error.response.data ? error.response.data : {};

    if (typeof errInfo === 'string') {
      errInfo = { msg: REQUEST_ERROR_TIPS.server.msg };
    }
    if (!errInfo.msg) {
      errInfo.msg = REQUEST_ERROR_TIPS.network.msg;
    }
    return Promise.reject(errInfo);
  },
);
const request = {
  get: (url, params) => service.get(url, {
    params,
    paramsSerializer: params => qs.stringify(params),
  }),
  post: (url, data) => service.post(url, data),
  put: (url, data) => service.post(url, data),
  delete: url => service.delete(url),
};

// 埋点上报
let datas = [] // 混合数据-批量上报
let adDatas = [] // 广告单独接口上报-批量上报
let timeDatas = [] // 阅读时长单独接口上报-批量上报
const noBatchEventId = [''] // reader_wholePage_shown 阅读曝光上报-不走批量标识
/*
const adEventId = ['reader_ad_', 'reader_render_ad_', 'reader_videoText_'] // 广告上报标识
const isAdEvent = (eventId) => { // 判断是否广告上报
  let tag = false
  adEventId.forEach(val => {
    if (eventId.includes(val)) {
      tag = true
    }
  })
  return tag
}
*/
const timer = {
  default: null,
  ad: null,
  time: null,
}
const timerFn = (type) => { // 间隔 5 分钟清空 1 次数据-计时上报
  clearTimeout(timer[type])
  timer[type] = setTimeout(() => {
    postBatch(false, type)
  }, 5 * 60 * 1000)
}
const postBatch = (limit = true, type) => { // 批量上报
  const maxNum = type === 'time' ? window.$config.reportTime : window.$config.reportPage // 累积 n 个再上报
  const num = limit ? maxNum : 1

  if (limit) {
    timerFn(type)
  }

  // 批量上报把公共字段提出来
  const baseLog = window.$config.baseLog || getBaseLog('baseLog')
  if (type === 'ad') { // 广告
    if (adDatas.length >= num) {
      request.post(whiteList[3], { baseLog, data: adDatas.splice(0, limit ? num : adDatas.length) }).catch(() => { })
    }
    setReportAdLog(adDatas) // 更新缓存数据
    return
  }
  if (type === 'time') { // 阅读时长
    if (timeDatas.length >= num) {
      request.post(whiteList[2], { baseLog, data: timeDatas.splice(0, limit ? num : timeDatas.length) }).catch(() => { })
    }
    setReportTimeLog(timeDatas)
    return
  }
  if (datas.length >= num) { // 混合数据
    request.post(whiteList[1], { baseLog, data: datas.splice(0, limit ? num : datas.length) }).catch(() => { })
  }
  setReportLog(datas)
}
const logUserBehavior = async (params = {}, batch = true) => {
  try {
    // 清空数据
    if (!params && batch) {
      // 进入页面第1时间上报遗留数据
      if (batch === 'all') {
        datas = getReportLog() || []
        adDatas = getReportAdLog() || []
        timeDatas = getReportTimeLog() || []
      }

      // 未传数据直接调批量上传 logUserBehavior(null)
      // 页面隐藏、离开阅读器、销毁前前立马上报，不够也上报
      postBatch(false, 'default')
      postBatch(false, 'ad')
      postBatch(false, 'time')
      return
    }

    const { eventCode, eventId, eventInfo } = params;
    const { spm, reqid, cbid } = store.state.global.data;
    const userInfo = await getUserInfo();
    const { browserVersion, osVersion, brand, model } = await getDeviceInfo();
    const { type } = await getNetworkInfo();
    const timestamp = new Date().getTime();
    const baseLog = {
      did: cbid, // 阅文书籍 id
      pn: 'reader', // 页面名称
      from_scence: spm, // 渠道来源
      user_id: userInfo?.userId || 'yw', // 用户 id
      brand: brand || '', // 设备品牌
      model: model || '', // 设备型号
      net_status: type || '0', // 网络 1-没有网络 0-移动网络 1-wifi
      version: browserVersion || '', // 浏览器版本号，例如13.0.1.300
      os_version: osVersion, // 操作系统版本号
      yd_version: process.env.VUE_APP_VERSION, // 阅文 H5 版本
      ab_test: window.$config.ab_test, // 功能测试，公共字段
      is_new: window.$config.userState, // 0-老用户，1-当天新增，2-昨天新增，3-前天新增，以此类推
      quadrant: window.$config.quadrant, // 匹配到的 amis 广告配置组件（A、B、C、D 等）
      guid: window.$config.guid, // 传给后端用的
      is_gray: window.$config.isGray, // 是否灰度用户
    }
    const options = Object.assign(
      {
        is_reward: window.$config.isReward, // 是否激励免广状态
        dis: timestamp.toString(),
      },
      eventInfo || {},
    );
    delete options.reportUrl;
    if (!eventId) {
      console.log('非法上报：eventId 不存在');
      return
    }

    // 数据批量上报
    let reportData = {
      eventId,
      eventCode,
      eventInfo: JSON.stringify(options),
      extEventId: reqid,
    }
    if (batch && !noBatchEventId.includes(eventId)) {
      // 批量上报把公共字段提出来
      window.$config.baseLog = baseLog
      setBaseLog(baseLog)

      /*
      // 广告-1120版本广告上报合入总上报
      if (isAdEvent(eventId)) {
        adDatas.push(reportData)
        postBatch(true, 'ad')
        return
      }
      */
      // 阅读时长批量上报
      if (eventId === 'reader_read_time') {
        timeDatas.push(reportData)
        postBatch(true, 'time')
        return
      }
      // 混合数据批量上报
      datas.push(reportData)
      postBatch(true, 'default')
      return
    }

    // 单条数据上报
    reportData.eventInfo = JSON.stringify(Object.assign(baseLog, options))
    request.post(whiteList[0], reportData).catch(() => { });
  } catch (err) {
    console.error('logUserBehavior', err);
  }
};

export {
  request,
  logUserBehavior,
}