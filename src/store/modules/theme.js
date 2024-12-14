import { DARK_MODE, THEMES } from '@/constants/index';
import { setThemeMode, setStatusBarInfo, getUA } from '@/utils/helpers';
import jsbridge from '@/utils/jsbridge';

// 设置全局背景色
const setBgColor = (theme) => {
  document.documentElement.style.backgroundColor = theme.paper
}
const setMode = (mode) => {
  jsbridge.call('setFeedDisplayMode', mode);

  // 鸿蒙单框机
  if (getUA().isHmArk) {
    setStatusBarInfo(mode); // 设置状态栏信息
  }
}

// 背景色、夜间模式-存 kit
const state = {
  themeData: THEMES[0],
  themeIndex: 0,
  themeList: THEMES,
  feedDisplayMode: 'day',
  feedModeText: '夜间',
};

const mutations = {
  /**
   * 设置背景色
   * @param {*} state
   * @param {*} index
   */
  setTheme(state, index) {
    // 如果是点击非暗黑模式
    const theTheme = state.themeList[index]
    if (theTheme.theme !== 'dark') {
      state.feedDisplayMode = 'day';
      state.feedModeText = '夜间'
      state.themeIndex = index;
      state.themeData = theTheme;
      setThemeMode(true);
      setBgColor(theTheme) // 设置全局背景色

      setMode('day')
      jsbridge.call('setBackground', theTheme.theme);
    } else {
      state.feedDisplayMode = 'night';
      state.feedModeText = '日间'
      state.themeData = DARK_MODE;
      setThemeMode(false);
      setBgColor(DARK_MODE) // 设置全局背景色

      setMode('night')
    }
  },
  /**
   * 设置日夜间模式
   * @param {*} state
   * @param {*} mode
   */
  setFeedDisplayMode(state, mode) {
    const themeData = mode === 'night' ? DARK_MODE : THEMES[state.themeIndex];
    state.feedDisplayMode = mode;
    state.feedModeText = mode === 'day' ? '夜间' : '日间'
    state.themeData = themeData;
    setThemeMode(mode === 'day'); // body setAttribute
    setBgColor(themeData) // 设置全局背景色

    setMode(mode)
  },
  setThemeList(state, list) {
    state.themeList = list;
  },
  setThemeIndex(state, index) {
    state.themeIndex = index;
  },
  setThemeData(state, data) {
    state.themeData = data
    // 设置全局背景色
    document.documentElement.style.backgroundColor = data.paper
  },
  setFeedMode(state, mode) {
    state.feedDisplayMode = mode
    state.feedModeText = mode === 'day' ? '夜间' : '日间'
  },
};

const actions = {
  async init(context, data) {
    const { feedMode, colorOption } = data;
    const themeList = colorOption.allColor.length > 0 ? THEMES.filter(({ theme }) => colorOption.allColor.indexOf(theme) > -1) : THEMES;
    themeList.push(DARK_MODE);
    const findIndex = THEMES.findIndex(({ theme }) => theme === colorOption.currentColor);
    const themeIndex = findIndex > -1 ? findIndex : 0;
    const themeData = feedMode === 'night' ? DARK_MODE : THEMES[themeIndex];

    context.commit('setThemeList', themeList);
    context.commit('setThemeIndex', themeIndex);
    context.commit('setThemeData', themeData);
    context.commit('setFeedMode', feedMode);
    setThemeMode(feedMode === 'day');
  }
};

// module模式可以参考：https://github.com/vuejs/vuex/tree/dev/examples/shopping-cart/store
export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

