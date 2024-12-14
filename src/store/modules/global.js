import { read as cacheData } from '@/utils/cacheData';
import { getUA } from '@/utils/helpers';

const autoAddBook = cacheData.getAutoAddBook() || 1;
const state = {
  /*
    functionswitch url 控制开关：11110010NNNN
    popBfWin url popBfWin 配大于 0，阅读满 x 页自动弹出书架提示
    quadrant 通过 url 匹配到的 amis 广告配置组件（A、B、C、D 等）
    chapterId 外部传入的章节 id：跳指定章节
    readerVersion=v1 走灰度环境代码
    hwbid 书籍 id-华为
   */
  data: {}, // url 参数
  pageStatus: 'visible', // 页面显隐
  autoAddBook, // 是否自动加书架：1 打开、-1 关闭-存本地
  isHmArk: getUA().isHmArk // 鸿蒙单框机
};

const mutations = {
  setGlobalData(state, data) {
    data.popBfWin = data.popBfWin ? Number(data.popBfWin) : 0
    state.data = data
  },
  setPageStatus(state, pageStatus) {
    state.pageStatus = pageStatus
  },
  setAutoAddBook(state, bool) {
    cacheData.setAutoAddBook(bool)
    state.autoAddBook = bool
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};