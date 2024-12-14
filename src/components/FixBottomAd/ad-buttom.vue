<!--
 * @Description : 固底广告 AdButtom
 * @Author      : chenjianmin
 * @Date        : 2023-02-06 14:50:26
-->
<template>
  <div
    class='ad_buttom_index'
    :class="[
      !isDisable ? 'ad_buttom_able' : '',
      isProgress ? 'ad_buttom_downing' : '',
    ]"
    :style="{opacity: isDisable ? 0.4 : 1}"
    @click.stop="handleAction"
  >
    <span v-if="isAppDownload" class="button">{{ button.text }}</span>
    <span v-else class="button">{{adData.clickBtnTxt || '查看详情'}}</span>
    <p v-if="isProgress" class="button_downing" :style="{width: `${progress}%`}"></p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { APP_STATUS } from '@/constants';
import { toast, getButtonInfo } from '@/utils/helpers';

export default {
  name: 'AdButtom',
  props: {
    nativeAd: {
      type: Object,
      default: () => {},
    },
    adData: {
      type: Object,
      default: () => {},
    },
    isAppDownload: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      status: APP_STATUS.DOWNLOAD,
      progress: 0,
      clickTag: false, // 控制按钮点击上报频率
    };
  },
  computed: {
    ...mapGetters(['theme']),
    button() {
      const downloadText = this.adData.interactionType === 3 ? this.adData.clickBtnTxt : '进入应用';
      let button = getButtonInfo(APP_STATUS, this.status, this.progress, downloadText)
      button.status = this.status
      this.$emit('setAdStatus', button) // 是否可更新广告
      return button;
    },
    isDownloading() {
      return this.status === APP_STATUS.DOWNLOADING || this.status === APP_STATUS.RESUME
    },
    isPaused() {
      return this.status === APP_STATUS.PAUSE;
    },
    isProgress() {
      return (this.isPaused || this.isDownloading) && this.progress > 0
    },
    isDisable() {
      return !this.button.enabled || (this.isDownloading && this.progress === 100)
    }
  },

  mounted() {
    this.nativeAd.onStatusChanged(this.onStatusChanged);
    this.nativeAd.onDownloadProgress(this.onDownloadProgress);
    this.getAppStatus();

    /*
    this.status = 'DOWNLOADING'
    this.timer = setInterval(() => {
      this.progress += 1
      if (this.progress >= 100) {
        clearInterval(this.timer)
        // this.progress = 100

        // setTimeout(() => {
        //   this.status = 'DOWNLOADED';
        // }, 300)

        // setTimeout(() => {
        //   this.status = 'INSTALLING';
        // }, 500)
      }
    }, 50)
    */
  },
  methods: {
    // 监听app状态变化
    onStatusChanged({ status, packageName }) {
      console.log('固底广告+++status change', status);
      if (this.adData.app && packageName === this.adData.app.packageName) {
        this.status = status;
      }
    },
    // 监听下载进度变化
    onDownloadProgress({ progress, packageName }) {
      console.log('固底广告+++progress change', progress);
      if (this.adData.app && packageName === this.adData.app.packageName) {
        this.progress = progress;
      }
    },
    // 获取app的状态
    async getAppStatus() {
      try {
        const status = await this.nativeAd.getAppStatus({
          adId: this.adData.adId
        });
        this.status = status;
        console.log('固底广告+++app status', status, this.adData);
      } catch (err) {
        // console.log(err)
      }
    },
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

      // 非下载广告直接触发外部点击不再往下执行
      if (!this.isAppDownload) {
        this.$emit('adClick')
        return
      }
      // 下载广告被点击
      this.$emit('adClickDownLoad')

      const { adId } = this.adData
      switch (this.status) {
        case APP_STATUS.DOWNLOAD:
        case APP_STATUS.DOWNLOADFAILED:
        case APP_STATUS.DOWNLOADCANCELLED:
          this.progress = 0;
          this.nativeAd.startDownload({ adId }).then(this.downloadError) // 开始下载接口
          break;
        case APP_STATUS.DOWNLOADING:
          this.nativeAd.pauseDownload({ adId }) // 暂停下载接口
          break;
        case APP_STATUS.PAUSE:
          this.nativeAd.resumeDownload({ adId }).then(this.downloadError) // 重启下载接口
          break;
        case APP_STATUS.INSTALLED:
          this.nativeAd.startDownload({ adId }) // 开始下载接口
          break;
      }
    },
    downloadError(code) { // 处理下载失败的场景
      if (code === -1) {
        toast('参数错误，下载失败');
      }
      if (code === -2) {
        toast('无下载权限');
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.ad_buttom_index{
  position: relative;
  width: 64px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 28px;
  overflow: hidden;
  background-color: var(--color-button-border);
  transition: background-color 0.15s;
  .button {
    @include fontSize(12px);
    font-weight: 500;
    color: var(--color-6);
  }
}
.ad_buttom_able{
  &:active{
    background-color: var(--color-button-line);
  }
}

.ad_buttom_downing{
  background-color: rgba(255,255,255, 0.06);
  outline: 1px solid rgba(37,79,247, 0.2);
}
.button_downing{
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: rgba(10, 89, 247, 0.2);
}
</style>
