<!--
 * @Description : 固底广告 FixBottonAD 原生广告
 * @Author      : chenjianmin
 * @Date        : 2023-02-03 14:27:04
-->
<template>
  <div
    :class="[
      'fix_botton_ad_index',
      `fix_botton_ad_${theme.theme}`,
      controlBottomAd.show ? 'fix_botton_ad_show' : 'fix_botton_ad_hide'
    ]"
    :style="{
      'background-color': theme.paper,
      'height': `calc(${bootomBarHeight}px + ${navigationHeight}px)`,
      'animation-duration': animaDuration + 'ms',
      display: displayAd,
    }"
    @animationstart.stop="animaStart"
    @animationend.stop="animaEnd"
  >
    <div class="ad_out">
      <template v-if="adData">
        <div
          ref="adCont"
          :class="['ad_cont', controlBottomAd.empty && 'opacity_hide']"
          @click.stop="adClick"
          :key="adId"
          v-if="!isRenderAd"
        >
          <div class="ad_wrap" v-if="!isAppDownload">
            <ImageBox class="ad_img" :url="adData.imgList[0].url" :style="{width:imgWidth}" imgHeight="100%"/>
            <div class="ad_info">
              <p class="ad_tit">{{ adName }}</p>
              <div class="ad_desc_wrap">
                <img
                  class="ad_close_img"
                  :src="require('@/assets/images/ad/ad_close.png')"
                  @contextmenu.prevent
                  @click.stop="closeAdBefore"
                >
                <p class="ad_desc">{{ adDesc }}</p>
              </div>
            </div>
          </div>
          <div class="ad_wrap" v-else>
            <ImageBox class="ad_img ad_img_logo" :url="adData.app.iconUrl" :style="{width:imgWidth}" imgHeight="100%"/>
            <div class="ad_info">
              <p class="ad_tit">{{ adName }}</p>
              <div class="ad_desc_wrap">
                <img
                  class="ad_close_img"
                  :src="require('@/assets/images/ad/ad_close.png')"
                  @contextmenu.prevent
                  @click.stop="closeAdBefore"
                >
                <p class="ad_desc">{{ adDesc }}</p>
              </div>
            </div>
          </div>
          <AdButtom
            :nativeAd="nativeAd"
            :adData="adData"
            :isAppDownload="isAppDownload"
            @setAdStatus="setAdStatus"
            @adClick="adClick"
            @adClickDownLoad="adClickDownLoad"
          />

          <!-- 负反馈弹窗 -->
          <close-popup
            :show="showPopup"
            :words="adData.keywords"
            @closepopup="closePopup"
            @cancelpopup="cancelPopup"
            :clientResize="clientResize"
            :maxWidth="maxWidth"
            :offsetTop="Top"
            :offsetLeft="Left"
            :offsetPosition="Position"
            :offsetHorizontalPosition="IsHorizontalCenter"
          >
          </close-popup>
        </div>
        <div
          :class="['native_wrap', controlBottomAd.empty && 'opacity_hide']"
          v-if="isRenderAd"
        >
          <ads-template
            ref="adBottomTemplate"
            class="native"
            :adwidth="clientWidth"
            :adheight="bootomBarHeight"
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
      </template>
      <div class="ad_empty" v-if="controlBottomAd.empty || !adData || !adRenderSuc">精品正版小说  尽享免费阅读</div>
    </div>
  </div>
</template>

<script>
import AdButtom from './ad-buttom';
import ImageBox from '../ImageBox';
import { mapGetters } from 'vuex';
import { getClient, generateGUID, toast, trimAll, getDisTime, getButtonInfo, getAppName, getAppDesc } from '@/utils/helpers';
import jsbridge from '@/utils/jsbridge';
import { logUserBehavior } from '@/service';
import { HWAD_TYPE, AD_TYPE, APP_STATUS, BOOTM_BAR_HEIGHT } from '@/constants';

