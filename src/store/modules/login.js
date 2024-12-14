import { checkLoginKit } from '@/utils/login';
// function mockAsyncFn() {
//   let callCount = 0; // 用于跟踪调用次数

//   return function simulateAsyncFunction() {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         if (callCount === 0) {
//           resolve(false);
//         } else {
//           resolve(true);
//         }
//         callCount = callCount + 1;
//       }, 300);
//     });
//   };
// }
// const mockLoginRes = mockAsyncFn();

export default {
  namespaced: true,
  state: {
    hasLogin: null, // 登录状态，有且只有鸿蒙单框机才能登录, 初始值为null，在loginDialog组件中watch监听值变化后再继续相关操作
    loginDialogVisible: false, // 登录模态框显隐
    activateType: '', // 激活类型:【进入阅读器场景】1/【主动加书架场景】0
  },

  actions: {
    async checkLoginState({ commit }) {
      const bool = await checkLoginKit();
      commit('SET_HAS_LOGIN', bool);
    },
  },
  mutations: {
    SET_HAS_LOGIN(state, bool) {
      state.hasLogin = bool;
    },
    SET_LOGIN_DIALOG_VISIBLE(state, bool) {
      state.loginDialogVisible = bool;
    },
    SET_ACTIVATE_TYPE(state, type) {
      state.activateType = type;
    },
  },
};
