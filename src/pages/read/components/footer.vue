<template>
  <div
    :class="['footer_index', isDark && 'footer_index_dark']"
    :style="{ bottom: (controlBottomAd.show ? bootmAdHeight - 1 + navigationHeight : 0) + 'px' }"
  >
    <div class="wrap">
      <div class="left">
        <div class="electric" v-show="getElectric">
          <svg-icon :icon-class="`electric_${getElectric}`" class="img"/>
        </div>
        <span>{{timeFormat}}</span>
      </div>
      <div>{{getProgress}}%</div>
      <div class="tip" v-if="downAdBar.type" @click.stop="showDialog">{{ getDownText }}</div>
      <div class="tip_dialog" v-if="downAdBar.type === 'open' && downAdBar.bubble">这里还有免广权益未领取</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getTransTime, formatDate } from '@/utils/helpers';
import { logUserBehavior } from '@/service';
let reportNum = 0 // 1-免广权益生效中 2-应用下载安装中 3-应用已经安装

export default {
  name: 'Footer',
  props: {
    cid: { // 章节序号
      type: Number,
      default: 0,
    },
    bookInfo: {
      type: Object,
      default: null,
    },
    maxChapterIndex: {
      type: Number,
      default: 1,
    },
    theme: {
      type: Object,
      default: () => {},
    },
    bootmAdHeight: { // 固底广告高度
      type: Number,
      default: 0,
    },
    controlBottomAd: {
      type: Object,
      default: () => {},
    },
    downAdConfig: { // 激励下载广告配置
      type: Object,
      default: () => {},
    },
    downAdBar: { // 激励下载管理栏控制
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      electric: 100, // 不支持 navigator.getBattery 就不展示电池电量
      time: new Date(),
      // timer: null,
    };
  },
  computed: {
    ...mapGetters(['navigationHeight']),
    isDark() {
      return this.theme.theme === 'dark'
    },
    timeFormat() {
      return formatDate(this.time, 'HH:mm')
    },
    getElectric() {
      let status = '';
      const electric = Math.floor(this.electric * 10);
      switch (electric) {
        case 0: case 1: case 2:
          status = 20;
          break;
        case 3: case 4:
          status = 40;
          break;
        case 5: case 6:
          status = 60;
          break;
        case 7: case 8:
          status = 80;
          break;
        case 9: case 10:
          status = 100;
          break;
      }
      return status;
    },
    getProgress() {
      const allList = this.maxChapterIndex
      if (this.cid && allList && allList >= this.cid) {
        return (this.cid / allList * 100).toFixed(1);
      }
      return 0;
    },
    getDownText() {
      switch (this.downAdBar.type) {
        case 'reward':
          reportNum = 1
          return '免广权益生效中';
        case 'down':
          reportNum = 2
          return '应用下载安装中';
        case 'open': {
          reportNum = 3
          const configTime = this.downAdConfig?.time || 0; // 免广时间
          const getTimeText = getTransTime(configTime)
          return `应用已安装，打开免广告${getTimeText.time}${getTimeText.text}`;
        }
      }
      return ''
    }
  },

  mounted() {
    this.countTime();
    this.getDevicePower();
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },

  methods: {
    countTime() { // 计算当前时间
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.time = new Date();
        this.countTime();
      }, 10 * 1000);
    },
    getDevicePower() { // 获取电量
      if (window.navigator.getBattery) {
        window.navigator.getBattery().then((battery) => {
          this.electric = battery.level
          battery.onlevelchange = () => {
            this.electric = battery.level
          }
        })
      }
    },
    showDialog() { // 出弹窗-激励下载广告
      if (this.downAdBar.type === 'reward') {
        this.$emit('setDownDialog', {
          showDialog: true, // 弹窗弹出
          dialogType: 'active', // 权益生效中弹窗
        })
      } else {
        this.$emit('setDownDialog', {
          showDialog: true, // 弹窗弹出
          dialogType: 'list', // 应用列表弹窗
        })
      }
      if (reportNum) {
        logUserBehavior({
          eventId: 'reader_bottom_textLink_clicked',
          eventCode: 'clicked',
          eventInfo: {
            ext1: reportNum,
          },
        })
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.footer_index{
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 36px;
  .wrap{
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 24px 12px;
    @include fontSize(12px);
    @include lineHeight(12px);
    color: var(--color-text-disabled);
  }

  .left{
    display: flex;
    align-items: center;
  }
  .electric{
    padding: 2px;
    margin-right: 4px;
    .img {
      width: 18px;
      height: 8px;
    }
  }

  .tip{
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px 8px;
    border-radius: 10px;
    background-color: rgba(173, 112, 39, 0.15);

    @include fontSize(10px);
    @include lineHeight(12px);
    color: #AD7027;
    white-space: nowrap;
  }
  .tip_dialog{
    position: absolute;
    left: 50%;
    top: -46px;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 44px;
    padding: 0 16px;
    border-radius: 16px;
    background-color: #FFF;

    font-weight: 500;
    @include fontSize(14px);
    @include lineHeight(20px);
    color: rgba(0, 0, 0, 0.9);
    white-space: nowrap;

    &::after{
      content: '';
      position: absolute;
      left: 50%;
      bottom: -7px;
      transform: translateX(-50%);
      width: 34px;
      height: 7px;
      background: url('@/assets/images/ad-down/icon-arrow.png') 0 0 no-repeat;
      background-size: 100%;
    }
  }
}
.footer_index_dark{
  .tip_dialog{
    background-color: #202224;
    color: rgba(255, 255, 255, 0.78);
    &::after{
      background: url('@/assets/images/ad-down/icon-arrow-dark.png') 0 0 no-repeat;
      background-size: 100%;
    }
  }
}
</style>