const reReqNum = 2
export default {
  name: 'FixBottonAD',
  components: {
    AdButtom,
    ImageBox,
    ClosePopup: () => import('../NativeAd/close-popup'),
  },
  props: {
    adType: {
      type: Number,
      default: 1,
    },
    ccid: { // 章节 id
      type: String,
      default: '',
    },
    pageIndex: {
      type: Number,
      default: 1,
    },
    pageMode: {
      type: Object,
      default: null,
    },
    adConfig: {
      type: Object,
      default: null,
    },
    reportShowVertical: { // 扉页广告处理-竖翻
      type: Boolean,
      default: true,
    },
    reportShowHorizontal: { // 扉页广告处理-横翻
      type: Boolean,
      default: false,
    },
    shouldLoadBannerAd: { // 是否有公告广告
      type: Boolean,
      default: false,
    },
    newBottomAdType: { // 广告类型 0、1、2-多广告位新请求
      type: Number,
      default: 1,
    },
    isFreeAd: { // 是否免广-阅文免广配置
      type: Boolean,
      default: false,
    },
    isReqBottomAd: { // 是否触发固底广告请求
      type: Boolean,
      default: false,
    },
    rewardAdBottom: { // 是否被固底激励视频遮盖
      type: Boolean,
      default: false,
    },
    clientResize: { // 屏幕宽高发生变化
      type: Number,
      default: 0,
    },
    clientWidth: { // 屏幕宽度
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      bootomBarHeight: BOOTM_BAR_HEIGHT,
      nativeAd: null,
      adData: null,
      isRenderAd: window.$config.renderAdOpen,

      uuid: null, // 自己创造的唯一 id
      adRenderSuc: false, // 广告加载渲染成功
      reqType: [],

      // 注释掉无关视图变量
      // initTimer: null, // 广告请求时机
      // intervalTime: 0, // 刷广告间隔时间
      // time: 0, // 计时时间
      // beforeText: '', // 下载广告上一次文字
      // reloadIng: false, // 重新请求中
      // reloadErr: 0, // 重试失败次数
      // adClicked: false, // 广告点击
      // initNative: false,
      // adSlotIdConfig: null, // 多广告位 id
      // slotId: '', // 广告位 id
      // adPos: 2 // 1-非物理广告 2-物理广告
      // adReqTime: 0, // 广告请求耗时
      // adRenderTime: 0, // 广告渲染耗时
      // isRenderHover: false, // 模版广告是否开启滑动跳下一页
      // clickType: '', // 0-广告素材点击 1-广告按钮点击 2-广告滑动点击 3-下载按钮点击
      adStatus: {}, // 广告状态
      firstShow: true, // 是否第一次显示-扉页广告处理
      watchShowAd: true, // 是否监听外部变量控制广告曝光-扉页广告处理

      // 负反馈弹窗
      showPopup: false,
      maxWidth: 0,
      Top: 0,
      Left: 0,
      Position: 'bottom',
      IsHorizontalCenter: false,
      adFeedback: false, // 广告自渲染

      // 多广告位新请求
      // updateType: '', // 更新类型
    };
  },
  computed: {
    ...mapGetters(['theme', 'pageStatus', 'adPrivacy', 'adYwConfig', 'renderAdOpen', 'renderAdIDs', 'adBottomSplitConfig', 'adBottomFirstConfig', 'controlBottomAd', 'adBottomReloadTime', 'navigationHeight']),
    isAppDownload() { // 判断是否是下载类广告
      if (this.adData && this.adData.app) {
        return true
      }
      return false
    },
    adName() {
      return getAppName(this.adData)
    },
    adDesc() {
      return getAppDesc(this.adData)
    },
    imgWidth() {
      if (!this.adData) {
        return 0
      }
      if (this.isAppDownload || !this.adData.imgList) {
        return 40
      }
      const { width = 0, height = 0 } = this.adData.imgList[0]
      const imgWidth = (40 * width) / height // 0 NaN
      return imgWidth || 40
    },
    adId() {
      return this.adData ? this.adData.adId : ''
    },
    reloadAdTime() { // 广告位间隔刷新时间
      if (this.slotId && this.adBottomReloadTime[this.slotId]) {
        return this.adBottomReloadTime[this.slotId]
      }
      return this.adConfig.reloadAdSeconds
    },
    themeType() { // 模板是否是深色主题，0-浅色主题 1-深色主题
      return this.theme.theme === 'dark' ? 1 : 0
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
      return tag && this.adData.isTemplateAd
    },
    displayAd() { // 元素显隐控制
      if (this.adType === 1 && this.newBottomAdType > 1) {
        return 'none'
      }
      if (this.adType === 2 && this.newBottomAdType !== 2) {
        return 'none'
      }
      return 'block'
    },
    animaDuration() { // 动效控制
      // 固底刷新切换不要动效
      const beforeClass = this.getBeforeClass()
      let duration = 0
      if (this.controlBottomAd.show) {
        if (beforeClass === 'hide') {
          duration = 300
          this.setBeforeClass('show')
        }
      } else {
        if (beforeClass === 'show') {
          duration = 300
          this.setBeforeClass('hide')
        }
      }
      return this.controlBottomAd.anima ? duration : 0
    },
  },
  watch: {
    reportShowVertical(newVal) { // 竖翻-扉页广告处理
      if (this.pageMode.isVertical && this.watchShowAd && !this.firstShow && newVal) {
        this.showAd()
      }
    },
    reportShowHorizontal(newVal) { // 横翻-扉页广告处理
      if (this.pageMode.isHorizontal && this.watchShowAd && !this.firstShow && newVal) {
        this.showAd()
      }
    },
    adYwConfig: { // 阅文配置请求完毕
      handler(newVal) {
        if (newVal) {
          this.initLoad('config')
        }
      },
      immediate: true,
    },
    isReqBottomAd(newVal) { // 是否触发固底广告请求-受公告广告控制
      if (newVal) {
        this.initLoad('banner')
      }
    },
    isFreeAd(newVal) { // 阅文免广配置
      // 免广已失效 && 章节存在
      if (!newVal && this.ccid) {
        this.initLoad('freeAd')
      }

      // 免广章节隐藏固底
      this.setBottomAd(newVal)
    }
  },
  created() {
    this.setBeforeClass(this.controlBottomAd.show ? 'show' : 'hide')

    // 新的固底广告直接初始化-多广告位新请求
    if (!this.initNative && this.newBottomAdType > 0) {
      this.initNative = true // 控制只触发1次
      return this.createNativeAd()
    }

    // 延迟 250ms 等阅文 config 接口-多广告位请求
    clearTimeout(this.initTimer)
    this.initTimer = setTimeout(() => {
      this.initLoad('last')
    }, 250)
  },
  // 组件销毁时，卸载监听事件
  beforeDestroy() {
    clearTimeout(this.initTimer)
    clearTimeout(this.intervalTimer)
    this.setBeforeClass('')
    this.destroyAd()
  },

  methods: {
    initLoad(type) { // 初始请求
      this.reqType.push(type)

      // config 配置请求完毕或者延时到期，多广告位请求、阅文免广配置对 config 有依赖
      const isReqComplate = this.reqType.includes('config') || this.reqType.includes('last')

      // 免广章节不发请求-阅文免广配置
      if (isReqComplate && this.isFreeAd) {
        this.setBottomAd(true)
        return
      }
      /**
       * 公告页出再出固底
       * shouldLoadBannerAd(props)：是否有公告广告
       * isReqBottomAd(props)：是否触发固底广告请求
       */
      if (this.shouldLoadBannerAd && !this.isReqBottomAd) {
        return
      }
      // 公告页出再出固底，需要等请求结束
      if (type === 'banner' && !isReqComplate) {
        return
      }

      if (!this.initNative) {
        this.initNative = true // 控制只触发1次
        this.createNativeAd()
      }
    },
    setBottomAd(free) { // 免广控制
      let objControl = {
        show: !free,
        anima: false, // 免广章节切换无动效
        isFree: free ? 'true' : 'false',
      }
      // console.log(333, 'FixBottonAD', objControl);
      this.$store.commit('adConfig/setBottomAdOpen', objControl)
    },
    animaStart() { // 动画开始-控制动画期结束后再替换广告
      this.toggleAd = 1
    },
    animaEnd() { // 动画结束-控制动画期结束后再替换广告
      if (this.toggleAd === 2) {
        this.$emit('changeBootomAdType', this.toggleAdBool)
      }
      this.toggleAd = 0
    },
    getSlotIdFirst() { // 多广告位优先请求
      let slotId = ''
      if (this.adBottomFirstConfig && this.adBottomFirstConfig.length > 0) {
        const adSplit = this.adBottomFirstConfig[0].browserAdSplitConfigList
        if (adSplit && adSplit.length > 0) {
          slotId = adSplit[0]
          this.adSlotIdConfig = adSplit.slice(1)
        }
        this.$store.commit('adConfig/useAdBottomFirst')
      }
      return slotId
    },
    getSlotId() { // 多广告位请求
      let slotId = ''
      if (this.adBottomSplitConfig) {
        const adSplit = this.adBottomSplitConfig[0]
        if (adSplit && adSplit.length > 0) {
          slotId = adSplit[0]
          this.adSlotIdConfig = adSplit.slice(1)
        }
        this.$store.commit('adConfig/useAdBottomSplit')
      }
      return slotId
    },
    // 创建原生广告
    createNativeAd(pSlotId) {
      const theSlotId = pSlotId || this.getSlotIdFirst() || this.getSlotId()
      if (theSlotId) {
        console.log(`固底多广告位请求${this.newBottomAdType}-准备请求`, theSlotId)
      }

      if (this.adConfig) {
        try {
          const { slotId, cpIdCode } = this.adConfig
          this.slotId = trimAll(theSlotId || slotId)
          window.ppsads.ready(() => {
            try {
              this.nativeAd = window.ppsads.createNativeAd({
                cpIdCode,
                slotId: this.slotId,
                tmpType: 1, // 固底 1，插页不传此字段
                supportTemplateAd: true
              })
            } catch (error) {
              this.reportErr('createNativeAd', error)
              return
            }

            if (pSlotId) {
              this.adPos = 1
            }
            this.setRequestConfig(cpIdCode)
            this.loadAd()
            this.onAdLoad()
            // 本地开发环境调试广告样式
            if (!window.$config.debug) {
              this.onAdError()
            }
            this.setInterval() // 启动计时器
          });
        } catch (err) {
          console.log('固底广告-初始化错误', err)
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
          ad_name: AD_TYPE.BOTTOM,
        },
      };
      logUserBehavior(event)
    },
    setRequestConfig(cpIdCode) { // 设置广告个性化请求相关参数
      const { adConsentFlag, hwDspNpa, thirdDspNpa }  = this.adPrivacy;
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
    isAdaptedAd(data) { // 是否是已适配的广告素材
      // 3-大图 6-视频 7-小图 8-三小图
      if ([3, 103, 6, 106, 7, 107, 8, 108].includes(data.creativeType)) {
        return true
      }
      return false
    },
    loadAd() {
      if (this.adLoading) {
        return
      }
      this.time = 0

      // 自刷用新的广告位创建新广告-多广告位新请求
      if (this.adBottomSplitConfig && this.adData && this.updateType === 'newAd') {
        this.$emit('changeBootomAd')
        return
      }

      if (this.nativeAd) {
        console.log('固底广告-开始请求')
        this.adLoading = true
        this.uuid = generateGUID()
        this.adReqTime = new Date().getTime()
        this.reportYuewen('reader_ad_request', 'ad_request')
        this.nativeAd.load()

        // 本地开发环境调试广告样式
        if (window.$config.debug) {
          setTimeout(() => {
            this.adLoading = false

            /* this.getAdTime()
            // 失败用新的广告 id 再次请求-多广告位请求
            if (this.resetNativeAd()) {
              return
            } */

            const data = this.adData ? window.$debug.mockAdBottom1 : window.$debug.mockAdBottom2
            if (this.isAdaptedAd(data)) {
              this.showPopup = false
              this.adLoadSuc(JSON.parse(JSON.stringify(data)))
            } else {
              this.resetInterval(this.reloadAdTime)
            }
          }, 1000)
        }
      } else {
        this.createNativeAd() // 广告关闭重新创建广告
      }
    },
    onAdLoad() { // 广告加载成功
      this.nativeAd.onLoad((adList) => {
        console.log('固底广告-请求成功', adList)
        this.adLoading = false

        if (adList && adList.length > 0 && this.isAdaptedAd(adList[0])) {
          this.showPopup = false
          this.adLoadSuc(adList[0])

          this.getAdTime('req')
          this.reportEvent('LPADREQ', {
            cause: 'success',
            returnNum: adList.length,
            cost: this.adReqTime
          })
          this.reportEvent('LPADRESDTL', { adData: adList[0] })
          this.reportYuewen('reader_ad_return', 'ad_return')
          return
        }

        console.log('固底广告：返回数据异常', adList)
        this.getAdTime('req')
        this.reportYuewen('reader_ad_fail', 'ad_fail')
        this.resetInterval(this.reloadAdTime)
      })
    },
    adLoadSuc(data) {
      this.adData = data
      this.isRenderAd = this.useRenderAd // 一个广告周期内固定住 isRenderAd 值

      // 模板广告渲染 or 自渲染
      if (this.isRenderAd) {
        this.registerAd()
      } else {
        this.setRenderSuc()
        this.showAd() // 加载成功即曝光
      }

      // 间隔 x 秒重新请求
      this.adClicked = false
      this.reloadIng = false
      this.reloadErr = 0
      // 有数据下个自刷新时机
      this.adStatus.interval = 1 // 兼容下载广告未触发 adAppStatusChange（例如无app字段）导致无 interval 从而未自刷新
      this.resetInterval(this.reloadAdTime, 2, 'newAd')
    },
    setRenderSuc(bool = true) { // 设置最终渲染状态 true-成功 false-失败
      if (bool) {
        this.adRenderSuc = true
      }
      // 控制动画期结束后再替换广告
      if (this.toggleAd === 1) {
        this.toggleAd = 2
        this.toggleAdBool = bool
      } else {
        this.$emit('changeBootomAdType', bool)
      }
    },
    onAdError() { // 广告加载失败
      this.nativeAd.onError((errorCode) => {
        console.log('固底广告-请求失败', errorCode)
        this.adLoading = false

        this.getAdTime('req')
        this.reportEvent('LPADREQ', {
          errorCode,
          cause: 'fail',
          returnNum: 0,
          cost: this.adReqTime
        });
        this.reportYuewen('reader_ad_error', 'ad_error', errorCode) // 广告加载失败阅文测未上报

        // 失败用新的广告 id 再次请求-多广告位请求
        if (this.resetNativeAd()) {
          return
        }

        // 无广告数据或者广告被点击过的失败重试不超过 2 次，自刷新不重试
        console.log('固底广告-失败重试1', this.reloadIng, this.reloadErr, this.adData);
        if (this.reloadIng && this.reloadErr < reReqNum && (!this.adData || this.adClicked)) {
          this.reloadErr += 1

          // 下载广告失败了，在下载状态中刷新时间按照原时间
          console.log('固底广告-失败重试2', this.isAppDownload, this.adStatus.interval);
          if (this.isAppDownload && this.adStatus.interval > 0) {
            this.resetInterval(this.intervalTime)
          } else {
            this.resetInterval(3, 1)
          }
        } else {
          // 有数据失败后的下个自刷新时机
          this.resetInterval(this.reloadAdTime, 2, this.adData ? 'newAd' : '')
        }
      });
    },
    resetNativeAd() { // 广告位重新请求-多广告位请求
      if (!this.adData && this.adBottomSplitConfig) { // 初始失败无数据-轮询使用
        this.destroyAd()
        if (this.adSlotIdConfig && this.adSlotIdConfig.length > 0) {
          const theSlotId = this.adSlotIdConfig[0]
          this.adSlotIdConfig = this.adSlotIdConfig.slice(1)
          console.log(`固底多广告位请求${this.newBottomAdType}-请求失败重新请求`, theSlotId)
          this.createNativeAd(theSlotId)
        } else {
          console.log(`固底多广告位请求${this.newBottomAdType}-请求失败重新请求`, `${this.reloadAdTime} 秒后重试`)
          this.setRenderSuc(false) // 失败销毁此次新创建的固底广告
          this.resetInterval(this.reloadAdTime)
        }
        return true
      }
      return false
    },
    // 广告曝光
    showAd() {
      /*
        * 竖翻-扉页广告处理：第一次进入阅读页扉页，打开了菜单栏，不曝光。暴露固底才曝光
        * 横翻-扉页广告处理：扉页不展示广告，不曝光
      */
      if (this.firstShow) {
        if (this.pageMode.isVertical && !this.reportShowVertical) {
          this.firstShow = false
          return
        }
        if (this.pageMode.isHorizontal && !this.reportShowHorizontal) {
          this.firstShow = false
          return
        }
      }
      this.watchShowAd = false

      console.log(`${this.isRenderAd ? '模板' : ''}固底广告-曝光`)
      this.reportEvent('LPAR', {
        cause: 'exposure',
        adData: this.adData,
      });
      this.reportYuewen('reader_ad_shown', 'ad_shown')
      if (!this.isRenderAd) { // 模板广告不需要调上报
        this.nativeAd.reportAdShow({ adId: this.adData.adId })
      }
    },
    // 广告点击
    adClick(type) { // 调广告点击接口
      if (!this.limitClick()) {
        return
      }

      const { adId, interactionType } = this.adData
      this.adClickReport(type)
      if (!this.isRenderAd) { // 模板广告不需要调上报
        this.nativeAd.onAdClick({ adId })
        this.nativeAd.reportAdClick({ adId })
      }

      this.adClicked = true
      // 促活类广告点击 5s 后刷新广告
      if (interactionType === 3) {
        this.resetInterval(5, 1)
      }
    },
    adClickDownLoad(type) { // 广告被点击-下载广告
      if (!this.limitClick()) {
        return
      }

      const { interactionType } = this.adData
      this.adClickReport(type)

      // 促活类广告点击 5s 后刷新广告 && 下载广告下载完毕后执行刷新
      if (interactionType === 3 && this.adStatus.status === APP_STATUS.INSTALLED) {
        this.adClicked = true
        this.resetInterval(5, 1)
      }
      console.log('固底广告-下载按钮被点击', interactionType, this.adStatus.status)
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
      this.reportYuewen('reader_ad_clicked', 'ad_clicked')
    },
    // 广告关闭
    closeAdBefore(e) {
      // 无反馈字段不弹负反馈
      if (!this.adData.keywords || this.adData.keywords.length < 1) {
        return
      }

      this.getClosePosition(e.target)
      this.showPopup = true
    },
    closeAd(keyWords = '') {
      this.reportEvent('LPAMP', {
        adData: this.adData,
        r: keyWords, // 关闭弹窗反馈内容
      })
      // 关闭广告阅文测未上报

      if (!this.isRenderAd) { // 模板广告不需要调上报
        this.nativeAd.reportAdClose({ adId: this.adData.adId, keyWords: [keyWords] })
      }

      // 间隔 x 秒重新请求
      this.resetInterval(this.adConfig.reShowAdSeconds)
      this.adData = null
      this.adRenderSuc = false
      if (this.adBottomSplitConfig) { // 关闭-多广告位请求
        this.destroyAd()
      }
    },
    closePopup(keyWords) { // 点击反馈
      toast('已反馈')
      this.showPopup = false
      this.closeAd(keyWords)
    },
    cancelPopup() { // 关闭反馈弹窗
      this.showPopup = false
    },
    getClosePosition(dom) { // 获取负反馈按钮位置
      const { clientWidth, clientHeight } = getClient()
      const el = dom.getBoundingClientRect(); // 获取点击对象
      const gap = 6 + 17

      this.maxWidth = clientWidth - el.left - 6

      this.Left = el.left > gap ? el.left : gap

      // 如果该按钮距离底部位置过低，则负反馈弹窗在按钮上面展示
      this.Position = el.y - clientHeight / 2 >= 0 ? 'top' : 'bottom';

      // 获取反馈按钮是否在页面水平位置中间
      this.IsHorizontalCenter = (el.left + el.right) / 2 / clientWidth > 1 / 3
        && (el.left + el.right) / 2 / clientWidth <= 2 / 3;

      // 计算负反馈弹窗竖向位置
      this.Top = this.Position === 'bottom' ? el.y + el.height + 10 : clientHeight - el.y + 6;
    },
    destroyAd() {
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
    },

    // 模板广告渲染
    registerAd() { // 注册数据
      this.$nextTick(() => {
        if (this.$refs.adBottomTemplate) {
          this.adRenderTime = new Date().getTime()
          this.$refs.adBottomTemplate.register(this.adData);
        }
      })
    },
    adRenderSuccess(ev) { // 模板渲染成功
      console.log('模板固底广告-渲染成功', ev)
      if (ev && ev.isTrusted) {
        this.isRenderHover = ev.isTrusted // 是否开启右滑功能 true false
      }

      this.setRenderSuc()
      this.getAdTime()
      // this.reportYuewen('reader_render_ad_success', 'ad_success')
      this.showAd()
    },
    adRenderError(ev) { // 模板渲染失败
      console.log('模板固底广告-渲染失败', ev.detail)
      this.adRenderSuc = false
      this.setRenderSuc(false)
      this.getAdTime()
      this.reportYuewen('reader_render_ad_fail', 'ad_fail', ev.detail)
      this.resetInterval(this.reloadAdTime) // 渲染失败重试
    },
    adShowRender() { // 广告展示，露出1px即可触发
      console.log('模板固底广告-露出')
    },
    adImpression() { // 广告有效曝光，默认规则:持续露出广告位 至少50%面积1S触发，服务器可配置下发
      console.log('模板固底广告-有效曝光')
    },
    adClickRender(ev = {}) { // 广告点击，广告跳转触发
      // ev.detail 点击区域：0-广告素材点击 1-广告按钮点击 2-广告滑动点击
      console.log('模板固底广告-点击', ev.detail)
      this.adClick(ev.detail)
    },
    adDownloadBtnClick() {
      console.log('模板固底广告-下载按钮点击')
      this.adClickDownLoad(3)
    },
    adAppOpen(ev) { // 广告应用打开
      console.log('模板固底广告-打开应用', ev.detail)
    },
    adDislike(ev) { // 广告不喜欢，点击负反馈、内容举报触发
      console.log('模板固底广告-负反馈点击', ev.detail)

      // {"label":"看过了","type":1,"id":"1040364649075180544"}
      // 1：负反馈，3：投诉举报
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
      this.closeAd(keyWords)
      this.adFeedback = false
    },
    adLike() { // 点击正反馈
      console.log('模板固底广告-正反馈点击')
      this.adFeedback = false
    },
    adFeedbackOpen() { // 打开-负反馈
      console.log('模板固底广告-负反馈打开')
      this.adFeedback = true
    },
    adFeedbackClose() { // 关闭-负反馈
      console.log('模板固底广告-负反馈关闭')
      this.adFeedback = false
    },
    adAppStatusChange(ev) { // 监听应用状态
      const status = ev.detail
      const downloadText = this.adData.interactionType === 3 ? this.adData.clickBtnTxt : '进入应用';
      let button = getButtonInfo(APP_STATUS, status, 0, downloadText)
      button.status = status
      this.setAdStatus(button)
      console.log('模板固底广告-应用状态', status)
    },
    adVideoStart() { // 广告开始播放
      console.log('模板固底广告-广告开始播放')
    },
    adVideoPause() { // 广告暂停播放
      console.log('模板固底广告-广告暂停播放')
    },
    adVideoCompleted() { // 广告完成播放
      console.log('模板固底广告-广告完成播放')
    },
    adVideoError(ev) { // 广告播放失败
      console.log('模板固底广告-广告播放失败', ev.detail)
    },

    // 计时器，刷广告
    setInterval() {
      clearTimeout(this.intervalTimer)
      this.intervalTimer = setTimeout(() => {
        if (this.intervalTime > 0) {
          // 非广告位置隐藏、非广告元素隐藏、非置空、非页面隐藏中，已曝光、未被固底激励视频遮盖，非负反馈打开，才计时
          const { show, empty } = this.controlBottomAd
          const isShow = show && !empty && this.pageStatus === 'visible'
          const isFeedback = !this.showPopup && !this.adFeedback
          let isVisable = !this.watchShowAd && !this.rewardAdBottom
          if (!this.adData) { // 确保无数据失败重试后能够自刷新
            isVisable = !this.rewardAdBottom
          }
          if (isShow && isFeedback && isVisable) {
            this.time += 1
          }

          if (!this.isAppDownload) {
            this.reloadAd()
          }
          // 下载广告处理
          if (this.isAppDownload && this.adStatus.interval > 0) {
            this.reloadAd()
          }
        }
        this.setInterval()
      }, 1000)
    },
    resetInterval(resetTime, pos = 2, updateType = '') { // 重置刷广告时间
      this.time = 0
      this.intervalTime = resetTime
      this.adPos = pos // 1-非物理广告 2-物理广告
      this.updateType = updateType // 更新类型-多广告位新请求
    },
    reloadAd() { // 刷广告
      if (this.time >= this.intervalTime) {
        this.reloadIng = true
        this.loadAd()
      }
    },
    setAdStatus(button) { // 下载按钮状态变化
      // 状态变化就重置时间
      if (this.beforeText !== button.text && button.interval > 0) {
        this.resetInterval(this.reloadAdTime * button.interval, 2, this.updateType)
      }
      this.beforeText = button.text
      this.adStatus = button
    },
    setBeforeClass(tag) { // 设置 beforeClass 标识
      if (this.adType === 1) {
        window.$config.beforeClass1 = tag
      } else {
        window.$config.beforeClass2 = tag
      }
    },
    getBeforeClass() { // 获取 beforeClass 标识
      if (this.adType === 1) {
        return window.$config.beforeClass1
      }
      return window.$config.beforeClass2
    },

    // 数据上报
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
          blockType: HWAD_TYPE.BOTTOM,
        };
        jsbridge.commitAdEvent(eventType, event);
      })
    },
    reportYuewen(eventId, eventCode, errorCode) { // 上报阅文埋点
      const adName = AD_TYPE.BOTTOM
      const event = {
        eventId,
        eventCode,
        eventInfo: {
          ad_type: this.adPos || 2, // 1-非物理广告 2-物理广告
          ad_name: adName,
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
        event.eventInfo.cl = this.isRenderHover ? '1' : '0'
      }
      // 广告点击上报 0-广告素材点击 1-广告按钮点击 2-广告滑动点击 3-下载按钮点击
      if (eventCode === 'ad_clicked') {
        event.eventInfo.ext7 = this.clickType === 2 ? '0' : '1' // 0-滑动触发 1-点击触发
        event.eventInfo.ext9 = `${adName}_${this.clickType === 3 ? 2 : 1}` // 1-广告点击 2-下载按钮点击
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
  }
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
