<template>
  <div @click.stop="adClick" class="content" id="smallImg">
    <div class="box">
      <div class="title">{{ adName }}</div>
      <ImageBox class="img" :url="imgUrl" imgHeight="100%" />
    </div>
    <native-footer
      :isAppDownload="isAppDownload"
      :isLockAd="isLockAd"
      :adData="adData"
      :nativeAd="nativeAd"
      :hideTitle="true"
      :clientResize="clientResize"
      @adClose="onAdClose"
      @adClick="adClick"
      @adClickReport="adClickReport"
      @setAdStatus="setAdStatus"
    />
  </div>
</template>

<script>
import NativeFooter from '../native-footer';
import ImageBox from '@/components/ImageBox';
import { getAppName } from '@/utils/helpers';

export default {
  name: 'BigImg',
  components: {
    NativeFooter,
    ImageBox,
  },
  props: {
    adData: {
      type: Object,
      default: () => { },
    },
    isAppDownload: {
      type: Boolean,
      default: false,
    },
    isLockAd: {
      type: Boolean,
      default: false,
    },
    nativeAd: {
      type: Object,
      default: () => { },
    },
    clientResize: { // 屏幕宽高发生变化
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
    };
  },
  computed: {
    imgUrl() {
      if (this.adData && this.adData.imgList && this.adData.imgList.length > 0) {
        return this.adData.imgList[0].url;
      }
      return '';
    },
    adName() {
      return getAppName(this.adData, 'horizontal')
    },
  },

  methods: {
    onAdClose(keywords) {
      this.$emit('onAdClose', keywords);
    },
    adClick() {
      this.$emit('clickAd');
    },
    adClickReport() {
      this.$emit('adClickReport');
    },
    setAdStatus(button) {
      this.$emit('setAdStatus', button)
    },
  },
};
</script>
<style lang="scss" scoped>
.content {
  // background: var(--color-ad-bg);
  border-radius: 8px;
  padding: 12px 0;
  margin: 0 auto;
  width: calc(100vw - 48px);

  @include mediaScreen('hw_fold') {
    width: 562px;
  }

  @include mediaScreen('hw_pad') {
    width: 708px;
  }

  .box {
    display: flex;
    padding: 0 12px;

    .title {
      flex: 1;
      line-height: 1.5;
      @include fontSize(16px);
      color: var(--color-text-primary);
    }

    .img {
      width: 102px;
      height: 76px;
      margin-left: 12px;
      border-radius: 4px;
      background: var(--color-button-border);
      overflow: hidden;

      @include mediaScreen('hw_fold') {
        width: 186px;
        height: 139px
      }

      @include mediaScreen('hw_pad') {
        width: 186px;
        height: 139px;
      }
    }
  }
}
</style>
