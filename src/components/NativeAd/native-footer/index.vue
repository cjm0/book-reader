<template>
  <div>
    <!-- 横版视频/图片样式 -->
    <div v-if="layout === 'horizontal'" class="horizontal">
      <div class="horizontal-title" v-if="!hideTitle">{{ adName }}</div>
      <div class="footer">
        <div class="left">
          <span>{{ adDesc }}</span>
          <span class="ad-tag-bottom">广告</span>
        </div>
        <div class="right">
          <span
            v-if="isAppDownload"
            @click.stop="handleAction"
            class="button"
            :style="{
              opacity: button.enabled ? 1 : 0.4,
              color: theme.activePaper,
            }"
          >{{ (isDownloading ? `已下载 ` : '') + button.text }}</span>
          <span v-else class="button" :style="{ color: theme.activePaper }">{{adData.clickBtnTxt || '查看详情'}}</span>
          <div @click.stop="closeAd" class="close" id="close">
            <svg-icon class="popup-img" icon-class="colon"/>
          </div>
        </div>
      </div>
    </div>

    <div v-if="layout === 'vertical'">
      <template v-if="isAppDownload">
        <!-- 竖版图片样式 -->
        <div class="vertical-img" v-if="!isVideo">
          <ImageBox :url="adData.app.iconUrl" class="icon" imgHeight="40"/>
          <div class="content">
            <span class="app-name">{{ adName }}</span>
            <span class="app-desc">{{ adDesc }}</span>
          </div>
          <div
            @click.stop="handleAction"
            :class="[
              'button-horizontal-sm',
              isDownloading || isPaused
                ? 'downloading-sm'
                : !button.enabled
                ? 'disabled'
                : '',
            ]"
          >
            <div
              v-if="isDownloading || isPaused"
              class="progress"
              :style="{ width: progress + '%' }"
            ></div>
            <span class="btn-text">{{ button.text }}</span>
          </div>
        </div>
        <!-- 竖版视频样式--应用下载推广 -->
        <div v-else class="vertical-video">
          <span class="app-name">{{ adName }}</span>
          <span class="app-desc">{{ adDesc }}</span>
          <div
            @click.stop="handleAction"
            :class="[
              'button-horizontal',
              isDownloading || isPaused
                ? 'downloading'
                : !button.enabled
                ? 'disabled'
                : '',
            ]"
          >
            <div
              v-if="isDownloading || isPaused"
              class="progress"
              :style="{ width: progress + '%' }"
            ></div>
            <span class="btn-text">{{ button.text }}</span>
          </div>
        </div>
      </template>
      <!-- 竖版视频广告样式--网页推广或应用促活 -->
      <div class="vertical-info" v-else>
        <span class="ad-source">{{ adDesc }}</span>
        <span class="ad-title">{{ adName }}</span>
        <div class="button-horizontal" v-if="adData.clickBtnTxt">
          <span class="btn-text">{{ adData.clickBtnTxt }}</span>
        </div>
      </div>
      <!-- 音量标识 -->
      <img
        v-if="isVideo"
        :src="isSoundMuted===true?require('@/assets/images/guide/sound_off.png'):require('@/assets/images/guide/sound_on.png')"
        class="ad-tag-top-sound"
        @contextmenu.prevent
        @click.stop="controlSound"
      />
      <!-- 广告标识 -->
      <img
        src="@/assets/images/ad-tag.png"
        id="close"
        class="ad-tag-top"
        @contextmenu.prevent
        @click.stop="closeAd"
      />
    </div>
    <!-- 负反馈弹窗 -->
    <close-popup
      :show="showPopup"
      :words="adData.keywords"
      :clientResize="clientResize"
      :maxWidth="maxWidth"
      :offsetTop="Top"
      :offsetRight="Right"
      :offsetPosition="Position"
      :offsetHorizontalPosition="IsHorizontalCenter"
      @closepopup="closePopup"
      @cancelpopup="cancelPopup"
    >
    </close-popup>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import { APP_STATUS } from '@/constants';
import { getClient, toast, getAppName, getAppDesc } from '@/utils/helpers';
import ImageBox from '@/components/ImageBox'

