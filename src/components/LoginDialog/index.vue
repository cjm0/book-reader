<template>
  <!-- 这里改为弹华为侧登录引导弹窗，故直接将renderDom改为false，无需再渲染此此组件dom部分 -->
  <van-overlay
    :show="loginDialogVisible"
    @click="onClickMask"
    z-index="1100"
    :custom-style="{
      'background-color': isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)',
    }"
    v-if="false"
  >
    <div class="login_dialog_wrap">
      <div class="block" :style="{backgroundColor: isDark ? '': theme.bg}">
        <!-- <div class="closebtn" @click="onClose">
          <svg-icon icon-class="close" :class="['close', isDark && 'close-dark']" />
        </div> -->
        <div class="content_area">
          <div class="title">是否登录华为账号？</div>
          <span class="tips">请登录华为账号，实时同步阅读进度，追书不愁。</span>
        </div>
        <div class="btn_area">
          <div class="btn cancel" @click="onClose">取消</div>
          <div class="btn_line"></div>
          <div class="btn confirm" @click="onConfirm">登录</div>
        </div>
      </div>
    </div>
  </van-overlay>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import { nativeLoginKit } from '@/utils/login';
import { loginMixin } from '@/mixins/login';
import { LOGIN_DIALOG_ACTIVATE_TYPE } from '@/constants'
import { logUserBehavior } from '@/service';

export default {
  name: 'LoginDialog',
  mixins: [loginMixin],
  data() {
    return {
      timer: null,
      renderDom: false,
      elapsedTime: 0, // 单位毫秒
    };
  },
  created() {
    console.log('%c ==================', 'color: red; background-color: yellow;');
  },
  methods: {
    ...mapMutations('login', ['SET_LOGIN_DIALOG_VISIBLE', 'SET_ACTIVATE_TYPE']),
    onClickMask() {
      // this.onClose();
    },
    async onShow() {
      // 这里改为弹华为侧登录引导弹窗，故直接将this.SET_LOGIN_DIALOG_VISIBLE(true)改为await nativeLoginKit()拉起华为侧登录
      // this.SET_LOGIN_DIALOG_VISIBLE(true);
      logUserBehavior({
        eventId: 'reader_guestlogin_shown',
        eventCode: 'shown',
        eventInfo: {
          ext2: this.activateType,
        },
      });
      await nativeLoginKit();
    },
    onClose() {
        this.SET_LOGIN_DIALOG_VISIBLE(false);
        logUserBehavior({
          eventId: 'reader_guestlogin_no_clicked',
          eventCode: 'clicked',
          eventInfo: {
            ext2: this.activateType,
          },
        });
        this.clearTimer();
    },
    async onConfirm() {
        this.SET_LOGIN_DIALOG_VISIBLE(false);
        logUserBehavior({
          eventId: 'reader_guestlogin_yes_clicked',
          eventCode: 'clicked',
          eventInfo: {
            ext2: this.activateType,
          },
        });
        this.clearTimer();
        await nativeLoginKit();
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    },
    startTimer(duration) {
      this.elapsedTime = 0; // 初始化已消耗时间
      this.SET_ACTIVATE_TYPE(LOGIN_DIALOG_ACTIVATE_TYPE.ENTRE);
      this.timer = setTimeout(() => {
        this.onShow();
      }, duration);
      this.startTime = Date.now(); // 记录开始时间
    },
    pauseTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
        this.elapsedTime += Date.now() - this.startTime;
      }
    },
    resumeTimer() {
      const remainingTime = this.loginPopwinReadpage * 1000 - this.elapsedTime;
      if (remainingTime > 0) {
        this.startTime = Date.now(); // 重置开始时间
        this.timer = setTimeout(() => {
          this.onShow();
        }, remainingTime);
      }
    },
  },
  computed: {
    ...mapState('login', ['hasLogin', 'loginDialogVisible', 'activateType']),
    ...mapGetters(['theme', 'loginPopwinReadpage', 'pageStatus']),
    isDark() {
      return this.theme.theme === 'dark';
    },
  },
  watch: {
    // loginPopwinReadpage(val) {
    //   if (this.isHmArk && val > 0 && !this.hasLogin) { // 鸿蒙单框机 && 配置 > 0 && 未登录
    //     this.renderDom = true;
    //     this.clearTimer();
    //     this.startTimer(val * 300);
    //   }
    // },
    hasLogin(val) {
      if (this.loginPopwinReadpage > 0 && !val) { // 鸿蒙单框机 && 配置 > 0 && 未登录
        this.renderDom = true;
        this.clearTimer();
        this.startTimer(this.loginPopwinReadpage * 1000);
      }
    },
    async pageStatus(val) {
      if (val === 'hide') {
        this.pauseTimer();
      } else if (val === 'visible') {
        await this.$store.dispatch('login/checkLoginState');
        if (this.hasLogin) {
          this.renderDom = false;
          this.clearTimer();
          return;
        }
        this.resumeTimer();
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.login_dialog_wrap {
  display: flex;
  position: absolute;
  width: 100vw;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 16px;

  @include mediaScreen('hw_fold') {
    width: 410px;
  }
  @include mediaScreen('hw_pad') {
    width: 500px;
  }

  .block {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 12px 16px 16px;
    background-color: var(--color-addbookshelf-bg);
    backdrop-filter: var(--color-addbookshelf-filter);
    border-radius: 32px;
    width: 100%;
    position: relative;
    overflow: hidden;

    /* .closebtn {
      position: absolute;
      right: 0;
      top: 0;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;

      .close {
        width: 24px;
        height: 24px;
      }

      .close-dark {
        color: #fff;
      }
    } */

    .content_area {
      display: flex;
      align-items: center;
      flex-direction: column;

      .title {
        color: var(--color-text-logintitle);
        font-weight: bold;
        font-size: 20px;
        line-height: 32px;
        padding-bottom: 12px;
      }

      .tips {
        color: var(--color-text-primary);
        font-weight: 400;
        font-size: 16px;
        line-height: 1.4;
        margin: 0 8px;
      }
    }

    .btn_area {
      display: flex;
      justify-content: space-evenly;
      text-align: center;
      align-items: center;
      width: 100%;
      margin-top: 8px;

      .btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 22px;
        line-height: 22px;
        font-size: 16px;
        font-weight: 500;
        padding: 20px;

        &:active {
          border-radius: 40px;
          background: var(--color-button-line);
        }
      }

      .btn_line {
        width: 0.5px;
        height: 24px;
        background: var(--color-button-line);
      }

      .confirm {
        margin: 0 0 0 8px;
        color: var(--color-theme);
      }

      .cancel {
        margin: 0 8px 0 0;
        color: var(--color-theme);
      }
    }
  }
}
</style>
