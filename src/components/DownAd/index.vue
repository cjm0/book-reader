<!--
 * @Description : 激励下载广告 DownAd
 * @Author      : chenjianmin
 * @Date        : 2023-12-12 14:20:16
-->
<template>
  <div
    ref="downAd"
    :class="['down_ad_index', isDark && 'down_ad_dark']"
    :style="{ maxWidth: maxAdWidth + 'px' }"
    v-if="adData"
  >
    <p class="tip_tit">
      <img class="icon" src="@/assets/images/ad-down/left.png" @contextmenu.prevent />
      <span class="span">安装应用免{{ getTimeText.time }}{{ getTimeText.text }}广告</span>
      <img class="icon" src="@/assets/images/ad-down/right.png" @contextmenu.prevent />
    </p>
    <p class="tip_desc">任选1个应用安装打开即可</p>
    <div class="ad_wrap" @click.stop>
      <div class="ad_item" v-for="(item, index) in adData" :key="item.adId">
        <div class="ad_cont">
          <ImageBox class="ad_logo" :url="item.adImg"/>
          <div class="ad_info">
            <p class="ad_tit">{{ item.adName }}</p>
            <p class="ad_desc">{{ item.app.developerName }}</p>
            <p class="ad_link_wrap">
              <span class="ad_version" v-if="item.versionName">{{ item.versionName }}</span>
              <span class="ad_link_line" v-if="item.versionName && (item.privacyLink || item.permissionUrl || item.appDetailUrl)"></span>
              <span class="ad_text" @click="toLink('showAppDetailPage', item.adId)" v-if="item.appDetailUrl">介绍</span>
              <span class="ad_link_line" v-if="item.appDetailUrl && (item.privacyLink || item.permissionUrl)"></span>
              <span class="ad_text" @click="toLink('showPrivacyPolicyInWeb', item.adId)" v-if="item.privacyLink">隐私</span>
              <span class="ad_link_line" v-if="item.privacyLink && item.permissionUrl"></span>
              <span class="ad_text" @click="toLink('showPermissionPageInWeb', item.adId)" v-if="item.permissionUrl">权限</span>
            </p>
          </div>
        </div>
        <DownButtom
          :nativeAd="nativeAd"
          :adData="item"
          :theme="theme"
          @clickDownAd="clickDownAd(item, index)"
          @onReward="onReward(item)"
          @reportDownAd="reportDownAd(index, $event)"
        />
      </div>
      <img class="bg_img_top" :src="isDark ? require('@/assets/images/ad-down/top_dark.png') : require('@/assets/images/ad-down/top.png')" @contextmenu.prevent />
      <img class="bg_img_bottom" :src="isDark ? require('@/assets/images/ad-down/bottom_dark.png') : require('@/assets/images/ad-down/bottom.png')" @contextmenu.prevent />
    </div>
    <p class="lock_text" v-if="downAdLock && pageMode === 'horizontal'" @click.stop="handleNext">点击继续阅读</p>
  </div>
</template>

<script>
import DownButtom from './down-buttom.vue';
import ImageBox from '../ImageBox';

import { mapGetters } from 'vuex';
import { APP_STATUS, HWAD_TYPE, AD_TYPE, AD_WIDTHMAP, ADP_WIDTHMAP } from '@/constants';
import { generateGUID, trimAll, getDisTime, getTransTime, getButtonInfo, getHwScreen } from '@/utils/helpers';
import { getDownAdUseConfig, setDownAdUseConfig } from '@/utils/cacheData';

