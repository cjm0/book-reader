import { getChapterList } from '@/api/read';

// 目录
const state = {
  list: [], // 目录列表
  loading: 0,
};

const mutations = {
  setCatalogList(state, list) {
    state.list = list;
  },
  setLoading(state, isLoading) {
    state.loading = isLoading;
  },
};

const actions = {
  async getCatalogList(context, cbid) {
    if (context.state.list.length <= 0) {
      try {
        const { chapterList } = await getChapterList(cbid);
        if (chapterList && chapterList.length > 0) {
          context.commit('setCatalogList', chapterList)
        }
        context.commit('setLoading', 2)
      } catch (err) {
        console.log(err);
        context.commit('setLoading', 1)
      }
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

