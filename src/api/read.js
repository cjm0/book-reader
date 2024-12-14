import { request } from '@/service';

/**
 * 获取章节全部信息
 * @param {string} cbid	 作品ID
 * @param {string} ccid	 章节ID
 * @returns {Promise} promise对象
 */
export const getChapter = param => request.post('/browser/huawei/chapter/content', param);

/**
 * 获取作品信息
 * @param {string} cbid 作品id
 * @returns {Promise} promise对象
 */
// https://yapi.yuewen.com/project/2035/interface/api/84046
export const getBookInfo = param => request.post('/browser/huawei/book/info', param);

/**
 * 获取书目录
 * @param {string} cbid	 作品ID
 * @returns {Promise} promise对象
 */
export const getChapterList = cbid => request.post('/browser/huawei/chapter/list', {
  cbid,
});

/**
 * 获取阅文测广告配置
 * @returns {Promise} promise对象
 */
export const getYwAdConfig = (cbid) => request.post(`/browser/huawei/adConfig?cbid=${cbid}`, {});
// export const getYwAdConfig2 = () => request.post('/browser/huawei/ad/config', {});

/**
 * 获取服务器时间，单位 s
 * @returns {Promise} promise对象
 */
export const getTimeInfo = () => request.post('/browser/huawei/now/info', {});
