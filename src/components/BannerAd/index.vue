<!-- 公告页广告 -->

<template>
  <div
    :class="['ad_banner_index', animation && 'ad_banner_animation', `ad_banner_${theme.theme}`]"
    :style="{
      backgroundColor: theme.paper,
      padding: `${40+tipHeight}px 24px ${isFeiyebanner?40:90}px`,
      transform: `translateX(${pageOffset.x}px) translateY(${pageOffset.y}px)`
      }"
    @touchstart.stop="touchStartWrap"
    @touchmove.stop="touchMoveWrap"
    @touchend.stop="touchEndWrap"
    @touchcancel="touchCancel"
    @click="toRead"
  >
    <div :class="['ad_tip', `banner_${bannerState}`]">
      <p class="tit">免费公告</p>
      <p class="desc">亲爱的读者，您正在阅读正版免费内容，广告收入将用于激励作者。华为浏览器与您一起支持正版阅读！</p>
    </div>

    <div
      :class="[!isRenderAd && 'ad_wrap_inner', isNeedSpringBack && 'slide-fade-leave-active', `banner_${bannerState}`]"
      :style="{ transform:`translateX(${adDisx}px)` }"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
      v-if="adData"
    >
      <div class="native_wrap" :style="{ width: baseAdWdith, height: baseAdHeight }" v-if="isRenderAd">
        <ads-template
          ref="adsBannerTemplate"
          class="native"
          :adwidth="maxAdWidth"
          :adheight="adHeight"
          :theme="themeType"
          :mute="1"
          :mobiledataplay="false"
          @adRenderSuccess="adRenderSuccess"
          @adRenderError="adRenderError"
          @adShow="adShowRender"
          @adImpression="adImpression"
          @adClick="adClickRender"
          @adDownloadBtnClick="adDownloadBtnClick"
          @adAppOpen="adAppOpen"
          @adDislike="adDislike"
          @adLike="adLike"
          @adFeedbackOpen="adFeedbackOpen"
          @adFeedbackClose="adFeedbackClose"
          @adAppStatusChange="adAppStatusChange"
          @adVideoStart="adVideoStart"
          @adVideoPause="adVideoPause"
          @adVideoCompleted="adVideoCompleted"
          @adVideoError="adVideoError"
        ></ads-template>
      </div>
      <component
        v-if="!isRenderAd"
        adType="Banner"
        :is="componentName"
        :isAppDownload="isAppDownload"
        :isLockAd="false"
        :adData="adData"
        :nativeAd="nativeAd"
        :clientResize="clientResize"
        :innerWidth="baseAdWdith"
        :innerHeight="adHeight"
        @onAdClose="onAdClose"
        @clickAd='adClick'
        @adClickReport="adClickDownLoad"
        @setAdStatus="setAdStatus"
      />
    </div>
    <div :class="[`banner_${bannerState}`]" v-if="adState == 2">
      <img :src="require('@/assets/images/ad/ad_banner.png')" class="empty_img" @contextmenu.prevent />
    </div>

    <div :class="['ad_bottom', `banner_${bannerState}`]" v-if="!this.isFeiyebanner && this.adState > 1">
      <p class="ad_bottom_cont">
        <img
          class="icon"
          :style="{
            transform: `rotate(${isHorizontalMode ? 0 : 90}deg)`
          }"
          :src="themeType === 1 ? require('@/assets/images/guide/arrow_leftdark.svg') : require('@/assets/images/guide/arrow_left.svg')"
          @contextmenu.prevent
        />
        <span class="text">{{ isHorizontalMode ? '左' : '上' }}滑开始阅读</span>
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { APP_STATUS, HWAD_TYPE, AD_TYPE, AD_WIDTHMAP, ADP_WIDTHMAP, MIN_DISTANCE } from '@/constants';
import { generateGUID, trimAll, getDisTime, getDirection, getHwScreen, getGap } from '@/utils/helpers';
import jsbridge from '@/utils/jsbridge';
import { logUserBehavior } from '@/service';