const ADNAME = '激励下载广告'
export default {
  name: 'DownAd',
  components: {
    DownButtom,
    ImageBox,
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
    adIndex: {
      type: Number,
      default: 0,
    },
    clientWidth: {
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
    pageMode: { // 翻页模式
      type: String,
      default: ''
    },
  },
  data() {
    return {
      nativeAd: null,
      adData: null,
      originData: false, // 是否有过数据
      packageNames: [], // app 包名集合
      appIds: [], // app 广告 id 集合
      returnApps: [], // 被拦截的 app 集合

      uuid: null,
      callbackQuene: [],
      adInView: false,

      isCache: false, // 是否是缓存广告-点击复用广告
      isToCache: false, // 数据是否已推入缓存集合-点击复用广告
      isReq: false, // 是否是缓存广告-请求复用广告
      isToReq: false, // 数据是否已推入缓存集合-请求复用广告

      timerToggle: null,
      timerTest: null,

      // 注释掉无关视图变量
      // observer: null,
      // slotId: '', // 广告位 id
      // adState: 0, // 广告状态：11-发起请求 12-请求成功 13-请求失败
      // adReqTime: 0, // 广告请求耗时
      // isToDialog: false, // 数据是否已推入弹窗广告集合-弹窗广告
      // reportDownNum: 0, // 下载按钮状态变化上报
      // hasLockDialog: false, // 已出过一次弹窗的直接跳过
    };
  },
  computed: {
    ...mapGetters([
      'theme',
      'adPrivacy',
      'controlLockAd',
      'downAdConfig',
      'downAdLock',
      'downAdBar',
      'downAds',
      'downAdDataApps',
      'rewardFree',
      'downAdReqNum',
      'downAdReq',
    ]),
    isDark() {
      return this.theme.theme === 'dark'
    },
    hwScreen() { // 根据华为屏幕宽度判断类型
      return getHwScreen(this.clientWidth)
    },
    maxAdWidth() { // 模板广告宽度控制
      let theWidth = this.innerWidth

      // 折叠屏和pad按照百分比来适配，最小 312
      if (ADP_WIDTHMAP[this.hwScreen]) {
        theWidth = Math.floor(this.clientWidth * ADP_WIDTHMAP[this.hwScreen])
        theWidth = Math.max(theWidth, AD_WIDTHMAP.hw_fold)
      }

      return theWidth
    },
    getTimeText() { // 时间展示
      return getTransTime(this.downAdConfig?.time)
    },
    isCacheAd() { // 是否缓存广告
      return this.isCache || this.isReq
    },
    isToCacheAd() { // 是否缓存广告源头
      return this.isToCache || this.isToReq
    },
  },
  watch: {
    preloadAd: {
      handler(preload) {
        if (preload && !this.adData) {
          if (this.nativeAd) {
            this.loadAd()
          } else {
            this.callbackQuene.push(this.loadAd)
          }
        }
      },
      immediate: true,
    },
    thresholdCancelAd: { // 到了判断是否移除此广告的节点，一般是临近广告的前后一页
      handler(threshold) {
        if (threshold) {
          if (!this.adData || !this.nativeAd) {
            this.log('跳过无数据或者未创建', this.pageIndex, this.adData)
            this.deleteAd()
          }
        }
      },
      immediate: true,
    },
    downAds() { // 源头广告被删除，已复用广告的需要清除掉-点击复用广告
      if (this.isCache && !this.downAds) {
        this.reloadAd()
      }
    },
    downAdReq() { // 源头广告被删除，已复用广告的需要清除掉-请求复用广告
      if (this.isReq) {
        if (!this.downAdReq || this.downAdReq.length === 0) {
          this.reloadAd()
          return
        }
        const result = this.downAdReq.find(v => v.uuid === this.uuid)
        if (!result) {
          this.reloadAd()
        }
      }
    }
  },

  created() {
    this.initLoad()
  },

  methods: {
    initLoad() { // 初始化
      this.createNativeAd()
    },
    // 创建原生广告
    async createNativeAd() {
      if (this.adConfig) {
        try {
          const { cpIdCode, slotId } = this.adConfig;
          this.slotId = trimAll('v11gdkgqm4' || slotId) // 广告 id 暂时写死 m77oyqb78e
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

            this.setRequestConfig(cpIdCode)
            this.loadAdCallback()
            this.onAdLoad()
            // 本地开发环境调试广告样式
            if (!window.$config.debug) {
              this.onAdError();
            }
          });
        } catch (err) {
          this.log('初始化错误', err)
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
          ad_name: AD_TYPE.DOWNAD,
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
        extras: { cpIdCode },
      });
    },
    getAdData(adList) { // 获取下载类广告
      // 控制横翻高度不够的时候减少广告个数
      let maxNum = 5
      if (this.pageMode === 'horizontal') {
        const adHeight = this.innerHeight - 94 // 总高度 - 广告提示语
        maxNum = Math.floor(adHeight / 64)
        maxNum = maxNum > 5 ? 5 : maxNum
      }

      if (adList && adList.length > 0) {
        /* creativeType
          101-纯文字带下载按钮
          102-大纯图片带下载按钮
          103-大纯图加文字带下载按钮
          106-视频加文字带下载按钮
          107-小纯图加文字带下载按钮
          108-三个小纯图加文字带下载按钮
        */
        let datas = []
        adList.slice(0, maxNum).forEach(val => { // 最多5个，最少1个
          if (val.creativeType > 100 && val.app) { // 下载类广告
            const adImg = (val.imgList && val.imgList[0]) ? val.imgList[0].url : ''
            datas.push({
              ...val,
              adName: val.app.appName || val.source,
              adImg: val.app.iconUrl || adImg,
              versionName: val.app.versionName,
              privacyLink: val.app.privacyLink,
              permissionUrl: val.app.permissionUrl,
              appDetailUrl: val.app.appDetailUrl,
              packageName: val.app.packageName,
              button: {
                status: APP_STATUS.DOWNLOAD,
                progress: 0,
                text: '安装',
                enabled: true,
              },
              slotId: this.slotId,
              uuid: this.uuid,
              nativeAd: this.nativeAd,
            })
            this.packageNames.push(val.app.packageName)
            this.appIds.push(val.adId)
          }
        })
        return datas
      }
    },
    reloadAd() { // 清空数据重新创建广告
      this.nativeAd = null
      this.adData = null
      this.packageNames = []
      this.appIds = []
      this.returnApps = []

      this.uuid = null
      this.callbackQuene = []
      this.adInView = false

      this.isCache = false
      this.isToCache = false
      this.isReq = false
      this.isToReq = false
      this.isToDialog = false
      this.hasLockDialog = false
      this.initLoad()
    },

    // 加载广告
    loadAd() {
      // 使用-点击复用广告
      if (this.downAds && this.downAds.length > 0) {
        this.log('开始请求-使用点击缓存广告', `${this.cid}_${this.pageIndex}`)
        this.isCache = true
        this.setLoadAd(this.downAds[0], this.downAds)
        return
      }
      // 使用-请求复用广告
      if (this.downAdReq && this.downAdReq.length > 0) {
        const reqAds = this.downAdReq[this.downAdReq.length - 1]
        if (reqAds.useNum > 0) {
          this.log('开始请求-使用点击缓存广告', `${this.cid}_${this.pageIndex}`)
          this.isReq = true
          this.$store.commit('adConfig/updateDownAdReq', { uuid: reqAds.uuid, type: 'use' })
          this.setLoadAd(reqAds.ad[0], reqAds.ad)
          return
        }
      }

      if (this.adLoading) {
        return;
      }
      this.log('开始请求', `${this.cid}_${this.pageIndex}`, this.slotId)
      this.adState = 11
      this.adLoading = true
      this.uuid = generateGUID()
      this.adReqTime = new Date().getTime()
      this.reportYuewen(0, 'reader_ad_request', 'ad_request')
      this.nativeAd.load()

      // 1s后未成功则切换插页广告
      this.toggleAd = true
      clearTimeout(this.timerToggle)
      this.timerToggle = setTimeout(() => {
        this.loadInsert()
      }, 1000)

      // 本地开发环境调试广告样式
      if (window.$config.debug) {
        clearTimeout(this.timerTest)
        this.timerTest = setTimeout(() => {
          this.log('请求成功', this.pageIndex);
          this.adLoading = false;
          const mockAdData3 = window.$debug.mockAdData3
          const adLists = this.getAdData([mockAdData3, window.$debug.mockAdData4, window.$debug.mockAdData5, window.$debug.mockAdData6])
          if (adLists && adLists.length > 0) {
            this.adLoadSuc(adLists)
          } else {
            this.log('跳过返回数据异常', mockAdData3.creativeType);
            this.reportYuewen(0, 'reader_ad_fail', 'ad_fail')
            if (this.toggleAd) {
              this.loadInsert()
            } else { // 返回数据异常直接跳过
              this.deleteAd()
            }
          }
        }, 900);
      }
    },
    loadInsert() { // 切换插页广告
      if (this.adState !== 12) { // 未请求成功
        this.log('请求超过1s用插页替换', this.pageIndex)
        clearTimeout(this.timerToggle)
        clearTimeout(this.timerTest)
        this.$emit('toggleAdType', this.ccid, this.adIndex)
      }
    },
    setLoadAd(downAdOne, ads) {
      this.slotId = downAdOne.slotId
      this.nativeAd = downAdOne.nativeAd // 重新创建广告
      this.uuid = downAdOne.uuid
      ads.forEach(val => {
        this.packageNames.push(val.packageName)
        this.appIds.push(val.adId)
      })
      this.adLoadSuc(ads)
    },
    // 广告加载成功
    onAdLoad() {
      this.nativeAd.onLoad((adList) => {
        this.log('请求成功', this.pageIndex, adList);
        this.adLoading = false;

        const adLists = this.getAdData(adList)
        if (adLists && adLists.length > 0) {
          this.adLoadSuc(adLists)

          this.getAdTime('req')
          this.reportEvent('LPADREQ', {
            cause: 'success',
            returnNum: adList.length,
            cost: this.adReqTime
          });
          this.reportEvent('LPADRESDTL', { adData: adLists[0] });
          this.reportYuewen(0, 'reader_ad_return', 'ad_return');
          return
        }

        this.log('跳过返回数据异常', adLists)
        this.getAdTime('req')
        this.reportYuewen(0, 'reader_ad_fail', 'ad_fail')
        if (this.toggleAd) {
          this.loadInsert()
        } else { // 返回数据异常直接跳过
          this.deleteAd()
        }
      });
    },
    adLoadSuc(datas) {
      this.adState = 12
      this.originData = true // 给父组件使用
      this.adData = datas
      this.$nextTick(() => {
        this.observeSection()
        if (!this.isCacheAd && this.nativeAd) {
          this.nativeAd.onStatusChanged(this.onStatusChanged);
          this.nativeAd.onDownloadProgress(this.onDownloadProgress);
          this.adData.forEach(val => {
            this.getAppStatus(val)
          })
        }
      })
      this.$emit('on-load')
    },
    onStatusChanged({ status, packageName }) { // 监听app状态变化
      this.log('状态变更:', packageName, status);
      if (this.packageNames.includes(packageName)) {
        this.updateData('status', packageName, status)
      }
    },
    onDownloadProgress({ progress, packageName }) { // 监听下载进度变化
      this.log('进度变更:', packageName, progress);
      if (this.packageNames.includes(packageName)) {
        this.updateData('progress', packageName, progress)
      }
    },
    async getAppStatus(val) { // 获取app的状态
      try {
        const statusApp = await this.nativeAd.getAppStatus({ adId: val.adId });
        this.updateData('status', val.adId, statusApp)
        this.log('获取状态:', statusApp);
      } catch (err) {
        this.log('获取状态失败:', err)
      }
    },
    updateData(type, appId, newVal) { // 更新数组数据
      // 等待中 => 下载中
      let theStatus = newVal
      if ([APP_STATUS.WAITING_FOR_WIFI, APP_STATUS.WAITING].includes(newVal)) {
        theStatus = APP_STATUS.DOWNLOADING
      }

      this.adData = this.adData.map((val, index) => {
        let status = val.button.status
        let progress = val.button.progress
        let isChange = false
        if (val.adId === appId || val.packageName === appId) {
          if (type === 'status' && status !== theStatus) {
            status = theStatus
            isChange = true
          }
          if (type === 'progress' && progress !== theStatus) {
            progress = theStatus
            isChange = true
          }
        }
        if (isChange) {
          const button = this.getButtonInfos(APP_STATUS, status, progress)
          val.button = { ...button, status }
          this.updateNext(val, index, status)
        }
        return val
      })
    },
    getButtonInfos(APP_STATUS, status, progress) {
      let button = getButtonInfo(APP_STATUS, status, progress, '打开')
      switch (status) {
        case APP_STATUS.DOWNLOAD: // 下载未开始，应用初始状态
          button.text = '安装'
          break;
        case APP_STATUS.DOWNLOADCANCELLED: // 下载取消
          button.text = '安装'
          break;
      }
      return button
    },
    updateNext(val, index, status) { // 进度、状态更新
      this.statusFn(status, index)

      // 更新-点击复用广告
      if (this.isToCache) {
        let cacheData = null
        if (status === APP_STATUS.DOWNLOADCANCELLED) {
          cacheData = this.adData.filter(item => ![APP_STATUS.DOWNLOAD, APP_STATUS.DOWNLOADCANCELLED].includes(item.button.status))
        }
        if (cacheData && cacheData.length <= 0) {
          // 取消下载后没有可缓存复用的数据，则后续不出复用广告
          this.setRepeatAd(false, [])
        } else {
          this.$store.commit('adConfig/setDownAds', this.adData)
        }
      }
      // 更新-请求复用广告
      if (this.isToReq) {
        this.$store.commit('adConfig/updateDownAdReq', {
          uuid: this.uuid,
          data: this.adData,
          type: 'update'
        })
      }
      // 更新-弹窗广告
      const theAdId = val.adId
      if (this.downAdDataApps.includes(theAdId)) {
        if (status === APP_STATUS.DOWNLOADCANCELLED) { // 下载取消-删除弹窗广告数据
          this.$store.commit('adConfig/setDownAdDatas', {
            type: 'delete',
            appId: [theAdId]
          })
        } else {
          this.$store.commit('adConfig/setDownAdDatas', {
            type: 'update',
            appId: theAdId,
            button: val.button
          })
        }
      }
      // 管理栏状态变更
      if (this.downAdBar.type === 'down' && status === APP_STATUS.INSTALLED) {
        this.$store.commit('adConfig/setDownAdBar', { type: 'open' })
      }
    },
    statusFn(status, index) { // 状态函数
      switch (status) {
        case APP_STATUS.RESUME: // 继续下载
        case APP_STATUS.DOWNLOADING: // 下载中
        case APP_STATUS.WAITING_FOR_WIFI: // 等待Wifi下载
        case APP_STATUS.WAITING: // 下载等待中
        case APP_STATUS.INSTALL: // 等待安装
        case APP_STATUS.INSTALLING: // 安装中
          this.setCacheAd(index)
          break;
        case APP_STATUS.PAUSE: // 下载暂停
          this.reportDownAd(index, 2)
          break;
        case APP_STATUS.DOWNLOADCANCELLED: // 下载取消
          this.reportDownAd(index, 3)
          break;
        case APP_STATUS.DOWNLOADFAILED: // 下载失败
          this.reportDownAd(index, 4)
          break;
        case APP_STATUS.DOWNLOADED: // 下载成功
          this.reportDownAd(index, 5)
          this.setCacheAd(index)
          break;
        case APP_STATUS.INSTALLED: // 安装完成
          this.reportDownAd(index, 6)
          this.setCacheAd(index)
          break;
      }
    },
    setCacheAd(index) { // 设置点击复用广告集合、弹窗广告集合
      // 需要在广告曝光后设置
      if (!this.adInView) {
        this.returnApps.push(this.adData[index].adId)
        return
      }
      // 缓存广告不推入数据
      if (this.isCacheAd) {
        return
      }

      // 推入缓存集合-点击复用广告
      if (!this.isToCache && !window.$config.downToCache) { // 存全局确保只有一个点击复用广告源
        this.setRepeatAd(true, this.adData)
      }

      // 推入-弹窗广告
      const theData = this.adData[index]
      if (theData && !this.downAdDataApps.includes(theData.adId)) {
        this.isToDialog = true
        this.$store.commit('adConfig/setDownAdDatas', {
          type: 'push',
          appId: theData.adId,
          data: theData
        })
      }
    },
    setRepeatAd(bool, data) { // 点击复用广告
      window.$config.downToCache = bool
      this.isToCache = bool
      this.$store.commit('adConfig/setDownAds', data)
    },
    setReqAd(bool, data) { // 推入请求复用广告集合-请求复用广告
      this.isToReq = bool
      if (data) {
        this.$store.commit('adConfig/updateDownAdReq', { data, uuid: this.uuid, type: 'push' })
      } else {
        this.$store.commit('adConfig/updateDownAdReq', { uuid: this.uuid, type: 'delete' })
      }
    },
    reportDownAd(index, num) { // 下载按钮状态变化上报
      // 复用广告只上报点击打开事件
      if (!this.isCacheAd || (this.isCacheAd && num === 7)) {
        this.reportDownNum = num
        this.reportYuewen(index, 'reader_ad_down_changed', 'changed')
      }
    },
    // 广告加载失败
    onAdError() {
      this.nativeAd.onError(errorCode => {
        this.log('请求失败', this.pageIndex, errorCode);
        this.adLoading = false;

        this.adState = 13
        this.getAdTime('req')
        this.reportEvent('LPADREQ', {
          errorCode,
          cause: 'fail',
          returnNum: 0,
          cost: this.adReqTime
        });
        this.reportYuewen(0, 'reader_ad_error', 'ad_error', errorCode);
        if (this.toggleAd) {
          this.loadInsert()
        } else {
          this.deleteAd()
        }
      });
    },
    // 监听节点曝光
    observeSection() {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((el) => {
            if (el.intersectionRatio > 0) {
              if (el.isIntersecting) {
                this.log('曝光', this.pageIndex)
                this.showFn()
              }
            }
          });
        },
        {
          rootMargin: '0px 0px 0px 0px',
          threshold: 0.5, // 元素出现的阈值，当元素出现比例为0.5时，触发一次监听
        },
      );
      const nativeAdRef = this.$refs.downAd;
      nativeAdRef && this.observer.observe(nativeAdRef);
    },
    showFn() {
      // 锁定页面，目前只做横翻锁定
      if (this.downAdLock && this.pageMode === 'horizontal') {
        this.setLock(true)

        // 数据上报
        this.$emit('reportYw', {
          eventId: 'reader_download_continueReading_shown',
          eventCode: 'shown',
          eventInfo: {
            ad_name: AD_TYPE.DOWNAD,
          },
        })
      }

      // 消耗展示次数，1个广告只算1次
      if (!this.adInView) {
        const now = new Date() * 1
        let useConfig = getDownAdUseConfig()
        if (useConfig) {
          useConfig.num = useConfig.num + 1
          useConfig.time = useConfig.time || now
        } else {
          useConfig = { num: 1, time: now }
        }
        setDownAdUseConfig(useConfig)
        this.setDownAdIndex()
      }

      this.adInView = true;
      this.adData.forEach((val, index) => {
        const adId = val.adId
        // 如果设置缓存被 adInView 拦截过需要再同步1次
        if (!this.isCacheAd && this.returnApps.length > 0 && this.returnApps.includes(adId)) {
          this.returnApps = this.returnApps.filter(val => val !== adId)
          this.statusFn(val.button.status, index)
        }
        // 数据上报
        this.reportEvent('LPAR', { adData: val, cause: 'exposure' });
        this.reportYuewen(index, 'reader_ad_shown', 'ad_shown');
        this.nativeAd.reportAdShow({ adId });
      })
      // 页面曝光事件上报
      this.reportYuewen(0, 'reader_download_wholePage_shown', 'shown');

      // 非缓存+未缓存+有请求复用-请求复用广告
      if (!this.isCacheAd && !this.isToCacheAd && this.downAdReqNum) {
        this.setReqAd(true, this.adData)
      }
    },
    setDownAdIndex() { // 一个广告位一个预设
      if (!this.hasSetIndex) {
        this.hasSetIndex = true
        if (window.$config.downAdIndex > 0) {
           window.$config.downAdIndex -= 1 // 预设减1
        }
      }
    },
    // 广告被点击
    clickDownAd(item, index) { // 广告被点击-下载按钮
      // 广告点击上报
      this.reportEvent('LPAR', { adData: item, cause: 'click' });
      this.reportYuewen(index, 'reader_ad_clicked', 'ad_clicked');
      this.log('下载按钮被点击', item.button.status)
    },
    onReward(item) { // 点击打开广告-获取免广权益
      if (this.theLockIng) {
        this.setLock(false)
      }
      this.$emit('on-reward', {
        blockType: HWAD_TYPE.DOWNAD,
        rewardTime: this.downAdConfig.time,
        adData: item,
        reason: 2
      })
    },
    getAdTime() { // 广告请求时间差
      if (![12, 13].includes(this.adState)) { // 丢弃非正常的数据
        this.adReqTime = 0
        return
      }
      this.adReqTime = getDisTime(this.adReqTime)
    },
    deleteAd(type) { // 移除广告
      this.destroyAd()
      if (type === 'close') {
        this.$emit('on-close', ADNAME)
      } else {
        this.$emit('on-error', ADNAME)
      }
    },
    destroyAd() {
      clearTimeout(this.timerToggle)
      clearTimeout(this.timerTest)
      this.setDownAdIndex()
      if (this.adData) {
        // 屏幕大小变化、字号变化、横竖翻切换、切目录、章节自动删除等导致已下载完成未打开的源头广告被销毁，出权益领取弹窗
        if (this.adData.length > 0 && !this.isCacheAd) {
          const installs = this.adData.filter(val => val.button.status === APP_STATUS.INSTALLED)
          if (installs.length > 0) {
            if (!this.rewardFree) {
              this.$emit('setDownDialog', {
                showDialog: true, // 弹窗弹出
                dialogType: 'auto', // 权益自动领取弹窗
                adData: [], // 广告数据
                destroy: true,
              })
            }
          }
        }
        // 删除-点击复用广告
        if (this.isToCache) {
          this.setRepeatAd(false, null)
        }
        // 删除-请求复用广告
        if (this.isToReq) {
          this.setReqAd(false, null)
        }
        // 删除-弹窗广告
        if (this.isToDialog) {
          this.$store.commit('adConfig/setDownAdDatas', {
            type: 'delete',
            appId: this.appIds
          })
        }
        // 被销毁需要重置状态-锁定
        if (this.theLockIng && this.controlLockAd.lockDownIng) {
          this.setLock(false)
        }
        // 状态、进度 sdk 全局监听，不需要取消
        if (this.nativeAd && !this.isCacheAd) {
          this.nativeAd.offStatusChanged();
          this.nativeAd.offDownloadProgress();
        }
      }
      if (this.nativeAd) {
        this.nativeAd.offLoad();
        this.nativeAd.offError();
        this.nativeAd.destroy();
      }
      this.nativeAd = null
      this.adData = null
    },

    toLink(fn, adId) { // 外链跳转
      // 控制按钮点击频率
      if (this.clickTag) {
        return
      }
      this.clickTag = true
      setTimeout(() => {
        this.clickTag = false
      }, 800)

      this.nativeAd[fn]({ adId })
    },
    setLock(bool) { // 设置锁定状态-锁定
      window.$config.downLockCcid = bool ? this.ccid : ''
      this.$store.commit('adConfig/setControlLockAd', { lockDownIng: bool })
      this.theLockIng = bool
    },
    handleNext() { // 拦截继续阅读点击
      let type = 2
      if (this.hasLockDialog) { // 已出过一次弹窗的直接跳过
        this.$emit('closeDownDialog', 'skip')
      } else {
        const downDatas = this.adData.filter(val => val.button.status === APP_STATUS.INSTALLED)
        if (downDatas.length > 0) { // 打开弹窗
          type = 1
          this.$emit('setDownDialog', {
            showDialog: true, // 弹窗弹出
            dialogType: 'open', // 权益领取弹窗
            adData: downDatas, // 广告数据
          })
          this.hasLockDialog = true
        } else { // 解除锁定状态-锁定
          this.$emit('closeDownDialog', 'skip')
        }
      }

      // 数据上报
      this.$emit('reportYw', {
        eventId: 'reader_download_continueReading_clicked',
        eventCode: 'clicked',
        eventInfo: {
          ad_name: AD_TYPE.DOWNAD,
          ext1: type, // 1-出弹窗 2-跳过弹窗翻到下一页
        },
      })
    },

    reportEvent(eventType, eventInfo) { // 上报华为广告事件
      const event = {
        ...eventInfo,
        adSlotId: this.slotId,
        pageIndex: this.pageIndex,
        reqId: this.uuid,
        blockType: HWAD_TYPE.DOWNAD,
      };
      this.$emit('reportHw', { eventType, event })
    },
    reportYuewen(index, eventId, eventCode, errorCode) { // 上报阅文埋点
      const event = {
        eventId,
        eventCode,
        eventInfo: {
          ad_type: this.isCacheAd ? 1 : 2, // 1-非物理广告 2-物理广告
          ad_name: AD_TYPE.DOWNAD,
          chap_no: this.ccid,
          adid: this.slotId,
          ext4: this.uuid,
        },
      };

      if (this.adData) {
        const { adName, adId, interactionType } = this.adData[index];
        event.eventInfo = {
          ...event.eventInfo,
          ext1: adName,
          ext2: adId,
          ext3: interactionType,
          ext6: 0
        };
      }
      if (errorCode) {
        event.eventInfo.error_code = errorCode;
      }
      // 广告曝光或者广告点击时，需要上报是否开启左滑点击事件
      if (eventCode === 'ad_shown' || eventCode === 'ad_clicked') {
        event.eventInfo.cl = '0'
      }
      // 广告点击上报 0-滑动触发 1-点击触发
      if (eventCode === 'ad_clicked') {
        event.eventInfo.ext7 = '1'
      }
      // 下载按钮状态变化上报
      if (eventCode === 'changed') {
        event.eventInfo.ext8 = this.reportDownNum
      }
      // 广告请求耗时上报
      if (['reader_ad_return', 'reader_ad_fail', 'reader_ad_error'].includes(eventId)) {
        event.eventInfo.time_consuming = this.adReqTime
      }
      this.$emit('reportYw', event)
    },
    log(name, ...msg) {
      console.log(`${ADNAME}-${name}`, ...msg);
    },
  },
  // 组件销毁时，卸载监听事件
  beforeDestroy() {
    this.destroyAd()
  },
};
</script>

<style lang="scss" scoped>
@import './index.scss';
@import './aditem.scss';
</style>
