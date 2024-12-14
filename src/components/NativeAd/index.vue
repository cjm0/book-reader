<!--
 * @Description : 插页广告 NativeAd
 * @Author      : chenjianmin
 * @Date        : 2023-12-12 14:20:16
-->
<template>
  <div class="ad_wrap" ref="nativeAd" v-if="adData">
    <div class="ad_tip" v-if="!isRenderAd">
      <p class="tip_tit" v-if="insertAd">
        <img class="icon" src="@/assets/images/ad-down/left.png" @contextmenu.prevent />
        <span class="span">点击以下内容 免{{ getTimeText.time }}{{ getTimeText.text }}广告</span>
        <img class="icon" src="@/assets/images/ad-down/right.png" @contextmenu.prevent />
      </p>
      <p class="tip_text">广告是为了更好地支持正版小说</p>
    </div>
    <div
      ref="adWrapInner"
      :class="[!isRenderAd?'ad_wrap_inner':'', isNeedSpringBack?'slide-fade-leave-active':'']"
      :style="{ 'transform':`translateX(${imgLeft}px)`}"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    >
      <template v-if="isRenderAd">
        <div class="native_wrap" :style="{ width: innerWidth, height: outAdHeight }">
          <div class="ad_tip">
            <p class="tip_tit" v-if="insertAd">
              <img class="icon" src="@/assets/images/ad-down/left.png" @contextmenu.prevent />
              <span class="span">点击以下内容 免{{ getTimeText.time }}{{ getTimeText.text }}广告</span>
              <img class="icon" src="@/assets/images/ad-down/right.png" @contextmenu.prevent />
            </p>
            <p class="tip_text">广告是为了更好地支持正版小说</p>
          </div>
          <ads-template
            ref="adsNativeTemplate"
            class="native"
            :adwidth="maxAdWidth"
            :adheight="maxAdHeight"
            :theme="themeType"
            :fbdisabled="fbDisabled"
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
          <p class="ad_insert_lock" @click.stop="toRead" v-if="isInsertLock">点击继续阅读</p>
          <RewardAd
            v-if="shouldLoadRewardAd && !isInsertLock"
            :posType="3"
            :ccid="ccid"
            :pageIndex="pageIndex"
            :blockType="blockType"
            :openInsert="openInsert"
            :adwidth="maxAdWidth"
            :style="{ opacity: isAdShow ? 1 : 0}"
            @on-reward="onReward"
            @rewardLoad="rewardLoad"
          />
        </div>
      </template>
      <template v-else>
        <component
          :is="componentName"
          :isAppDownload="isAppDownload"
          :isLockAd="isLockAd"
          :adData="adData"
          :nativeAd="nativeAd"
          :adInView="adInView"
          :clientResize="clientResize"
          :innerWidth="innerWidth"
          :innerHeight="maxAdInnerHeight"
          @onAdClose="onAdClose"
          @clickAd='adClick'
          @adClickReport="adClickDownLoad"
          @setAdStatus="setAdStatus"
        />
        <div class="ad_bottom" v-if="isShowHover">
          <div class="border_top" v-if="isShowAdHoverBorderTop"></div>
          <!-- 滑动标识 -->
          <img
            :src="isDark ? require('@/assets/images/guide/double-arrow-left-dark.png') : require('@/assets/images/guide/double-arrow-left.png')"
            class="tag_slide_control"
          />
          <span class="ad_bottom_tip">{{ showDefaultText ? '左滑广告查看详情' : '松手查看广告详情' }}</span>
        </div>
      </template>
    </div>
    <template v-if="!isRenderAd">
      <p class="ad_insert_lock" @click.stop="toRead" v-if="isInsertLock">点击继续阅读</p>
      <RewardAd
        v-if="shouldLoadRewardAd && !isInsertLock"
        :posType="3"
        :ccid="ccid"
        :pageIndex="pageIndex"
        :blockType="blockType"
        :openInsert="openInsert"
        :adwidth="maxNewRewardWidth"
        @on-reward="onReward"
        @rewardLoad="rewardLoad"
      />
    </template>
    <LockAd
      v-if="isLockAd"
      :adConfig="adConfig"
      :controlLockAd="controlLockAd"
      :ccid="ccid"
      :pageIndex="pageIndex"
      :showLockAdStr="showLockAdStr"
      :pageMode="turnPagesMode"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import IntersectionObserver from 'intersection-observer-polyfill';
import { APP_STATUS, HWAD_TYPE, AD_TYPE, AD_WIDTHMAP, ADP_WIDTHMAP, MIN_DISTANCE } from '@/constants';
import { generateGUID, trimAll, getDisTime, getTransTime, getDirection, getNetworkInfo, getHwScreen } from '@/utils/helpers';
import { getInsertAdUseConfig, setInsertAdUseConfig } from '@/utils/cacheData';

