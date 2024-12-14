<!--
 * @Description : 激励下载广告-下载按钮 DownButtom
 * @Author      : chenjianmin
 * @Date        : 2023-12-12 15:07:24
-->
<template>
  <div
    :class="[
      'down_buttom_index',
      isDark && 'down_buttom_dark',
      isDisable ? `down_buttom_disable_${isDark?'dark':'light'}` : '',
      isProgress ? `down_buttom_downing_${isDark?'dark':'light'}` : '',
    ]"
    @click.stop="handleAction"
  >
    <span class="button">{{ button.text }}</span>
    <p v-if="isProgress" class="button_downing" :style="{width: `${progress}%`}"></p>
    <img
      class="ad_cancel"
      :src="require('@/assets/images/ad-down/ad_cancel.png')"
      @click.stop="handleCancel"
      @contextmenu.prevent
      v-if="btnType !== 'dialog' && isPaused"
    />
  </div>
</template>

<script>
import { APP_STATUS } from '@/constants';
import { toast, getNetworkInfo } from '@/utils/helpers';

export default {
  name: 'DownButtom',
  props: {
    nativeAd: {
      type: Object,
      default: () => {},
    },
    adData: {
      type: Object,
      default: () => {},
    },
    theme: {
      type: Object,
      default: () => {},
    },
    btnType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      clickTag: false, // 控制按钮点击上报频率
    };
  },
  computed: {
    isDark() {
      return this.theme.theme === 'dark'
    },
    progress() {
      return this.adData.button.progress
    },
    status() {
      return this.adData.button.status
    },
    button() {
      return this.adData.button
    },
    isDownloading() {
      return this.status === APP_STATUS.DOWNLOADING || this.status === APP_STATUS.RESUME
    },
    isPaused() {
      return this.status === APP_STATUS.PAUSE;
    },
    isProgress() {
      return (this.isPaused || this.isDownloading) && this.progress >= 0
    },
    isDisable() {
      return !this.button.enabled || (this.isDownloading && this.progress === 100)
    },
  },

  methods: {
    handleAction() { // 处理按钮点击事件
      if (!this.button.enabled) {
        return
      }
      // 控制按钮点击上报频率
      if (this.clickTag) {
        return
      }
      this.clickTag = true
      setTimeout(() => {
        this.clickTag = false
      }, 300)

      // 下载广告被点击
      this.$emit('clickDownAd')

      const { adId } = this.adData
      switch (this.status) {
        case APP_STATUS.DOWNLOAD:
        case APP_STATUS.DOWNLOADFAILED:
        case APP_STATUS.DOWNLOADCANCELLED:
          this.$emit('reportDownAd', 1)
          this.nativeAd.startDownload({ adId }).then(this.downloadError) // 开始下载接口
          break;
        case APP_STATUS.DOWNLOADING:
          this.nativeAd.pauseDownload({ adId }) // 暂停下载接口
          break;
        case APP_STATUS.PAUSE:
          this.$emit('reportDownAd', 1)
          this.nativeAd.resumeDownload({ adId }).then(this.downloadError) // 重启下载接口
          break;
        case APP_STATUS.INSTALLED: // 安装完成
          this.$emit('reportDownAd', 7)
          this.$emit('onReward')
          this.nativeAd.startDownload({ adId }) // 点击打开
          break;
      }
    },
    handleCancel() { // 取消下载
      const { adId } = this.adData
      this.nativeAd.cancelDownload({ adId }) // 取消下载接口
    },
    async downloadError(code) { // 处理下载失败的场景
      const { type } = await getNetworkInfo(true)
      if (type === '-1') { // 无网络走广告 sdk 的提示
        return
      }
      if (code === -1) {
        toast('参数错误，下载失败')
        return
      }
      if (code === -2) {
        toast('无下载权限')
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.down_buttom_index{
  position: relative;
  width: 66px;
  height: 28px;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(270deg, #805534 0%, #AB8262 100%);
  transition: background-color 0.15s;
  .button {
    font-weight: 500;
    @include fontSize(14px);
    @include lineHeight(20px);
    color: #fff;
  }
}
.down_buttom_dark{
  .button{
    color: rgba(255, 255, 255, 0.78);
  }
}

.down_buttom_disable_light{
  background: rgba(173, 112, 39, 0.2);
  .button{
    color: #fff;
  }
}
.down_buttom_disable_dark{
  background: rgba(173, 112, 39, 0.2);
  .button{
    color: rgba(255, 255, 255, 0.4);
  }
}

.down_buttom_downing_light{
  background: rgba(173, 112, 39, 0.2);
  .button{
    color: #785123;
  }
}
.down_buttom_downing_dark{
  background: rgba(173, 112, 39, 0.2);
  .button{
    color: rgba(255, 255, 255, 0.78);
  }
}
.button_downing{
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: rgba(173, 112, 39, 0.2);
}
.ad_cancel{
  position: absolute;
  right: 4px;
  top: 9px;
  width: 10px;
  height: 10px;
}

</style>
