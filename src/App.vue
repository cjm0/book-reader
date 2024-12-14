<template>
  <div id="app" :style="{ backgroundColor: theme.paper }">
    <router-view v-if="!offLine" />
    <BlankPage v-if="offLine" :show="offLine" type="offline"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { setSessionId } from '@/utils/cacheData';
import indexedDB from '@/utils/indexedDB';
import { generateGUID, getTheme, getNetworkInfo  } from '@/utils/helpers';
import jsbridge from '@/utils/jsbridge';

const gray = 'readerVersion'
export default {
  name: 'Apps',
  components: {
    BlankPage: import('@/components/BlankPage'),
  },
  data() {
    return {
      offLine: false,
    };
  },
  computed: {
    ...mapGetters(['theme', 'isHmArk']),
  },

  created() {
    window.$config.pageTime = new Date() * 1

    // 防止网站被 iframe 嵌套使用
    if (window !== top) {
      top.location.href = window.location.href
    }

    // 获取 url 参数
    this.setGlobalData(this.$route)

    const sessionId = generateGUID()
    setSessionId(sessionId)

    this.initJsbridge() // 耗时 22ms 左右
    this.getNetworkInfo()
    indexedDB.initConfig()
  },
  mounted() {
    this.vuexActions();
    this.setRootFontSize();
    // jsbridge.call('setStatusBarInfo', 'hidden');
    this.setFlingTracker()
    this.registerServiceWorker()
  },
  destroyed() {
    jsbridge.call('offFontChanged', () => {});
  },

  methods: {
    vuexActions() {
      this.$store.dispatch('login/checkLoginState'); // 进来就判断是否登录，影响LoginDialog组件的显示
      this.$store.dispatch('adConfig/getYwAdConfig', this.$route);
      this.$store.dispatch('statusBar/getStatusBarInfo');
      this.$store.dispatch('statusBar/getAiNavigationBarInfo');
      this.$store.dispatch('adConfig/getAdConfig');
      this.$store.dispatch('adConfig/getAdPrivacy');
    },
    setGlobalData(route) {
      if (this.$route.name === 'Read') {
        const data = { ...route.query, ...route.params };
        this.$store.commit('global/setGlobalData', data);
      }
      if (location.href.includes(gray)) {
        window.$config.isGray = true
      }
    },
    async initJsbridge() {
      try {
        await jsbridge.call('init');
      } catch (err) {
        console.log('initJsbridge', err);
      }
    },
    async getNetworkInfo() { // 获取网络状态
      try {
        const { type } = await getNetworkInfo(true)
        this.offLine = type === '-1';
        if (this.offLine) {
          const { feedMode, colorOption } = await getTheme();
          // 初始化主题及背景色
          this.$store.dispatch('theme/init', { feedMode, colorOption });
        }
      } catch (err) {
        console.log(err);
      }
    },
    setRootFontSize() { // 设置字号大小相对于标准字号的比率
      const bodyStyle = window.getComputedStyle(document.querySelector('#read_body'), null);
      this.onFontChanges();
      const fontSize = parseFloat(bodyStyle['font-size'].replace('px', ''));
      const fontSizeRatio = (fontSize / 16).toFixed(2);
      window.document.body.setAttribute('data-font-ratio', fontSizeRatio);
      this.$store.commit('fontSize/setFontSizeRatio', fontSizeRatio);
      console.log(333, 'setRootFontSize', fontSizeRatio)
    },
    onFontChanges() {
      if (this.isHmArk) {
        jsbridge.call('onFontChanged', (data) => {
          console.log('fontChangeCB', data);
          // TODO: 字体大小变化后，重新加载页面
          window.location.reload();
        });
      }
    },
    setFlingTracker() { // 设置内核滚动速度
      if (window.flingTracker) {
        window.flingTracker.maxVelocityX = 4000
        window.flingTracker.maxVelocityY = 4000
        window.flingTracker.friction = 0.015
      }
    },
    registerServiceWorker() { // 注册 serviceWorker
      if ('serviceWorker' in navigator) {
        // 当页面加载完成时，创建一个 serviceWorker，
        // 为什么在 onload 后加载：https://web.dev/service-workers-registration
        window.addEventListener('load', () => {
          // scope 参数是可选的，可以用来指定你想让 service worker 控制的内容的子目录。
          // './' 当前目录，默认值 '/' 根网域下的所有内容
          // readerVersion=vxxx 用作版本灰度标识
          const tag = location.href.includes(gray) ? `?${gray}` : ''
          window.navigator.serviceWorker.register('../serviceWorker.js' + tag, { scope: './' })
            .then((registration) => { // 注册成功
              console.log('serviceWorker register success with scope: ', registration.scope)
            })
            .catch((err) => { // 注册失败
              console.error('serviceWorker register fail: ', err);
            });
        })
      } else {
        console.error('serviceWorker 不支持')
      }
    },
  },
};
</script>
<style scoped>
@import '~@/assets/styles/reset.scss';
@import '~@/assets/styles/theme.scss';

#app {
  width: 100vw;
  min-height: 100vh;
}
</style>