export default {
  name: 'NativeAd',
  components: {
    BigImg: () => import('./big-img'),
    SmallImg: () => import('./small-img'),
    ThreeImg: () => import('./three-img'),
    Video: () => import('./video'),
    RewardAd: () => import('../RewardAd'),
    LockAd: () => import('../LockAd'),
  },
  props: {
    ccid: {
      type: String,
      default: '',
    },
    cid: {
      type: Number,
      default: 1,
    },
    pageIndex: {
      type: Number,
      default: 0,
    },
    isInAd: {
      type: Boolean,
      default: true,
    },
    clientResize: { // 屏幕宽高发生变化
      type: Number,
      default: 0,
    },
    clientWidth: {
      type: Number,
      default: 0,
    },
    innerHeight: {
      type: Number,
      default: 0,
    },
    innerWidth: {
      type: Number,
      default: 0,
    },

    adConfig: {
      type: Object,
      default: null,
    },
    preloadAd: {
      type: Boolean,
      default: false,
    },
    thresholdCancelAd: {
      type: Boolean,
      default: false,
    },
    shouldLoadRewardAd: { // 是否应该加载激励视频广告
      type: Boolean,
      default: false,
    },
    isShowAdHover: { // 是否滑动触发广告点击
      type: Boolean,
      default: false,
    },
    isLockAd: { // 是否锁章广告-锁章
      type: Boolean,
      default: false,
    },
    insertAd: { // 是否激励免广插页-激励插页广告
      type: Boolean,
      default: false,
    },
    adLength: { // 此章插页广告个数
      type: Number,
      default: 0,
    },
    turnPagesMode: { // 翻页模式
      type: String,
      default: ''
    },
  },
  data() {
    return {
      nativeAd: null,
      adData: null,
      adState: 0, // 广告状态：11-发起请求 12-请求成功 13-请求失败 21-发起渲染 22-渲染成功 23-渲染失败
      isRenderAd: window.$config.renderAdOpen,

      uuid: null,
      callbackQuene: [],
      adInView: false,
      adStatus: {}, // 下载广告状态
      cacheAdCanUseNum: 0, // 每个缓存广告可使用次数-缓存广告
      isAdShow: false, // 广告是否已显示
      openInsert: false, // 插页广告是否打开中

      imgLeft: 0, // 广告移动左侧距离
      storeNeedSpringBack: false, // 滑动广告时是否需要回弹-状态储存
      isNeedSpringBack: false, // 滑动广告时是否需要回弹
      showLockAdStr: '', // 显示锁章倒计时的匹配字串-锁章
      showDefaultText: true, // 展示广告底部默认ctr优化文案
      maxNewRewardWidth: 0, // 自渲染广告，激励视频新样式最大宽度

      // 注释掉无关视图变量
      // observer: null,
      // initTimer: null, // 广告请求时机
      // initNative: false,
      // adSlotIdConfig: null, // 多广告位 id
      // slotId: '', // 广告位 id
      // adPos: 2 // 1-非物理广告 2-物理广告
      // adReqTime: 0, // 广告请求耗时
      // adRenderTime: 0, // 广告渲染耗时
      // isRenderHover: false, // 模版广告是否开启滑动跳下一页
      // clickType: '', // 0-广告素材点击 1-广告按钮点击 2-广告滑动点击 3-下载按钮点击
    };
  },
  computed: {
    ...mapGetters(['adPrivacy', 'theme', 'controlLockAd', 'pageStatus', 'autoPageTurnFlag', 'renderAdOpen', 'renderAdIDs', 'cacheAdReqNum', 'cacheAds', 'cacheAdCcid', 'adSplitConfig', 'adFirstConfig', 'adYwConfig', 'rewardAdNewStyle', 'insertAdConfig', 'insertAdLock', 'insertAdSlotId']),
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
    isShowHover() { // 滑动触发广告点击
      return this.isShowAdHover && this.turnPagesMode === 'horizontal'
    },
    isDark() { // 主题是否是深色模式
      return this.theme.theme === 'dark';
    },
    themeType() { // 模板是否是深色主题，0-浅色主题 1-深色主题
      return this.isDark ? 1 : 0
    },
    fbDisabled() { // 点击广告是否弹框展示负反馈
      // 锁章状态屏蔽当前插页广告的负反馈-锁章
      return this.controlLockAd.lockIng && this.isLockAd
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
    isShowAdHoverBorderTop() { // 判断是否展示广告底部上边框
      // 小图、三小图、横版图片、横版视频 时展示
      return ['SmallImg', 'ThreeImg'].includes(this.componentName)
        || this.isHorizontalImg
        || this.isHorizontalVideo;
    },
    blockType() { // 广告位所处模块
      return this.isLockAd ? HWAD_TYPE.LOCK : HWAD_TYPE.INSERT
    },
    hwScreen() { // 根据华为屏幕宽度判断类型
      return getHwScreen(this.clientWidth)
    },
    isInsertLock() { // 激励插页 && 打开限制翻页开关 && 横翻-激励插页广告
      return this.insertAd && this.insertAdLock && this.turnPagesMode === 'horizontal'
    },
    adName() { // 广告类型名称
      // INSERT-插页 INSERTREWARD-激励免广插页
      return this.insertAd ? AD_TYPE.INSERTREWARD : AD_TYPE.INSERT
    },
    isInsertSlotId() { // 用 amis 配置的广告位-激励插页广告
      if (this.insertAd && this.insertAdSlotId) {
        return this.insertAdSlotId
      }
      return ''
    },

    textHeight() { // 广告外部文字高度
      let height = this.innerHeight - (this.insertAd ? 68 : 28) // 减去广告提示语高度
      if (this.isInsertLock) { // 激励插页锁定-激励插页广告
        height = height - 50 // 减去锁定文字高度
      } else if (this.shouldLoadRewardAd) { // 激励视频文字链
        height = height - (this.rewardAdNewStyle ? 80 : 49) // 减去视频广告高度，分新旧两种样式
      }
      return height
    },
    outAdHeight() { // 模板广告外部高度
      if (this.turnPagesMode === 'vertical') {
        return 'auto'
      }
      return this.innerHeight
    },
    maxAdInnerHeight() { // 阅文广告高度
      const theHeight = this.textHeight
      return this.isShowHover ? theHeight - 32 : theHeight
    },
    maxAdHeight() { // 模板广告高度控制
      return Math.min(this.textHeight, 654)
    },
    maxAdWidth() { // 模板广告宽度控制
      let theWidth = this.innerWidth

      // 手机视频广告宽度再减小 32
      // if (this.hwScreen === 'hw_mobile' && this.componentName === 'Video') {
      //   theWidth -= 32
      // }

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
    getTimeText() { // 时间展示
      return getTransTime(this.insertAdConfig?.time)
    },
  },
  watch: {
    preloadAd: {
      handler(preload) {
        if (preload && !this.adData) {
          if (this.nativeAd) {
            this.loadAd();
          } else {
            this.callbackQuene.push(this.loadAd);
          }
        }
      },
      immediate: true,
    },
    // 到了判断是否移除此广告的节点，一般是临近广告的前后一页
    thresholdCancelAd: {
      handler(threshold) {
        if (threshold) {
          if (!this.adData || !this.nativeAd || (this.isRenderAd && this.adState !== 22)) {
            console.log('插页广告跳过：无数据或者未渲染', `${this.pageIndex}_${this.adState}`, this.adData)
            this.deleteAd()
          }
        }
      },
      immediate: true,
    },
    adYwConfig(newVal) { // 阅文配置请求完毕立马创建插页广告-多广告位请求
      if (newVal) {
        this.initLoad()
      }
    },
    pageStatus(newVal) { // 监听页面可见性-点击广告后自动翻页-横翻
      if (!this.adClicked || newVal !== 'visible') {
        return
      }
      console.log('点击广告自动翻页', this.adInView, this.autoPageTurnFlag)

      // 当前是广告页 && 开启自动翻页开关
      if (this.adInView && this.autoPageTurnFlag) {
        // 如果是锁章广告判断是否已解锁
        if (this.isLockAd) {
          if (!this.controlLockAd.lockIng) {
            this.$emit('on-skip');
          }
        } else {
          this.$emit('on-skip');
        }
      }
      this.adClicked = false
    },
  },

  created() {
    // 延迟 250ms 等阅文 config 接口-多广告位请求
    clearTimeout(this.initTimer)
    this.initTimer = setTimeout(() => {
      this.initLoad()
    }, 250)
  },

  methods: {
    initLoad() { // 初始请求-多广告位请求
      if (!this.initNative) {
        // 缓存广告可使用次数-缓存广告
        if (this.cacheAdReqNum > 0) {
          this.cacheAdCanUseNum = Math.ceil(this.adLength / this.cacheAdReqNum)
        }

        this.initNative = true // 控制只触发1次
        this.createNativeAd()
        this.adClicked = false
      }
    },
    getSlotIdFirst() { // 多广告位优先请求
      let slotId = ''
      if (this.adFirstConfig && this.adFirstConfig.length > 0) {
        const adSplit = this.adFirstConfig[0].browserAdSplitConfigList
        if (adSplit && adSplit.length > 0) {
          slotId = adSplit[0]
          this.adSlotIdConfig = adSplit.slice(1)
        }
        this.$store.commit('adConfig/useAdFirst')
      }
      return slotId
    },
    getSlotId() { // 多广告位请求
      let slotId = ''
      if (this.adSplitConfig) {
        const adSplit = this.adSplitConfig[0]
        if (adSplit && adSplit.length > 0) {
          slotId = adSplit[0]
          this.adSlotIdConfig = adSplit.slice(1)
        }
        this.$store.commit('adConfig/useAdSplit')
      }
      return slotId
    },
    // 创建原生广告
    async createNativeAd(pSlotId = '') {
      if (this.destroy) {
        console.log('广告已被销毁，不再发请求')
        return
      }

      let theSlotId = ''
      let tip = '多广告位请求'
      if (this.isInsertSlotId) { // 激励免广插页自己配置广告位
        theSlotId = this.isInsertSlotId
        tip = '激励插页独立广告位请求'
      } else { // 失败重试、优先请求、轮循请求
        theSlotId = pSlotId || this.getSlotIdFirst() || this.getSlotId()
      }
      if (theSlotId) {
        console.log(`${tip}-准备请求`, this.pageIndex, theSlotId)
      }

      if (this.adConfig) {
        try {
          const { cpIdCode, slotId } = this.adConfig;
          this.slotId = trimAll(theSlotId || slotId)
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

            this.adPos = pSlotId ? 1 : 2
            this.setRequestConfig(cpIdCode)
            this.loadAdCallback()
            if (pSlotId) { // 失败再请求-多广告位请求
              this.loadAd()
            }
            this.onAdLoad();
            // 本地开发环境调试广告样式
            if (!window.$config.debug) {
              this.onAdError();
            }
          });
        } catch (err) {
          console.log(err);
          this.reportErr('ready', err)
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
      this.$emit('reportYw', event)
    },
    // 创建完广告立马执行load广告
    loadAdCallback() {
      if (this.callbackQuene.length) {
        const callbacks = this.callbackQuene.slice();
        this.callbackQuene = [];
        callbacks.forEach(cb => cb());
      }
    },
    setRequestConfig(cpIdCode) { // 设置广告个性化请求相关参数
      const { adConsentFlag, hwDspNpa, thirdDspNpa } = this.adPrivacy;
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
    // 加载广告
    loadAd() {
      // 使用广告缓存-缓存广告
      const hasCacheAd = this.cacheAdCcid === this.ccid && this.cacheAds && this.cacheAds.length > 0
      // 激励插页单独配置广告id不用缓存-激励插页广告
      if (this.cacheAdReqNum > 0 && hasCacheAd && !this.isInsertSlotId) {
        console.log('直接使用缓存广告', `${this.cid}_${this.pageIndex}`)
        this.uuid = generateGUID()
        this.adLoadSuc(this.cacheAds[0].ad, 'cache')
        return
      }

      if (this.adLoading) {
        return;
      }
      console.log('开始加载广告', `${this.cid}_${this.pageIndex}`, this.slotId)
      this.adLoading = true
      this.uuid = generateGUID()
      this.adState = 11
      this.adReqTime = new Date().getTime()
      this.reportYuewen('reader_ad_request', 'ad_request')
      this.nativeAd.load()

      // 本地开发环境调试广告样式
      if (window.$config.debug) {
        setTimeout(() => {
          this.adLoading = false;

          // console.log('广告加载失败', this.pageIndex);
          // this.adState = 13
          // this.getAdTime('req')
          // if (this.destroy) {
          //   console.log('广告已被销毁，不再使用')
          //   return
          // }
          // this.deleteAd()
          // return

          /*
          this.adState = 12
          this.getAdTime('req')
          console.log(6662, this.adReqTime)
          // 失败用新的广告 id 再次请求，激励免广插页自己配置广告位-多广告位请求
          if (this.adSlotIdConfig && this.adSlotIdConfig.length > 0 && !this.isInsertSlotId) {
            this.destroyAd()

            const theSlotId = this.adSlotIdConfig[0]
            this.adSlotIdConfig = this.adSlotIdConfig.slice(1)
            console.log('多广告位请求-请求失败重新请求', this.pageIndex, theSlotId)
            this.createNativeAd(theSlotId)
            return
          }
          */

          const mockAdData3 = window.$debug.mockAdData3
          // 返回数据异常直接跳过
          if (this.isAdaptedAd(mockAdData3)) {
            this.adLoadSuc(mockAdData3)
          } else {
            console.log('广告跳过：返回数据异常', mockAdData3.creativeType);
            this.reportYuewen('reader_ad_fail', 'ad_fail')
            this.deleteAd()
          }
        }, 1000);
      }
    },
    // 广告加载成功
    onAdLoad() {
      this.nativeAd.onLoad((adList) => {
        console.log('广告加载成功', this.pageIndex, adList);
        this.adLoading = false;

        if (adList && adList.length > 0 && this.isAdaptedAd(adList[0])) {
          this.adLoadSuc(adList[0])

          this.adState = 12
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

        console.log('广告跳过：返回数据异常', adList)
        this.adState = 13
        this.getAdTime('req')
        this.reportYuewen('reader_ad_fail', 'ad_fail')
        this.deleteAd() // 返回数据异常直接跳过
      });
    },
    adLoadSuc(datas, type) {
      if (this.destroy) {
        console.log('广告已被销毁，不再使用')
        return
      }

      this.adData = JSON.parse(JSON.stringify(datas))
      this.isRenderAd = this.useRenderAd // 一个广告周期内固定住 isRenderAd 值

      // 缓存返回的成功广告-缓存广告
      if (type === 'cache') {
        this.$store.commit('adConfig/useCacheAds', {
          adId: datas.adId,
          type: 'use'
        })
      } else {
        if (!this.insertAd) { // 激励插页不作为缓存复用广告素材-激励插页广告
          this.$store.commit('adConfig/pushCacheAds', {
            ad: JSON.parse(JSON.stringify(datas)),
            ccid: this.ccid,
            useNum: this.cacheAdCanUseNum
          })
        }
      }

      // 模板广告渲染 or 自渲染
      this.$nextTick(() => {
        if (this.isRenderAd) {
          this.registerAd()
          this.observeSection('render')
        } else {
          this.observeSection()
        }
      })
      this.$emit('on-load')
    },
    isAdaptedAd(data) { // 是否是已适配的广告素材
      // 3-大图 6-视频 7-小图 8-三小图
      if ([3, 103, 6, 106, 7, 107, 8, 108].includes(data.creativeType)) {
        return true
      }
      return false
    },
    // 广告加载失败
    onAdError() {
      this.nativeAd.onError(errorCode => {
        console.log('广告加载失败', this.pageIndex, errorCode);
        this.adLoading = false;

        this.adState = 13
        this.getAdTime('req')
        this.reportEvent('LPADREQ', {
          errorCode,
          cause: 'fail',
          returnNum: 0,
          cost: this.adReqTime
        });
        this.reportYuewen('reader_ad_error', 'ad_error', errorCode);

        if (this.destroy) {
          console.log('广告已被销毁，不再使用')
          return
        }

        // 失败用新的广告 id 再次请求，激励免广插页自己配置广告位-多广告位请求
        if (!this.adData && this.adSlotIdConfig && this.adSlotIdConfig.length > 0 && !this.isInsertSlotId) {
          this.destroyAd()
          const theSlotId = this.adSlotIdConfig[0]
          this.adSlotIdConfig = this.adSlotIdConfig.slice(1)
          console.log('多广告位请求-请求失败重新请求', this.pageIndex, theSlotId)
          this.createNativeAd(theSlotId)
          return
        }

        this.deleteAd()
      });
    },
    // 监听节点曝光
    observeSection(type) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((el) => {
            if (el.intersectionRatio > 0) {
              if (el.isIntersecting) {
                if (type === 'render') {
                  this.adInView = true
                } else {
                  console.log('广告曝光', this.pageIndex, this.adData)
                  this.showFn()
                }
              } else {
                this.adInView = false
              }
            }
          });
        },
        {
          rootMargin: '0px 0px 0px 0px',
          threshold: 0.1, // 元素出现的阈值，当元素出现比例为0.1时，触发一次监听
        },
      );
      const nativeAdRef = this.$refs.nativeAd;
      nativeAdRef && this.observer.observe(nativeAdRef);
    },
    showFn() {
      // 激励视频新样式宽度-阅文自渲染广告
      if (!this.isRenderAd && this.$refs.adWrapInner) {
        this.maxNewRewardWidth = this.$refs.adWrapInner.offsetWidth
      }

      // 确保在广告页
      if (this.isInAd) {
        // 匹配则显示锁章倒计时-锁章
        this.showLockAdStr = `${this.ccid}_${this.pageIndex}`
      }

      // 锁定页面，目前只做横翻锁定-激励插页广告
      if (this.isInsertLock) {
        this.setLock(true)

        // 数据上报
        this.$emit('reportYw', {
          eventId: 'reader_download_continueReading_shown',
          eventCode: 'shown',
          eventInfo: {
            ad_name: AD_TYPE.INSERTREWARD,
          },
        })
      }
      // 消耗展示次数，1个广告只算1次-激励插页广告
      if (this.insertAd && !this.insertAdShowNum) {
        const now = new Date() * 1
        let useConfig = getInsertAdUseConfig()
        if (useConfig) {
          useConfig.num = useConfig.num + 1
          useConfig.time = useConfig.time || now
        } else {
          useConfig = { num: 1, time: now }
        }
        setInsertAdUseConfig(useConfig)
        this.insertAdShowNum = 1
        this.setInsertAdIndex()
      }

      this.adInView = true;
      this.reportEvent('LPAR', {
        adData: this.adData,
        cause: 'exposure',
      });
      this.reportYuewen('reader_ad_shown', 'ad_shown');
      if (!this.isRenderAd) { // 模板广告不需要调上报
        this.nativeAd.reportAdShow({ adId: this.adData.adId });
      }
    },
    setInsertAdIndex() { // 一个广告位一个预设-激励插页广告
      if (!this.hasSetIndex) {
        this.hasSetIndex = true
        if (window.$config.insertAdIndex > 0) {
          window.$config.insertAdIndex -= 1 // 预设减1
        }
      }
    },
    // 关闭广告
    onAdClose(keyWords = '') {
      this.reportEvent('LPAMP', {
        adData: this.adData,
        r: keyWords,
      });
      // 关闭广告阅文测未上报

      // 模板广告不需要调上报
      if (!this.isRenderAd) {
        this.nativeAd.reportAdClose({ adId: this.adData.adId, keyWords: [keyWords] });
      }

      this.deleteAd('close')
    },
    // 广告点击及点击上报
    adClick(type) { // 调广告点击接口
      if (!this.limitClick()) {
        return
      }

      const { adId } = this.adData
      this.adClickReport(type)
      // 模板广告不需要调上报
      if (!this.isRenderAd) {
        this.nativeAd.onAdClick({ adId })
        this.nativeAd.reportAdClick({ adId })
      }
      this.setAdClicked()

      // 点击获取免广权益-激励插页广告
      this.onReward2()
    },
    adClickDownLoad(type) { // 广告被点击-下载广告
      if (!this.limitClick()) {
        return
      }

      const { interactionType } = this.adData
      this.adClickReport(type)
      // 促活类广告点击 && 下载广告安装完毕-点击后跳下一页
      if (interactionType === 3 && this.adStatus.status === APP_STATUS.INSTALLED) {
        this.setAdClicked()
      }

      // 点击获取免广权益-激励插页广告
      // 下载中的广告点击暂停排除不奖励
      if (this.adStatus.status !== APP_STATUS.DOWNLOADING) {
        this.onReward2()
      }
      console.log('广告-下载按钮被点击', interactionType, this.adStatus.status)
    },
    limitClick() { // 限制触发多次点击
      if (this.rewardLoading) { // 激励视频打开中，限制插页广告点击
        return
      }
      if (this.clickTag) {
        return
      }
      this.clickTag = true
      setTimeout(() => {
        this.clickTag = false
      }, 500)

      // 插页广告点击中，限制激励视频 1s 内不可点击
      this.openInsert = true
      setTimeout(() => {
        this.openInsert = false
      }, 1000)

      return true
    },
    setAdClicked() { // 点击后不再计费的广告
      this.adClicked = true

      // 删除对应广告缓存-缓存广告
      this.$store.commit('adConfig/useCacheAds', {
        adId: this.adData.adId,
        type: 'delete'
      })
    },
    adClickReport(type) { // 广告点击上报
      this.reportEvent('LPAR', {
        adData: this.adData,
        cause: 'click',
      });
      this.clickType = Number(type)
      this.reportYuewen('reader_ad_clicked', 'ad_clicked');
    },
    async onReward2() { // 点击获取免广权益-激励插页广告
      if (!this.insertAd) {
        return
      }
      // 无网络不给奖励
      const { type } = await getNetworkInfo(true)
      if (type === '-1') {
        return
      }

      if (!this.adClicked) {
        this.setAdClicked()
      }
      if (this.theLockIng) {
        this.setLock(false)
      }
      this.$emit('on-reward2', {
        blockType: this.blockType,
        rewardTime: this.insertAdConfig.time,
        adData: this.adData,
        reason: 3 // 激励插页广告 暂时 按照激励视频免广算
      })
    },
    rewardLoad() { // 激励视频加载中，1s 内不可点击广告
      this.rewardLoading = true
      setTimeout(() => {
        this.rewardLoading = false
      }, 1000)
    },
    toRead() { // 点击继续阅读-激励插页广告
      this.setLock(false)
      this.$emit('on-skip')

      // 数据上报
      this.$emit('reportYw', {
        eventId: 'reader_download_continueReading_clicked',
        eventCode: 'clicked',
        eventInfo: {
          ad_name: AD_TYPE.INSERTREWARD,
          ext1: 2, // 1-出弹窗 2-跳过弹窗翻到下一页
        },
      })
    },
    setLock(bool) { // 设置锁定状态-激励插页广告
      window.$config.insertLockCcid = bool ? this.ccid : ''
      this.$store.commit('adConfig/setControlLockAd', { lockInsertIng: bool })
      this.theLockIng = bool
    },
    setAdStatus(button) { // 下载按钮状态变化
      this.adStatus = button
    },
    getAdTime(type) { // 广告请求、渲染时间差
      const time = type === 'req' ? this.adReqTime : this.adRenderTime
      const typeTime = type === 'req' ? 'adReqTime' : 'adRenderTime'
      // 丢弃非正常的数据
      if (![12, 13, 22, 23].includes(this.adState)) {
        this[typeTime] = 0
        return
      }
      this[typeTime] = getDisTime(time)
    },
    onReward(detail) {
      this.$emit('on-reward', detail)
    },
    deleteAd(type) { // 移除广告
      this.destroy = true
      this.destroyAd()
      if (type === 'close') {
        this.$emit('on-close')
      } else {
        this.$emit('on-error')
      }
    },
    destroyAd() {
      // 失败等销毁预设减1-激励插页广告
      if (this.insertAd) {
        this.setInsertAdIndex()
      }
      if (this.adData && this.adData.adId) {
        // 删除对应广告缓存-缓存广告
        this.$store.commit('adConfig/useCacheAds', {
          adId: this.adData.adId,
          type: 'delete'
        })
        // 被销毁需要重置锁定状态-激励插页广告
        if (this.theLockIng && this.controlLockAd.lockInsertIng) {
          this.setLock(false)
        }
      }
      // 状态、进度 sdk 全局监听，不需要取消
      if (this.nativeAd && !this.isRenderAd) {
        this.nativeAd.offStatusChanged();
        this.nativeAd.offDownloadProgress();
      }
      if (this.nativeAd) {
        this.nativeAd.offLoad();
        this.nativeAd.offError();
        this.nativeAd.destroy();
        this.nativeAd = null
      }
      this.adData = null
    },

    // 模板广告渲染
    registerAd() { // 注册数据
      if (this.$refs.adsNativeTemplate) {
        this.adRenderTime = new Date().getTime()
        this.adState = 21
        this.$refs.adsNativeTemplate.register(this.adData)
      }
    },
    adRenderSuccess(ev) { // 模板渲染成功
      console.log('模板广告-渲染成功', ev)
      if (ev && ev.detail) {
        this.isRenderHover = true // 是否开启右滑功能 true false
      }
      this.adState = 22
      this.getAdTime()
      // this.reportYuewen('reader_render_ad_success', 'ad_success')
    },
    adRenderError(ev) { // 模板渲染失败
      this.renderErrorFn(ev.detail)
    },
    renderErrorFn(error) {
      console.log('模板广告-渲染失败', error)
      this.adState = 23
      this.getAdTime()
      this.reportYuewen('reader_render_ad_fail', 'ad_fail', error)
      this.deleteAd()
    },
    adShowRender() { // 广告展示，露出1px即可触发
      this.isAdShow = true
      this.showFn()
      console.log('模板广告-露出', this.pageIndex, this.adData)
    },
    adImpression() { // 广告有效曝光，默认规则:持续露出广告位 至少50%面积1S触发，服务器可配置下发
      console.log('模板广告-有效曝光')
      if (!this.strictAdShown) { // 只报1次
        this.strictAdShown = true
        this.reportYuewen('reader_strict_ad_shown', 'ad_shown')
      }
    },
    adClickRender(ev = {}) { // 广告点击，广告跳转触发
      // ev.detail 点击区域：0-广告素材点击 1-广告按钮点击 2-广告滑动点击
      console.log('模板广告-点击', ev.detail)
      this.adClick(ev.detail)
    },
    adDownloadBtnClick() {
      console.log('模板广告-下载按钮点击')
      this.adClickDownLoad(3)
    },
    adAppOpen(ev) { // 广告应用打开
      console.log('模板广告-打开应用', ev.detail)
    },
    adDislike(ev) { // 广告不喜欢，点击负反馈、内容举报触发
      console.log('模板广告-负反馈点击', ev.detail)

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
      console.log('模板广告-正反馈点击')
    },
    adFeedbackOpen() { // 打开-负反馈
      console.log('模板广告-负反馈打开')
    },
    adFeedbackClose() { // 关闭-负反馈
      console.log('模板广告-负反馈关闭')
    },
    adAppStatusChange(ev) { // 监听应用状态
      const status = ev.detail
      const button = { status: '' }
      button.status = status
      console.log('模板广告-应用状态', status)

      this.setAdStatus(button)
    },
    adVideoStart() { // 广告开始播放
      console.log('模板广告-广告开始播放')
    },
    adVideoPause() { // 广告暂停播放
      console.log('模板广告-广告暂停播放')
    },
    adVideoCompleted() { // 广告完成播放
      console.log('模板广告-广告完成播放')
    },
    adVideoError(ev) { // 广告播放失败
      console.log('模板广告-广告播放失败', ev.detail)
    },

    // 手势
    touchPrevent() {
      return this.isRenderAd || !this.isShowHover
    },
    touchStart(e) { // 手势触摸开始
      if (this.touchPrevent()) { // 模版广告禁用此功能
        return;
      }

      this.xDown = e.touches[0].clientX
      this.yDown = e.touches[0].clientY
      this.isNeedSpringBack = false
    },
    touchMove(e) { // 手势移动
      if (this.touchPrevent()) { // 模版广告禁用此功能
        return
      }
      if (!this.xDown) {
        return
      }

      const touch = e.touches[0]
      const xDiff =  this.xDown - touch.clientX;
      const yDiff = this.yDown - touch.clientY;
      // 获取滑动方向 horizontal、vertical
      this.sliderDirection = this.getDirectionAll(xDiff, yDiff, MIN_DISTANCE);
      // 左右翻页时，手势跟随位移计算
      if (this.turnPagesMode === 'horizontal' && xDiff > yDiff && xDiff > 0) {
        this.imgLeft = - Math.min(xDiff, 100);
      }
      this.storeNeedSpringBack = this.springBack(xDiff, yDiff);
      if (this.storeNeedSpringBack) {
        this.showDefaultText = true;
      }
      // 如果是左右翻页，且手势是横滑，则滑动查看广告详情
      if (this.turnPagesMode === 'horizontal' && this.sliderDirection === 'horizontal') {
        e.cancelBubble = true
        this.showDefaultText = false
      }
    },
    touchEnd(e) { // 手势停止移动
      if (this.touchPrevent()) { // 模版广告禁用此功能
        return
      }

      this.isNeedSpringBack = this.storeNeedSpringBack
      this.showDefaultText = true
      this.imgLeft = 0 // 插页广告位置恢复

      // 如果是左右翻页，且手势是横滑，则滑动查看广告详情
      if (this.turnPagesMode === 'horizontal' && this.sliderDirection === 'horizontal') {
        e.cancelBubble = true
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
    springBack(x, y) { // 判断广告内容是否需要回弹（位移在8px以下需要回弹效果）
      if (this.turnPagesMode === 'horizontal' && x > y && x > 0 && x <= MIN_DISTANCE) {
        return true;
      }
      return false;
    },

    reportEvent(eventType, eventInfo) { // 上报华为广告事件
      const event = {
        ...eventInfo,
        adSlotId: this.slotId,
        pageIndex: this.pageIndex,
        reqId: this.uuid,
        blockType: this.blockType,
      };
      this.$emit('reportHw', { eventType, event })
    },
    reportYuewen(eventId, eventCode, errorCode) { // 上报阅文埋点
      const event = {
        eventId,
        eventCode,
        eventInfo: {
          ad_type: this.adPos || 2, // 1-非物理广告 2-物理广告
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
      // 锁章广告-锁章
      if (this.isLockAd && this.adConfig?.lockChapterConfig?.lockChapterTime) {
        event.eventInfo.ext5 = this.adConfig.lockChapterConfig.lockChapterTime
      }
      // 广告曝光或者广告点击时，需要上报是否开启左滑点击事件
      if (eventCode === 'ad_shown' || eventCode === 'ad_clicked') {
        let adHover = this.isRenderHover
        if (!this.isRenderAd) { // 非模板广告
          adHover = this.isShowHover
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
      this.$emit('reportYw', event)
    },
  },
  // 组件销毁时，卸载监听事件
  beforeDestroy() {
    clearTimeout(this.initTimer)
    this.destroy = true
    this.destroyAd()
  },
};
</script>

<style lang="scss" scoped>
.ad_wrap{
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
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
  margin-bottom: 12px;
  max-width: 100%;
  .tip_tit{
    margin-bottom: 8px;
    display: flex;
		justify-content: center;
		align-items: center;
		.icon{
			width: 16px;
			height: 32px;
		}
    .span{
			flex: 1;
      font-weight: 700;
			@include fontSize(20px);
      @include lineHeight(32px);
      @include text-ellipsis(1);
      color: #AD7027;
		}
  }
  .tip_text{
    text-align: center;
		@include fontSize(12px);
    @include lineHeight(16px);
    @include text-ellipsis(1);
    color: var(--color-text-disabled);
  }
}
.ad_insert_lock{
  margin-top: 32px;
  @include fontSize(18px);
  color: #A6A6A6;
}
.ad_bottom {
  width: calc(100% - 22px);
  height: 32px;
  border-radius: 0 0 8px 8px;
  text-align: center;
  margin: 0 auto;
  .border_top {
    height: 1px;
    width: 100%;
    background-color: var(--color-button-border);
    transform: scaleY(0.25);
  }
  .tag_slide_control {
    width: 16px;
    height: 16px;
    margin-right: 2px;
    opacity: 0.4;
  }
  .ad_bottom_tip {
    @include fontSize(12px);
    @include lineHeight(32px);
    color: var(--color-text-disabled);
  }
}
</style>
