<template>
  <div
    ref="videoWrap"
    @click.stop="adClick"
    :class="['content',layout === 'horizontal'?'horizontal':'vertical']"
    :style="{'width':videoWidth || 'auto', height:videoHeight || 'auto'}"
  >
    <div class="overlay" v-if="layout === 'vertical'"></div>
    <div class="video-wrap">
       <video
        v-if="highVersion && !videoError && isWifi"
        ref="video"
        class="media"
        :style="{height:videoHeight?`${videoHeight}px`:'auto'}"
        :src="videoInfo.url"
        :muted="isSoundMuted"
        :controls="false"
        preload="auto"
        @error="onError"
      >
      </video>
      <ImageBox v-else :style="{height:videoHeight?`${videoHeight}px`:'auto'}" class="media" :url="imgInfo.url" :width="imgInfo.width" :height="imgInfo.height" imgHeight="100%"/>
      <!-- 音量标识 -->
      <img
        v-if="layout === 'horizontal'"
        @click.stop="controlSound"
        :src="isSoundMuted===true?require('@/assets/images/guide/horizontal_sound_off.png'):require('@/assets/images/guide/horizontal_sound_on.png')"
        class="tag-sound-control"
        @contextmenu.prevent
      />
      <div
        v-if="layout === 'horizontal' && !autoplay"
        class="video-duration"
      >
        <span class="duration">{{Time}}</span>
      </div>
      <img
        class="play-btn"
        v-if="!autoplay || !highVersion || videoError"
        src="@/assets/images/video_play.png"
        @contextmenu.prevent
      />
    </div>
    <native-footer
      :layout="layout"
      :isAppDownload="isAppDownload"
      :isLockAd="isLockAd"
      :adData="adData"
      :isSoundMuted="isSoundMuted"
      :nativeAd="nativeAd"
      :isVideo="true"
      :clientResize="clientResize"
      @adClose="onAdClose"
      @adClick="adClick"
      @adClickReport="adClickReport"
      @setAdStatus="setAdStatus"
      @controlSound="controlSound"
    />
  </div>
</template>

<script>
import NativeFooter from '../native-footer';
import ImageBox from '@/components/ImageBox';
import { getDeviceInfo, getNetworkInfo } from '@/utils/helpers';

