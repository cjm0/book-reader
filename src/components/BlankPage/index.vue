<template>
  <div :class="['blank', show && 'show']" :style="{ backgroundColor: theme.paper }" @click="handerClick">
    <Topbar :show="true" :showRight="false" @handlerClick="preventClick" @goBack="goBack"/>
    <svg-icon icon-class="blank" :class="[isDark ? 'blank-icon-dark' : 'blank-icon']"/>
    <span class="blank-txt">{{Text}}</span>
  </div>
</template>

<script>
import Topbar from '../Topbar';
import { mapGetters } from 'vuex';

import jsbridge from '@/utils/jsbridge';
import { logUserBehavior } from '@/service';

export default {
  name: 'BlankPage',
  components: {
    Topbar,
  },
  props: {
    show: { // 是否展示
      type: Boolean,
      default: false,
    },
    showTool: { // 是否可点击出菜单栏
      type: Boolean,
      default: false,
    },
    type: { // 错误码类型
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
  },
  computed: {
    ...mapGetters(['theme']),
    isDark() {
      return this.theme.theme === 'dark'
    },
    Text() {
      let text = '';
      if (this.message) {
        return this.message;
      }
      switch (this.type) {
        case 'loading': // kit 进度获取失败
          text = '加载失败，点击重试';
          break;
        case 'error': // 章节下架，请求目录失败
          text = '您访问的页面出错了';
          break;
        case 'none': // 404
          text = '您访问的页面不存在';
          break;
        case 'offline': // App 组件
          text = '网络异常，请稍后再试';
          break;
      }
      return text;
    },
  },
  data() {
    return {
      ableClick: true, // 是否可点击
    }
  },

  mounted() {
    if (this.show) {
      logUserBehavior({
        eventId: 'reader_network_anomaly_shown',
        eventCode: 'shown',
        eventInfo: {
          /*
            loading - 加载失败，点击重试
            error - 您访问的页面出错了
            none - 您访问的页面不存在
            offline - 网络异常，请稍后再试
           */
          ext1: this.type,
          ext2: this.Text
        },
      })
    }
  },

  methods: {
    preventClick() {
      this.ableClick = false
    },
    handerClick() {
      if (!this.ableClick) { // 阻止点击
        this.ableClick = true
        return
      }
      if (this.showTool) { // 出菜单栏
        this.$emit('setTool')
        return
      }
      if (this.type === 'loading') { // 点击刷新重试
        logUserBehavior({
          eventId: 'reader_network_anomaly_clicked',
          eventCode: 'clicked',
          eventInfo: {
            ext1: this.type,
            ext2: this.message
          },
        })
        this.$emit('setReload')
      }
    },
    async goBack() {
      try {
        await jsbridge.call('goBack');
      } catch (err) {
        history.back();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>