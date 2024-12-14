import {
  getStatusBarHeight, setStatusBarHeight,
  getNavigationBarHeight, setNavigationBarHeight,
} from '@/utils/cacheData';
import jsbridge from '@/utils/jsbridge';

// 系统导航条高度
const state = {
  height: 0, // 系统状态栏dp高度
  crumbHeight: 56, // 顶部菜单栏高度
  navigationHeight: 0 // 底部 AI 导航条高度
}

const mutations = {
  setStatusBarHeight(state, height) {
    state.height = height;
  },
  setNavigationBarHeight(state, height) {
    state.navigationHeight = height;
  },
}

const actions = {
  async getStatusBarInfo(context) { // 获取状态栏dp高度
    const theHeight = getStatusBarHeight();
    if (theHeight) {
      context.commit('setStatusBarHeight', theHeight);
    } else {
      try {
        const { heightDp } = await jsbridge.call('getStatusBarInfo');
        setStatusBarHeight(heightDp);
        context.commit('setStatusBarHeight', heightDp);
      } catch (err) {
        console.log(err);
      }
    }
  },
  async getAiNavigationBarInfo(context) { // 获取AI导航条高度
    const theHeight = getNavigationBarHeight();
    if (theHeight) {
      context.commit('setNavigationBarHeight', theHeight);
    } else {
      try {
        const { height } = await jsbridge.call('getAiNavigationBarInfo');
        setNavigationBarHeight(height);
        context.commit('setNavigationBarHeight', height);
      } catch (err) {
        console.log(err);
      }
    }
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

