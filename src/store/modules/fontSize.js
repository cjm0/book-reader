import { read as cacheData } from '@/utils/cacheData';

const fontSizeLevel = cacheData.getFontSizeLevel();
const lineHeightLevel = cacheData.getLineHeightLevel();
// 字号、行高
const state = {
  fontSizeLevel, // 正文文字大小，默认第 5 级，24 号字-存本地
  ratio: 1,
  lineHeightLevel, // 行高，默认第 2 级，2 倍行高-存本地
};

const mutations = {
  setFontSizeLevel(state, level) {
    cacheData.setFontSizeLevel(level);
    state.fontSizeLevel = level;
  },
  setFontSizeRatio(state, ratio) {
    state.ratio = ratio;
  },
  setLineHeightLevel(state, level) {
    cacheData.setLineHeightLevel(level);
    state.lineHeightLevel = level;
  },
};

const actions = {

};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

