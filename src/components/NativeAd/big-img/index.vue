<template>
  <div
    ref="bigImg"
    @click.stop="adClick"
    :class="['content', layout === 'vertical' && 'vertical']"
    :style="{ width: size, height: size }"
  >
    <div class="overlay" v-if="layout === 'vertical'"></div>
    <ImageBox class="img" :url="imgInfo.url" :width="imgInfo.width" :height="imgInfo.height" />
    <native-footer
      :isAppDownload="isAppDownload"
      :isLockAd="isLockAd"
      :adData="adData"
      :nativeAd="nativeAd"
      :layout="layout"
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
import ImageBox from '../../ImageBox';
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
    innerWidth: {
      type: Number,
      default: 0,
    },
    innerHeight: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      imgLoadError: false,
      resetStyle: false,
      size: 'auto',
    };
  },
  computed: {
    imgInfo() {
      if (this.adData && this.adData.imgList && this.adData.imgList.length > 0) {
        return this.adData.imgList[0];
      }
      return {};
    },
    layout() {
      const { width, height } = this.imgInfo;
      return width > height ? 'horizontal' : 'vertical';
    },
  },
  watch: {
    innerHeight() {
      this.setInnerSize()
    },
    innerWidth() {
      this.setInnerSize()
    }
  },

  mounted() {
    this.setInnerSize();
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
    onError() {
      this.imgLoadError = true;
    },
    setInnerSize() {
      if (this.layout === 'vertical') {
        this.size = Math.min(Math.min(this.innerWidth, this.innerHeight), 500) || 'auto';
      }
    },
  },

};
</script>
<style lang="scss" scoped>
.overlay {
  position: absolute;
  left: 0%;
  right: 0%;
  top: 50%;
  bottom: 0;
  height: 50%;
  @include grad-angle(180deg, rgba(0, 0, 0, 0.0001), rgba(0, 0, 0, 0.402644));
  border-radius: 0px 0px 8px 8px;
  z-index: 1;
}

.content {
  // background: var(--color-ad-bg);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  padding-bottom: 12px;
  margin: 0 auto;
  flex: 1;

  .img {
    width: 100%;
    background: var(--color-button-border);
  }

  .placeholder {
    width: 100%;
    height: 200px;
    background: var(--color-button-border);
  }

  @include mediaScreen('hw_mobile') {
    .img {
      width: 100%;
    }
  }

  @include mediaScreen('hw_fold') {
    .img {
      max-width: 562px;
    }
  }

  @include mediaScreen('hw_pad') {
    .img {
      max-width: 708px;
    }
  }
}

.vertical {
  position: relative;
  padding: 0;
  overflow: hidden;
  display: flex;
  align-items: center;

  .img {
    width: 100%;
    height: auto;
    margin-top: 0;
    background: var(--color-button-border);
  }

  @include mediaScreen('hw_mobile') {
    width: 100%
  }

  @include mediaScreen('hw_fold') {
    .img {
      max-width: 562px;
    }
  }

  @include mediaScreen('hw_pad') {
    .img {
      max-width: 708px;
    }
  }
}</style>