export default {
  name: 'BannerAd',
  components: {
    BigImg: () => import('../NativeAd/big-img'),
    SmallImg: () => import('../NativeAd/small-img'),
    ThreeImg: () => import('../NativeAd/three-img'),
    Video: () => import('../NativeAd/video'),
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    isHotAd: { // 是否热启广告
      type: Boolean,
      default: false,
    },
    isFeiyebanner: {
      type: Boolean,
      default: true,
    },
    adConfig: {
      type: Object,
      default: null,
    },
    ccid: {
      type: String,
      default: '',
    },
    pageIndex: {
      type: Number,
      default: 1,
    },
    pageMode: { // 翻页模式
      type: Object,
      default: () => {
        return {}
      },
    },
    clientResize: {
      type: Number,
      default: 0,
    },
    clientWidth: {
      type: Number,
      default: 0,
    },
    clientHeight: {
      type: Number,
      default: 0,
    },
    isShowAdHover: { // 是否滑动触发广告点击
      type: Boolean,
      default: false,
    },
    isTouchRead: {
      type: Boolean,
      default: false,
    },
    isFreeAd: { // 是否免广-阅文免广配置
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isRenderAd: window.$config.renderAdOpen,
      nativeAd: null,
      adData: null,
      adState: 0, // 1-成功 2-失败 3-曝光
      uuid: null,
      adStatus: {}, // 下载广告状态

      animation: true, // 公告出现动效
      adDisx: 0, // 广告偏移距离
      storeNeedSpringBack: false, // 滑动广告时是否需要回弹-状态储存
      isNeedSpringBack: false, // 滑动广告时是否需要回弹
      bannerState: 'show', // show-出现 hide-立马隐藏 reshow-重新出现
      screenXGap: 0, // 广告 iframe 距离屏幕左边的距离

      // 注释掉无关视图变量
      // adType: '公告广告'
      // adTypeR: '模版公告广告'
      // adPos: 2, // 1-非物理广告 2-物理广告
      // adReqTime: 0, // 广告请求耗时
      // adRenderTime: 0, // 广告渲染耗时
      // isRenderHover: false, // 模版广告是否开启滑动跳下一页
      // clickType: '', // 0-广告素材点击 1-广告按钮点击 2-广告滑动点击 3-下载按钮点击
      isHorizontalMode: this.pageMode.isHorizontal,
      pageOffset: this.pageMode.isHorizontal ? { x: this.clientWidth, y: 0 } : { x: 0, y: this.clientHeight }, // 页面偏移距离
    };
  },
  computed: {
    ...mapGetters(['adPrivacy', 'theme', 'pageStatus', 'autoPageTurnFlag', 'renderAdOpen', 'renderAdIDs']),
    componentName() {
      if (!this.adData) {
        return '';
      }
      let component;
      const { creativeType } = this.adData;
      switch (creativeType) {
        case 3:
        case 103:
          component = 'BigImg';
          break;
        case 6:
        case 106:
          component = 'Video';
          break;
        case 7:
        case 107:
          component = 'SmallImg';
          break;
        case 8:
        case 108:
          component = 'ThreeImg';
          break;
      }
      return component;
    },
    isAppDownload() { // 判断是否是下载类广告
      if (this.adData && this.adData.app) {
        return true;
      }
      return false;
    },
    themeType() { // 模板是否是深色主题，0-浅色主题 1-深色主题
      return this.theme.theme === 'dark' ? 1 : 0
    },
    isHorizontalImg() { // 是否是横版图片
      if (this.componentName === 'BigImg') {
        if (this.adData && this.adData.imgList && this.adData.imgList.length > 0) {
          const { width, height } = this.adData.imgList[0];
          return width > height;
        }
      }
      return false;
    },
    isHorizontalVideo() { // 是否是横版视频
      if (this.componentName === 'Video') {
        if (this.adData && this.adData.video) {
          return this.adData.video.ratio > 1;
        }
      }
      return false;
    },
    hwScreen() { // 根据华为屏幕宽度判断类型
      return getHwScreen(this.clientWidth)
    },
    tipHeight() { // 提示文字高度
      // 动态计算文字行数
      let line = 2
      if (this.clientWidth - 48 < 440) {
        line = Math.ceil(840 / (this.clientWidth - 48))
      }
      return 36 + 12 + line * 21 + 16 // 标题 + margin + 行文字 + margin
    },
    baseAdWdith() { // 基础广告宽度
      const gap = getGap(this.clientWidth)
      return this.clientWidth - gap * 2
    },
    baseAdHeight() { // 基础广告高度
      let height = this.clientHeight - 40 - 40 - this.tipHeight
      if (!this.isFeiyebanner) {
        height -= 50
      }
      return height
    },
    adHeight() { // 广告实际高度
      return this.baseAdHeight
    },
    maxAdWidth() { // 模板广告宽度控制
      let theWidth = this.baseAdWdith

      // 折叠屏和pad按照百分比来适配，最小 312
      if (ADP_WIDTHMAP[this.hwScreen]) {
        theWidth = Math.floor(this.clientWidth * ADP_WIDTHMAP[this.hwScreen])
        theWidth = Math.max(theWidth, AD_WIDTHMAP.hw_fold)
      }

      return theWidth
    },
    useRenderAd() {
      let tag = false
      let userId = ''
      if (window.$config.userInfo && window.$config.userInfo.userId) {
        userId = window.$config.userInfo.userId
      }

      if (this.renderAdOpen) {
        tag = true
      } else if (this.renderAdIDs && userId) {
        // userId 或者 userId 尾号命中
        const last = userId.slice(userId.length - 1)
        if (this.renderAdIDs.includes(userId) || this.renderAdIDs.includes(last)) {
          tag = true
        }
      }
      return tag && this.adData && this.adData.isTemplateAd
    },
    adName() { // 广告类型名称
      // INSERT-插页 INSERTREWARD-激励免广插页
      return this.isHotAd ? AD_TYPE.BANNERHOT : AD_TYPE.BANNER
    },
  },
  watch: {
    pageStatus(newVal) { // 监听页面可见性-点击广告后进正文
      if (this.adClicked && newVal === 'visible') {
        this.adClicked = false
        // 开启自动翻页开关
        if (this.autoPageTurnFlag) {
          this.toRead()
        }
      }
    },
    show(newVal) {
      if (newVal) {
        if (this.isFeiyebanner) {
          this.pageOffset = { x: 0, y: 0 }
        } else {
          this.animation = false
          setTimeout(() => {
            this.animation = true
          }, 200)
          this.$nextTick(() => {
            this.pageOffset = this.isHorizontalMode ? { ...this.pageOffset, x: 0 } : { ...this.pageOffset, y: 0 }
          })
        }
      }
    },
    clientResize: { // 屏幕宽高发生变化-公告位置修正
      handler() {
        this.bannerState = 'hide'
        setTimeout(() => {
          this.bannerState = 'reshow'
        }, 150)
        if (this.show) {
          this.pageOffset = this.isHorizontalMode ? { ...this.pageOffset, x: 0 } : { ...this.pageOffset, y: 0 }
        } else {
          this.pageOffset = this.isHorizontalMode ? { ...this.pageOffset, x: this.clientWidth } : { ...this.pageOffset, y: this.clientHeight }
        }
      },
    },
    isTouchRead(newVal) {
      if (newVal && this.pageOffset.x < 0) { // 文章内容被触摸关闭公告页
        this.toRead()
      }
    },
    pageMode: {
      handler(newValue, oldValue) {
        if (newValue.isHorizontal === oldValue.isHorizontal) return;
        this.isHorizontalMode = newValue.isHorizontal;
        this.pageOffset = newValue.isHorizontal ? { x: this.clientWidth, y: 0 } : { x: 0, y: this.clientHeight };
      },
      deep: true
    }
  },

  created() {
    if (this.isFreeAd) { // 免广章节直接关闭公告页
      this.$emit('closeBanner')
      logUserBehavior({
        eventId: 'reader_announcement_page_hide',
        eventCode: 'hide',
        eventInfo: { ext1: this.isHotAd ? 2 : 1 }
      })
      return
    }

    this.adClicked = false
    if (this.isHotAd) {
      this.adType = '热启广告'
      this.adTypeR = '模版热启广告'
    } else {
      this.adType = '公告广告'
      this.adTypeR = '模版公告广告'
    }
    this.createNativeAd()
  },
  mounted() {
    if (!this.isHotAd) {
      this.$store.commit('adConfig/setShowBanner', false)
    }
  },
  // 组件销毁时，卸载监听事件
  beforeDestroy() {
    // 状态、进度 sdk 全局监听，不需要取消
    if (this.nativeAd && !this.isRenderAd) {
      this.nativeAd.offStatusChanged();
      this.nativeAd.offDownloadProgress();
    }
    if (this.nativeAd) {
      this.nativeAd.offLoad();
      this.nativeAd.offError();
      this.nativeAd.destroy();
    }
    if (!this.isHotAd) {
      this.$store.commit('adConfig/setShowBanner', true)
    }
  },

  methods: {
    // 创建原生广告
    createNativeAd() {
      if (this.adConfig) {
        try {
          const { slotId, cpIdCode } = this.adConfig
          /*
            公告广告 id 暂时写死原因：
              cpIdCode：目前用的是插页广告的
              slotId：amis 未传、kit 未传，后续需要 kit 补全此功能
              为什么不直接 amis 加配置：原则上要 kit 先补全功能，阅文侧无动态配置需求就不要在 amis 里面加配置，amis 配置够多了越少越好。
            广告轻互动功能测试广告位：m08paiyrvk
           */
          this.slotId = trimAll('n8lbzo6yqz' || slotId)
          window.ppsads.ready(() => {
            try {
              this.nativeAd = window.ppsads.createNativeAd({
                cpIdCode,
                slotId: this.slotId,
                supportTemplateAd: true
              });
            } catch (error) {
              this.reportErr('createNativeAd', error)
              return
            }

            this.setRequestConfig(cpIdCode);
            this.loadAd();
            this.onAdLoad();
            // 本地开发环境调试广告样式
            if (!window.$config.debug) {
              this.onAdError();
            }
          });
        } catch (err) {
          this.log('初始化错误', err)
          this.reportErr('ready', err)
          this.toRead()
        }
      }
    },
    reportErr(method, err) { // 初始化报错上报
      const event = {
        eventId: 'reader_ads_error',
        eventCode: 'error',
        eventInfo: {
          ext1: method,
          ext2: err && err.message,
          ad_name: this.adName,
        },
      };
      logUserBehavior(event)
    },
    setRequestConfig(cpIdCode) { // 设置广告个性化请求相关参数
      const defaultAdPrivacy = { // 渲染的时候还没拿到就用默认值
        adConsentFlag: 0,
        hwDspNpa: 0,
        thirdDspNpa: 0
      }
      const { adConsentFlag, hwDspNpa, thirdDspNpa } = this.adPrivacy || defaultAdPrivacy;
      this.nativeAd.setRequestConfig({
        requestLocation: false, // 设置请求时是否携带位置信息，默认携带
        nonPersonalizedAd: adConsentFlag, // 是否请求非个性化广告。
        hwNonPersonalizedAd: hwDspNpa, // 是否请求华为DSP非个性化广告。
        thirdNonPersonalizedAd: thirdDspNpa, // 是否请求三方DSP非个性化广告。
        extras: {
          cpIdCode,
        },
      });
    },
    isAdaptedAd(data) { // 是否是已适配的广告素材
      // 3-大图 6-视频 7-小图 8-三小图
      if ([3, 103, 6, 106, 7, 107, 8, 108].includes(data.creativeType)) {
        return true
      }
      return false
    },
    // 加载广告
    loadAd() {
      if (this.adLoading) {
        return;
      }

      if (this.nativeAd) {
        this.log('开始请求')
        this.adLoading = true
        this.uuid = generateGUID()
        this.adReqTime = new Date().getTime()
        this.reportYuewen('reader_ad_request', 'ad_request')
        this.nativeAd.load()

        // 本地开发环境调试广告样式
        if (window.$config.debug) {
          setTimeout(() => {
            this.adLoading = false

            const mockAdBanner = window.$debug.mockAdBanner
            // 返回数据异常直接跳过
            if (this.isAdaptedAd(mockAdBanner)) {
              this.adLoadSuc(mockAdBanner)
            } else {
              this.log('跳过返回数据异常', mockAdBanner.creativeType)
              this.reportYuewen('reader_ad_fail', 'ad_fail')
            }
          }, 1000);
        }
      } else {
        this.createNativeAd()
      }
    },
    // 广告加载成功
    onAdLoad() {
      this.nativeAd.onLoad((adList) => {
        this.log('请求成功', adList)
        this.adLoading = false

        if (adList && adList.length > 0) {
          if (this.isAdaptedAd(adList[0])) {
            this.adLoadSuc(adList[0])

            this.getAdTime('req')
            this.reportEvent('LPADREQ', {
              cause: 'success',
              returnNum: adList.length,
              cost: this.adReqTime
            });
            this.reportEvent('LPADRESDTL', { adData: adList[0] });
            this.reportYuewen('reader_ad_return', 'ad_return');
            return
          }
        }

        this.log('跳过返回数据异常', adList)
        this.getAdTime('req')
        this.reportYuewen('reader_ad_fail', 'ad_fail')
      });
    },
    adLoadSuc(datas) {
      this.adData = datas

      // 一个广告周期内固定住 isRenderAd 值
      this.isRenderAd = this.useRenderAd

      // 模板广告渲染 or 自渲染
      if (this.isRenderAd) {
        this.registerAd()
      } else {
        this.adState = 1
        this.showFn()
      }
    },
    // 广告加载失败
    onAdError() {
      this.nativeAd.onError((errorCode) => {
        this.log('请求失败', errorCode)
        this.adLoading = false

        this.adState = 2
        this.$emit('bannerAdError')
        this.getAdTime('req')
        this.reportEvent('LPADREQ', {
          cause: 'fail',
          errorCode,
          returnNum: 0,
          cost: this.adReqTime
        });
        this.reportYuewen('reader_ad_error', 'ad_error', errorCode);
      });
    },
    showFn() {
      this.adState = 3

      this.log(`${this.isRenderAd ? '模板' : ''}曝光`)
      this.reportEvent('LPAR', {
        cause: 'exposure',
        adData: this.adData,
      });
      this.reportYuewen('reader_ad_shown', 'ad_shown');
      if (!this.isRenderAd) { // 模板广告不需要调上报
        this.nativeAd.reportAdShow({ adId: this.adData.adId });
      }
    },
    // 关闭广告
    onAdClose(keyWords = '') {
      this.reportEvent('LPAMP', {
        adData: this.adData,
        r: keyWords,
      });
      // 关闭广告阅文测未上报

      if (!this.isRenderAd) { // 模板广告不需要调上报
        this.nativeAd.reportAdClose({ adId: this.adData.adId, keyWords: [keyWords] });
      }

      this.toRead()
    },
    // 广告点击及点击上报
    adClick(type) { // 调广告点击接口
      if (!this.limitClick()) {
        return
      }

      const { adId } = this.adData
      this.adClickReport(type)
      if (!this.isRenderAd) { // 模板广告不需要调上报
        this.nativeAd.onAdClick({ adId })
        this.nativeAd.reportAdClick({ adId })
      }

      this.adClicked = true
    },
    adClickDownLoad(type) { // 广告被点击-下载广告
      if (!this.limitClick()) {
        return
      }

      const { interactionType } = this.adData
      this.adClickReport(type)

      // 促活类广告点击 && 下载广告下载完毕-点击后跳下一页
      if (interactionType === 3 && this.adStatus.status === APP_STATUS.INSTALLED) {
        this.adClicked = true
      }
      this.log('下载按钮被点击', interactionType, this.adStatus.status)
    },
    limitClick() { // // 限制触发多次点击
      if (this.clickTag) {
        return
      }
      this.clickTag = true
      setTimeout(() => {
        this.clickTag = false
      }, 500)
      return true
    },
    adClickReport(type = '') { // 广告点击上报
      this.reportEvent('LPAR', {
        adData: this.adData,
        cause: 'click',
      });
      this.clickType = Number(type)
      this.reportYuewen('reader_ad_clicked', 'ad_clicked');
    },
    setAdStatus(button) { // 下载按钮状态变化
      this.adStatus = button
    },
    getAdTime(type) { // 广告请求、渲染时间差
      const time = type === 'req' ? this.adReqTime : this.adRenderTime
      const typeTime = type === 'req' ? 'adReqTime' : 'adRenderTime'
      this[typeTime] = getDisTime(time)
    },
    reportEvent(eventType, eventInfo) { // 上报华为广告事件
      this.$emit('getCurPage')
      setTimeout(() => { // 延迟到 pageIndex 数据更新后再执行
        const event = {
          ...eventInfo,
          adSlotId: this.slotId,
          pageIndex: this.pageIndex,
          reqId: this.uuid,
          blockType: HWAD_TYPE.BANNER,
        };
        jsbridge.commitAdEvent(eventType, event);
      })
    },
    reportYuewen(eventId, eventCode, errorCode) { // 上报阅文埋点
      const event = {
        eventId,
        eventCode,
        eventInfo: {
          ad_type: this.adPos || 2,
          ad_name: this.adName,
          chap_no: this.ccid,
          adid: this.slotId,
          ext4: this.uuid,
        },
      };

      if (this.adData) {
        const { source, adId, interactionType } = this.adData;
        event.eventInfo = {
          ...event.eventInfo,
          ext1: source,
          ext2: adId,
          ext3: interactionType,
          ext6: this.isRenderAd ? 1 : 0
        };
      }
      if (errorCode) {
        event.eventInfo.error_code = errorCode;
      }
      // 广告曝光或者广告点击时，需要上报是否开启左滑点击事件
      if (eventCode === 'ad_shown' || eventCode === 'ad_clicked') {
        let adHover = this.isRenderHover
        if (!this.isRenderAd) { // 非模板广告
          adHover = this.isShowAdHover
        }
        event.eventInfo.cl = adHover ? '1' : '0'
      }
      // 广告点击上报 0-广告素材点击 1-广告按钮点击 2-广告滑动点击 3-下载按钮点击
      if (eventCode === 'ad_clicked') {
        event.eventInfo.ext7 = this.clickType === 2 ? '0' : '1' // 0-滑动触发 1-点击触发
        event.eventInfo.ext9 = `${this.adName}_${this.clickType === 3 ? 2 : 1}` // 1-广告点击 2-下载按钮点击
      }
      // 广告请求耗时上报
      if (['reader_ad_return', 'reader_ad_fail', 'reader_ad_error'].includes(eventId)) {
        event.eventInfo.time_consuming = this.adReqTime
      }
      // 广告渲染耗时上报
      if (['reader_render_ad_success', 'reader_render_ad_fail'].includes(eventId)) {
        event.eventInfo.time_consuming = this.adRenderTime
      }
      logUserBehavior(event);
    },

    // 模板广告渲染
    registerAd() { // 注册数据
      this.$nextTick(() => {
        if (this.$refs.adsBannerTemplate) {
          this.adRenderTime = new Date().getTime()
          this.$refs.adsBannerTemplate.register(this.adData)
        }
      })
    },
    adRenderSuccess(ev) { // 模板渲染成功
      this.logR('渲染成功', ev)
      if (ev && ev.isTrusted) {
        this.isRenderHover = ev.isTrusted // 是否开启右滑功能 true false
      }

      if (this.show) {
        // 渲染成功广告归位
        this.pageOffset = this.isHorizontalMode ? { ...this.pageOffset, x: 0 } : { ...this.pageOffset, y: 0 }
      }
      this.adState = 1
      this.getAdTime()
      // this.reportYuewen('reader_render_ad_success', 'ad_success')
    },
    adRenderError(ev) { // 模板渲染失败
      this.logR('渲染失败', ev.detail)
      this.getAdTime()
      this.reportYuewen('reader_render_ad_fail', 'ad_fail', ev.detail);
      this.adState = 2
      this.adData = null
    },
    adShowRender() { // 广告展示，露出1px即可触发
      this.logR('露出', this.adData)
      this.adState = 3
      this.showFn()
    },
    adImpression() { // 广告有效曝光，默认规则:持续露出广告位 至少50%面积1S触发，服务器可配置下发
      this.logR('有效曝光')
      if (!this.strictAdShown) { // 只报1次
        this.strictAdShown = true
        this.reportYuewen('reader_strict_ad_shown', 'ad_shown')
      }
    },
    adClickRender(ev = {}) { // 广告点击，广告跳转触发
      // ev.detail 点击区域：0-广告素材点击 1-广告按钮点击 2-广告滑动点击
      this.logR('点击', ev.detail)
      this.adClick(ev.detail)
    },
    adDownloadBtnClick() {
      this.logR('下载按钮点击')
      this.adClickDownLoad(3)
    },
    adAppOpen(ev) { // 广告应用打开
      this.logR('打开应用', ev.detail)
    },
    adDislike(ev) { // 广告不喜欢，点击负反馈、内容举报触发
      this.logR('负反馈点击', ev.detail)

      let keyWords = ev.detail
      if (keyWords) {
        if (typeof keyWords === 'object') {
          keyWords = keyWords.label
        } else {
          try {
            keyWords = JSON.parse(keyWords).label
          } catch (error) {
            console.log(error)
          }
        }
      }
      this.onAdClose(keyWords)
    },
    adLike() { // 点击正反馈
      this.logR('正反馈点击')
    },
    adFeedbackOpen() { // 打开-负反馈
      this.logR('负反馈打开')
    },
    adFeedbackClose() { // 关闭-负反馈
      this.logR('负反馈关闭')
    },
    adAppStatusChange(ev) { // 监听应用状态
      const status = ev.detail
      const button = { status: '' }
      button.status = status
      this.logR('应用状态', status)

      this.setAdStatus(button)
    },
    adVideoStart() { // 广告开始播放
      this.logR('广告开始播放')
    },
    adVideoPause() { // 广告暂停播放
      this.logR('广告暂停播放')
    },
    adVideoCompleted() { // 广告完成播放
      this.logR('广告完成播放')
    },
    adVideoError(ev) { // 广告播放失败
      this.logR('广告播放失败', ev.detail)
    },

    // 手势
    toRead() { // 关闭公告进入正文
      if (this.pageMode.isHorizontal) {
        this.pageOffset = { ...this.pageOffset, x: -this.clientWidth }
      } else if (!this.pageMode.isHorizontal && this.pageMode.isVertical) {
        this.pageOffset = { ...this.pageOffset, y: -this.clientHeight }
      }
      setTimeout(() => {
        if (this.isHotAd) {
          this.$emit('closeHotAd')
        } else {
          this.$emit('closeBanner')
        }
      }, 200)
    },
    touchStartWrap(ev) { // 手势触摸开始-页面
      const touch = ev.clientX ? ev : ev.touches[0]
      this.xWrap = touch.clientX
      this.yWrap = touch.clientY
    },
    touchMoveWrap(ev) { // 手势移动-页面
      if (!this.xWrap) {
        return
      }
      const touch = (ev.clientX || ev.clientX === 0) ? ev : ev.touches[0]
      const xDiff = this.xWrap - touch.clientX
      const yDiff = this.yWrap - touch.clientY
      const sliderDirection = this.getDirectionAll2(Math.abs(xDiff), Math.abs(yDiff), 8) // 获取滑动方向 horizontal、vertical
      if (this.isHorizontalMode) { // 左右翻页
        if (xDiff <= 0) {
          this.pageOffset = { ...this.pageOffset, x: 0 }
        } else {
          if (sliderDirection === 'horizontal') {
            this.pageOffset = { x: -Math.min(xDiff, this.clientWidth), y: 0 }
          }
        }
      } else { // 上下翻页
        if (yDiff <= 0) {
          this.pageOffset = { ...this.pageOffset, y: 0 }
        } else {
          if (sliderDirection === 'vertical') {
            this.pageOffset = { y: -Math.min(yDiff, this.clientHeight), x: 0 }
          }
        }
      }
    },
    touchEndWrap() { // 手势停止移动-页面
      if (Math.abs(this.pageOffset.x) >= 10 || Math.abs(this.pageOffset.y) >= 10) {
        this.toRead()
      } else {
        this.pageOffset = this.isHorizontalMode ? { ...this.pageOffset, x: 0 } : { ...this.pageOffset, y: 0 }
      }
      this.xWrap = 0
      this.yWrap = 0
    },
    touchCancel() { // 手势取消
      this.pageOffset = this.isHorizontalMode ? { ...this.pageOffset, x: 0 } : { ...this.pageOffset, y: 0 }
      this.xWrap = 0
      this.yWrap = 0
    },
    touchPrevent() {
      return this.isRenderAd || !this.isShowAdHover
    },
    touchStart(ev) { // 手势触摸开始-广告区域
      if (this.touchPrevent()) { // 模版广告禁用此功能
        return
      }
      ev.stopPropagation()

      const touch = ev.touches[0]
      this.xDown = touch.clientX
      this.yDown = touch.clientY
      this.isNeedSpringBack = false
    },
    touchMove(ev) { // 手势移动-广告区域
      if (this.touchPrevent() || !this.xDown) { // 模版广告禁用此功能
        return
      }
      ev.stopPropagation()

      const touch = ev.touches[0]
      const xDiff = this.xDown - touch.clientX;
      const yDiff = this.yDown - touch.clientY;
      // 获取滑动方向 horizontal、vertical
      this.sliderDirection = this.getDirectionAll(xDiff, yDiff, MIN_DISTANCE);
      // 左右翻页时，手势跟随位移计算
      if (this.pageMode.isHorizontal && xDiff > yDiff && xDiff > 0) {
        this.adDisx = -Math.min(xDiff, 100);
      }
      this.storeNeedSpringBack = this.springBack(xDiff, yDiff);
      // 如果是左右翻页，且手势是横滑，则滑动查看广告详情
      if (this.pageMode.isHorizontal && this.sliderDirection === 'horizontal') {
        ev.cancelBubble = true
      }
    },
    touchEnd(ev) { // 手势停止移动-广告区域
      if (this.touchPrevent()) { // 模版广告禁用此功能
        return
      }
      ev.stopPropagation()

      this.isNeedSpringBack = this.storeNeedSpringBack
      this.adDisx = 0 // 插页广告位置恢复

      // 如果是左右翻页，且手势是横滑，则滑动查看广告详情
      if (this.pageMode.isHorizontal && this.sliderDirection === 'horizontal') {
        ev.cancelBubble = true
        this.sliderDirection = ''
        this.isNeedSpringBack = true
        this.adClick(2)
      }
    },
    /**
     * 判断手势滑动方向是横向还是纵向
     * @param x x轴偏移量
     * @param y y轴偏移量
     * @returns
    */
    getDirectionAll(x, y, minDis) {
      const direction = getDirection(x, y, minDis)
      if (direction === 'left') {
        return 'horizontal';
      }
      if (direction === 'up') {
        return 'vertical';
      }
      return '';
    },
    getDirectionAll2(x, y, minDis) { // 判断手势滑动方向是横向还是纵向
      if (x > y && x > minDis) {
        return 'horizontal';
      }
      if (y > x && y > minDis) {
        return 'vertical';
      }
      return '';
    },
    springBack(x, y) { // 判断广告内容是否需要回弹（位移在8px以下需要回弹效果）
      if (this.pageMode.isHorizontal && x > y && x > 0 && x <= MIN_DISTANCE) {
        return true;
      }
      return false;
    },
    log(name, ...msg) {
      console.log(`${this.adType}-${name}`, ...msg);
    },
    logR(name, ...msg) {
      console.log(`${this.adTypeR}-${name}`, ...msg);
    }
  },
};
</script>