export default {
  name: 'NativeFooter',
  components: {
    ImageBox,
    ClosePopup: () => import('../close-popup'),
  },
  props: {
    adData: {
      type: Object,
      default: () => {},
    },
    nativeAd: {
      type: Object,
      default: () => {},
    },
    layout: {
      type: String,
      default: 'horizontal',
    },
    isAppDownload: {
      type: Boolean,
      default: true,
    },
    isLockAd: {
      type: Boolean,
      default: false,
    },
    isVideo: {
      type: Boolean,
      default: false,
    },
    hideTitle: {
      type: Boolean,
      default: false,
    },
    // 音量开关，默认静音播放
    isSoundMuted: {
      type: Boolean,
      default: true,
    },
    clientResize: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      status: APP_STATUS.DOWNLOAD,
      progress: 0,
      showPopup: false,
      maxWidth: 0,
      Top: 0,
      Right: 0,
      Position: 'bottom',
      IsHorizontalCenter: false,
      clickTag: false, // 控制按钮点击上报频率
    };
  },
  computed: {
    ...mapGetters(['theme', 'controlLockAd']),
    button() {
      let button = {
        text: '',
        enabled: true,
      };
      const downloadText = this.adData.interactionType === 3 ? this.adData.clickBtnTxt : '进入应用';

      switch (this.status) {
        case APP_STATUS.DOWNLOAD:
          button = { text: '下载安装', enabled: true };
          break;
        case APP_STATUS.RESUME:
        case APP_STATUS.DOWNLOADING:
          button = { text: `${this.progress}%`, enabled: true };
          break;
        case APP_STATUS.PAUSE:
          button = { text: '继续', enabled: true };
          break;
        case APP_STATUS.WAITING_FOR_WIFI:
        case APP_STATUS.WAITING:
          button = { text: '下载等待中', enabled: false };
          break;
        case APP_STATUS.DOWNLOADFAILED:
          button = { text: '下载安装', enabled: true };
          break;
        case APP_STATUS.DOWNLOADCANCELLED:
          button = { text: '下载失败', enabled: true };
          break;
        case APP_STATUS.DOWNLOADED:
        case APP_STATUS.INSTALL:
          button = { text: '等待安装', enabled: false };
          break;
        case APP_STATUS.INSTALLING:
          button = { text: '正在安装', enabled: false };
          break;
        case APP_STATUS.INSTALLED:
          button = { text: downloadText, enabled: true };
          break;
      }

      // 下载按钮状态传出去
      this.$emit('setAdStatus', button)

      return button;
    },
    isDownloading() {
      return this.status === APP_STATUS.DOWNLOADING;
    },
    isPaused() {
      return this.status === APP_STATUS.PAUSE;
    },
    adName() {
      return getAppName(this.adData, this.layout)
    },
    adDesc() {
      return getAppDesc(this.adData, this.layout)
    },
  },

  mounted() {
    this.nativeAd.onStatusChanged(this.onStatusChanged);
    this.nativeAd.onDownloadProgress(this.onDownloadProgress);
    this.getAppStatus();
  },
  methods: {
    // 监听app状态变化
    onStatusChanged({ status, packageName }) {
      console.log('++++++++++++status change', status);
      if (this.adData.app && packageName === this.adData.app.packageName) {
        this.status = status;
      }
    },
    // 监听下载进度变化
    onDownloadProgress({ progress, packageName }) {
      console.log('++++++++++++progress change', progress);
      if (this.adData.app && packageName === this.adData.app.packageName) {
        this.progress = progress;
      }
    },
    // 获取app的状态
    async getAppStatus() {
      try {
        const status = await this.nativeAd.getAppStatus({
          adId: this.adData.adId,
        });
        console.log('++++++++++++app status', status, this.adData);
        this.status = status;
      } catch (err) {
        // console.log(err)
      }
    },
    // 处理按钮点击事件
    handleAction() {
      if (!this.button.enabled) {
        return;
      }
      // 控制按钮点击上报频率
      if (this.clickTag) {
        return
      }
      this.clickTag = true
      setTimeout(() => {
        this.clickTag = false
      }, 300)

      this.$emit('adClickReport');

      const { adId } = this.adData;
      switch (this.status) {
        case APP_STATUS.DOWNLOAD:
        case APP_STATUS.DOWNLOADFAILED:
        case APP_STATUS.DOWNLOADCANCELLED:
          this.progress = 0;
          this.nativeAd.startDownload({ adId }).then(this.downloadError);
          break;
        case APP_STATUS.DOWNLOADING:
          this.nativeAd.pauseDownload({ adId });
          break;
        case APP_STATUS.PAUSE:
          this.nativeAd.resumeDownload({ adId }).then(this.downloadError);
          break;
        case APP_STATUS.INSTALLED:
          this.nativeAd.startDownload({ adId });
          break;
      }
    },
    // 处理下载失败的场景
    downloadError(code) {
      if (code === -1) {
        toast('参数错误，下载失败');
      }
      if (code === -2) {
        toast('无下载权限');
      }
    },
    // 控制是否静音播放
    controlSound() {
      this.$emit('controlSound');
    },
    // 关闭广告
    closeAd(e) {
      // 锁章状态屏蔽当前插页广告的负反馈-锁章
      if (this.controlLockAd.lockIng && this.isLockAd) {
        return
      }
      // 无反馈字段不弹负反馈
      if (!this.adData.keywords || this.adData.keywords.length < 1) {
        return
      }

      this.getClosePosition(e.target);
      this.showPopup = true;
    },
    // 点击反馈
    closePopup(keyWords) {
      toast('已反馈');
      this.showPopup = false;
      this.$emit('adClose', keyWords);
    },
    // 关闭反馈弹窗
    cancelPopup() {
      this.showPopup = false;
    },
    // 获取负反馈按钮位置
    getClosePosition(dom) {
      const { clientWidth, clientHeight } = getClient()
      const el = dom.getBoundingClientRect(); // 获取点击对象

      this.maxWidth = el.right - 6

      // 计算负反馈弹窗水平位置 距离右侧最小距离为6px
      this.Right =        clientWidth - el.right + el.width / 2 - 33 / 2 > 6
        ? clientWidth - el.right + el.width / 2 - 33 / 2
        : 6;

      // 如果该按钮距离底部位置过低，则负反馈弹窗在按钮上面展示
      this.Position = el.y - clientHeight / 2 >= 0 ? 'top' : 'bottom';

      // 获取反馈按钮是否在页面水平位置中间
      this.IsHorizontalCenter =        (el.left + el.right) / 2 / clientWidth > 1 / 3
        && (el.left + el.right) / 2 / clientWidth <= 2 / 3;

      // 计算负反馈弹窗竖向位置
      this.Top =        this.Position === 'bottom'
        ? el.y + el.height + 10
        : clientHeight - el.y + 6;
      // console.log('===========', el, this.Position, clientWidth);
    },
  },
};
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