export default {
  name: 'Video',
  components: {
    NativeFooter,
    ImageBox,
  },
  props: {
    adType: {
      type: String,
      default: 'Native',
    },
    adData: {
      type: Object,
      default: () => {},
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
      default: () => {},
    },
    adInView: {
      type: Boolean,
      default: false,
    },
    clientResize: {
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
      autoplay: true,
      highVersion: false,
      isSoundMuted: true, // 音量开关，默认静音播放
      videoError: false,
      isWifi: false,
      videoWidth: 0,
      videoHeight: 0,
    };
  },
  computed: {
    videoInfo() {
      if (this.adData && this.adData.video) {
        return this.adData.video;
      }
      return {};
    },
    imgInfo() {
      if (this.adData && this.adData.imgList && this.adData.imgList.length > 0) {
        return this.adData.imgList[0];
      }
      return {};
    },
    layout() {
      return this.videoInfo.ratio > 1 ? 'horizontal' : 'vertical';
    },
    Time() {
      let time = '00:00';
      const duration = parseInt(this.videoInfo.duration / 1000, 10);
      let m = parseInt(duration / 60, 10);
      let s = parseInt(duration % 60, 10);
      m < 10 ? m = `0${m}` : `${m}`;
      s < 10 ? s = `0${s}` : `${s}`;
      time = `${m}:${s}`;
      return time;
    },
  },
  watch: {
    adInView(show) {
      if (show && this.$refs.video) {
        this.show()
      } else {
        this.$refs.video && this.$refs.video.pause();
      }
    },
    // 屏幕尺寸变化时，静音视频
    clientResize: {
      handler() {
        setTimeout(() => {
          this.isSoundMuted = true;
        }, 100);
      },
      immediate: true,
    },
    innerHeight() {
      this.setVideoHeight()
    }
  },

  mounted() {
    this.compareVersion('13.0.1.300');
    this.setNetworkType();
    this.setVideoHeight();
    if (this.adType === 'Banner') {
      this.show()
    }
  },

  methods: {
    async show() {
      if (this.$refs.video) {
        try {
          const { type } = await getNetworkInfo(true)
          if (type !== '1') {
            this.autoplay = false;
          } else {
            this.autoplay = true;
            this.$refs.video.play();
            console.log('play:++++++');
          }
        } catch (err) {
          this.autoplay = false;
        }
      }
    },
    onError() {
      this.videoError = true;
    },
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
    // 是否静音播放
    controlSound() {
      this.isSoundMuted = !this.isSoundMuted;
    },
    // 比较版本号，当前浏览器版本号大于'13.0.1.300'时，加载视频自动播放，否则是加载图片
    async compareVersion(targetVersion) {
      try {
        const { browserVersion } = await getDeviceInfo();
        const arrCurrent = browserVersion.split('.');
        const arrTarget = targetVersion.split('.');

        const currentNum = parseInt(arrCurrent[0], 10) * 100000
          + parseInt(arrCurrent[1], 10) * 10000
          + parseInt(arrCurrent[2], 10) * 1000
          + parseInt(arrCurrent[3], 10);
        const targetNum = parseInt(arrTarget[0], 10) * 100000
          + parseInt(arrTarget[1], 10) * 10000
          + parseInt(arrTarget[2], 10) * 1000
           + parseInt(arrTarget[3], 10);
        this.highVersion = currentNum >= targetNum;
      } catch (err) {
        this.highVersion = false;
      }
    },
    // 设置网络状态
    async setNetworkType() {
      try {
        const { type } = await getNetworkInfo(true)
        this.isWifi = type === '1';
      } catch (err) {
        this.isWifi = false;
      }
      this.autoplay = this.isWifi;
    },
    setVideoHeight() {
      if (this.layout === 'vertical') {
        this.videoHeight = Math.min(this.innerHeight, 512);
        this.videoWidth = this.videoHeight * this.videoInfo.ratio || this.videoHeight;
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.overlay{
  position: absolute;
  left: 0%;
  right: 0%;
  top: 50%;
  bottom: 0%;
  height: 50%;
  @include grad-angle(180deg, rgba(0, 0, 0, 0.0001), rgba(0, 0, 0, 0.402644));
  border-radius: 0px 0px 8px 8px;
  z-index: 1;
}
.content{
  flex:1;
  position: relative;
  // background: var(--color-ad-bg);
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto;
}
.horizontal{
  padding-bottom: 12px;
  .video-wrap{
    @include mediaScreen('hw_mobile'){
      width: 100%;
    }
    @include mediaScreen('hw_fold'){
      .media{
        width: 562px;
      }
    }
    @include mediaScreen('hw_pad'){
      .media{
        width: 608px;
      }
    }
  }
}
.vertical{
  @include mediaScreen('hw_mobile'){
    width: 100%;
  }
  @include mediaScreen('hw_fold'){
    width: 312px;
  }
  @include mediaScreen('hw_pad'){
    width: 349px;
  }
}
.video-wrap{
  position: relative;
  .play-btn{
      position: absolute;
      top: 0;
      left: 0;
      right:0;
      bottom:0;
      width: 40px;
      height:40px;
      margin: auto;
  }
  .tag-sound-control{
    width: 28px;
    height: 28px;
    position: absolute;
    bottom: 12px;
    left: 12px;
  }
  .media {
      width: 100%;
      background: var(--color-button-border);
      object-fit: cover;
  }
  .video-duration {
    position: absolute;
    bottom: 4px;
    right: 0;
    margin: 4px;
    padding: 2px 5px;
    background: rgba(0,0,0,0.3);
    mix-blend-mode: normal;
    border-radius: 4px;
    .duration {
      color: #fff;
      font-weight: 400;
      @include fontSize(10px);
      @include lineHeight(13px);
    }
  }
}
</style>
