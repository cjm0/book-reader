import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
import { LOGIN_DIALOG_ACTIVATE_TYPE } from '@/constants';
import { nativeLoginKit } from '@/utils/login';

export const loginMixin = {
  computed: {
    ...mapState('login', ['hasLogin']),
    ...mapGetters(['isHmArk']),
  },
  methods: {
    ...mapActions('login', ['checkLoginState']),
    ...mapMutations('login', ['SET_LOGIN_DIALOG_VISIBLE', 'SET_ACTIVATE_TYPE']),
    async beforeAddShelfCheck() {
      if (!this.isHmArk) return;
      // 调用hasLogin接口判断是否登录
      await this.checkLoginState();
      if (!this.hasLogin) {
        this.SET_ACTIVATE_TYPE(LOGIN_DIALOG_ACTIVATE_TYPE.ADDSHELF);
        // this.SET_LOGIN_DIALOG_VISIBLE(true);
        await nativeLoginKit();
        return Promise.reject('noLogin');
      }
    },
  },
};