<style lang="scss" scoped>
.ad_banner_index{
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 299;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .ad_wrap_inner {
    background: var(--color-ad-bg);
    border-radius: 8px;
  }
  .slide-fade-leave-active {
    transition: transform 0.15s ease-out;
  }
  .native_wrap{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .ad_tip{
    position: fixed;
    left: 0;
    top: 40px;
    z-index: 300;
    width: 100vw;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: rgba(0, 0, 0, 0.9);
    line-height: 1.5;
    .tit{
      margin-bottom: 12px;
      font-weight: 500;
      @include fontSize(24px);
    }
    .desc{
      max-width: 440px;
      text-indent: 2em;
      text-align: left;
      @include fontSize(14px);
    }
  }
  .empty_img{
    max-width: 440px;
    width: 100%;
    height: auto;
  }
  .ad_bottom {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 300;
    width: 100vw;
    height: 90px;
    padding-top: 24px;

    .ad_bottom_cont{
      display: flex;
      justify-content: center;
      align-items: center;
      line-height: 1.5;
    }
    .icon {
      margin-right: 12px;
      width: 20px;
      height: 20px;
      opacity: 0.4;
    }
    .text {
      @include fontSize(16px);
      font-weight: 500;
      color: rgba(0, 0, 0, 0.9);
    }
  }

  .banner_show{
    opacity: 1;
  }
  .banner_hide{
    opacity: 0;
  }
  .banner_reshow{
    transition: opacity 0.25s ease-out;
    opacity: 1;
  }
}
.ad_banner_dark{
  .ad_tip{
    color: rgba(255, 255, 255, 0.86);
  }
  .ad_bottom {
    .text {
      color: rgba(255, 255, 255, 0.86);
    }
  }
}
.ad_banner_animation {
  transition: transform 0.25s ease-out;
}
</style>
