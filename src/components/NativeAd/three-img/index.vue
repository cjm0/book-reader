<template>
  <div @click.stop="adClick" class="content" id="img">
    <div class="img-wrap">
      <div v-for="(item, index) in imgList" :key="index" class="img-item" :style="{ width: imgWidth, height: imgHeight }">
        <ImageBox class="img" :url="item.url" imgHeight="100%" />
      </div>
    </div>
    <native-footer
      :isAppDownload="isAppDownload"
      :isLockAd="isLockAd"
      :adData="adData"
      :nativeAd="nativeAd"
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
import { getClient } from '@/utils/helpers';

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
      imgWidth: 0,
      imgHeight: 0,
    };
  },
  computed: {
    imgList() {
      if (this.adData && this.adData.imgList && this.adData.imgList.length > 0) {
        return this.adData.imgList;
      }
      return '';
    },
  },

  mounted() {
    this.setImgSize();
    window.addEventListener('resize', this.setImgSize);
  },

  methods: {
    onAdClose(keywords) {
      this.$emit('onAdClose', keywords);
    },
    setImgSize() {
      const { clientWidth } = getClient()
      this.imgWidth = (clientWidth - 52) / 3;
      this.imgHeight = this.imgWidth / 4 * 3;
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
  width: fit-content;
  // background: var(--color-ad-bg);
  border-radius: 8px;
  padding-bottom: 12px;
  overflow: hidden;
  margin: 0 auto;

  .img-wrap {
    display: flex;
    overflow: hidden;

    .img-item {
      overflow: hidden;

      @include mediaScreen('hw_fold') {
        width: 186px !important;
        height: 139px !important
      }

      @include mediaScreen('hw_pad') {
        width: 186px !important;
        height: 139px !important;
      }

      &:not(:first-child) {
        margin-left: 2px;
      }

      .img {
        height: 100%;
        background: var(--color-button-border);
      }
    }
  }

}
</style>
