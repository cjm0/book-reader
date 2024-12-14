<template>
  <div
    :class="[
      'reward_index',
      isNewUI && 'reward_index_new',
      isChapterBottom && 'reward_index_bottom reward_maxwidth',
      isFirstCpAd && 'reward_index_first',
    ]"
  >
    <template v-if="!isFirstCpAd">
      <div
        ref="rewardAdText"
        class="reward_text"
        @click.stop="loadAd"
        v-if="!isNewUI"
      >
        {{rewardAdConfig.rewardText}}
        <svg-icon icon-class="ic_public_arrow_right" class="arrow"/>
      </div>
      <div
        ref="rewardAdText"
        :class="['reward_text_new', isDark ? 'reward_text_new_dark' : '', adwidth ? '' : 'reward_maxwidth'] "
        :style="{'max-width': adwidth ? adwidth + 'px' : ''}"
        @click.stop="loadAd"
        v-if="isNewUI"
      >
        <div class="ad_wrap">
          <img src="./ad.png" class="ad_img" @contextmenu.prevent>
          <div class="ad_text_wrap">
            <p class="tit">看视频免 {{ rewardAdConfig.rewardTime }} 分钟广告</p>
            <p class="desc">{{ rewardAdConfig.rewardTime }} 分钟后可重复领取</p>
          </div>
        </div>
        <div class="ad_btn">去看视频</div>
      </div>
    </template>
    <div class="empty" @click.stop="loadAd" v-if="isFirstCpAd"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import IntersectionObserver from 'intersection-observer-polyfill';
import { generateGUID, toast, trimAll, getDisTime } from '@/utils/helpers';
import jsbridge from '@/utils/jsbridge';
import { logUserBehavior } from '@/service';
import { HWAD_TYPE, AD_TYPE } from '@/constants'

export default {
  name: 'RewardAd',
  props: {
    posType: { // 激励视频入口：1-章首弹窗 2-章首固底 3-插页 4-章尾
      type: Number,
      default: 0,
    },
    blockType: { // 区分章末 or 非章末（插页、章首弹窗、章首固底）
      type: String,
      default: HWAD_TYPE.INSERT, // HWAD_TYPE.INSERT、HWAD_TYPE.REWARD
    },
    ccid: {
      type: String,
      default: '',
    },
    pageIndex: {
      type: Number,
      default: 0,
    },
    adwidth: {
      type: Number,
      default: 0,
    },
    openInsert: { // 插页广告点击中，限制激励视频
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isGetReward: false,

      // 注释掉无关视图变量
      // observer: null,
      // adPos: 2, // 1-非物理广告 2-物理广告
      // adReqTime: 0, // 广告请求、渲染耗时
    };
  },
  computed: {
    ...mapGetters([
      'theme',
      'novelInsideAdConfig',
      'chapterBottomAdConfig',
      'adPrivacy',
      'rewardAdNewStyle'
    ]),
    isDark() {
      return this.theme.theme === 'dark'
    },
    isFirstCpAd() { // 是否章首视频广告
      return [1, 2].includes(this.posType)
    },
    isChapterBottom() { // 是否章末广告
      return !this.isFirstCpAd && (this.blockType === HWAD_TYPE.REWARD)
    },
    isNewUI() { // 只有插页视频广告、章末广告用新样式
      if (this.rewardAdNewStyle && !this.isFirstCpAd) {
        return true
      }
      return false
    },
    rewardAdConfig() {
      return this.isChapterBottom
        ? this.chapterBottomAdConfig.rewardAdConfig
        : this.novelInsideAdConfig.rewardAdConfig;
    },
    cpIdCode() {
      return this.isChapterBottom
        ? this.chapterBottomAdConfig.cpIdCode
        : this.novelInsideAdConfig.cpIdCode;
    },
  },
  created() {
    this.createRewardAd();
  },
  mounted() {
    if (this.isFirstCpAd) {
      this.reportShow()
    } else {
      this.observeSection()
    }
    this.textReqId = generateGUID();
  },
  methods: {
    createRewardAd() {
      this.slotId = trimAll(this.rewardAdConfig.rewardSlotId)
      try {
        window.ppsads.ready(() => {
          try {
            this.rewardAd = window.ppsads.createRewardAd({
              slotId: this.slotId,
              cpIdCode: this.cpIdCode,
            });
          } catch (error) {
            this.reportErr('createNativeAd', error)
            return
          }

          this.setRequestConfig(this.cpIdCode);
          this.onAdLoad();
          this.onAdError();
          this.onAdShow();
          this.onAdReward();
          this.onAdClose()
        })
      } catch (error) {
        this.reportErr('ready', error)
      }
    },
    reportErr(method, err) { // 初始化报错上报
      const event = {
        eventId: 'reader_ads_error',
        eventCode: 'error',
        eventInfo: {
          ext1: method,
          ext2: err && err.message,
          ad_name: AD_TYPE.REWARD,
        },
      };
      logUserBehavior('reportYw', event)
    },
    // 设置广告个性化请求相关参数
    setRequestConfig(cpIdCode) {
      const { adConsentFlag, hwDspNpa, thirdDspNpa } = this.adPrivacy;
      this.rewardAd.setRequestConfig({
        requestLocation: false, // 设置请求时是否携带位置信息，默认携带
        nonPersonalizedAd: adConsentFlag, // 是否请求非个性化广告。
        hwNonPersonalizedAd: hwDspNpa, // 是否请求华为DSP非个性化广告。
        thirdNonPersonalizedAd: thirdDspNpa, // 是否请求三方DSP非个性化广告。
        extras: {
          cpIdCode,
        },
      });
    },
    // 加载激励视频广告
    loadAd() {
      // 插页广告点击中，限制激励视频 1s 内不可点击
      if (this.openInsert) {
        return
      }
      if (this.isJumping) {
        return
      }
      this.isJumping = true
      this.$emit('rewardLoad')

      this.adPos = this.adPos ? 1 : 2 // 第1次点算物理广告位，第2次以上就是非物理广告位
      this.adReqId = generateGUID()
      this.adReqTime = new Date().getTime()
      this.reportYuewen('reader_ad_request', 'ad_request')
      this.rewardAd.load()

      this.reportEvent('LPAR', {
        cause: 'rewardTextClick',
      });
      this.reportYuewen('reader_videoText_clicked', 'clicked');

      if (window.$config.debug) {
        setTimeout(() => {
          this.isJumping = false
          this.$emit('on-reward', {
            blockType: this.blockType,
            rewardTime: this.rewardAdConfig.rewardTime,
            adData: this.adData,
            reason: 1
          })
          toast(`已开启${this.rewardAdConfig.rewardTime}分钟免广告模式`);
        }, 1000);
      }
    },
    // 激励视频加载完成
    onAdLoad() {
      this.rewardAd.onLoad((data) => {
        console.log('激励视频广告加载完成+++++++', data);
        this.adData = data

        this.getAdTime('req')
        this.reportEvent('LPADREQ', {
          cause: 'success',
          returnNum: 1,
          cost: this.adReqTime
        });
        this.reportEvent('LPADRESDTL');
        this.reportYuewen('reader_ad_return', 'ad_return');

        this.rewardAd.show()
      });
    },
    // 激励视频加载失败
    onAdError() {
      this.rewardAd.onError((errorCode) => {
        console.log('激励视频加载失败+++++', errorCode)
        this.isJumping = false

        toast('小编正在获取资源，稍后请重试')
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
    // 监听激励视频曝光
    onAdShow() {
      this.rewardAd.onShow(() => {
        this.reportEvent('LPAR', {
          cause: 'exposure',
        });
        this.reportYuewen('reader_ad_shown', 'ad_shown');
      });
    },
    // 监听激励视频获得奖励
    onAdReward() {
      this.rewardAd.onReward(() => {
        this.isJumping = false
        this.isGetReward = true

        // 上报点击事件
        this.reportEvent('LPAR', {
          cause: 'click',
        });
        this.reportYuewen('reader_videoText_gain', 'gain')
      });
    },
    // 监听广告关闭
    onAdClose() {
      this.rewardAd.onClose(() => {
        this.isJumping = false
        if (this.isGetReward) {
          toast(`恭喜，你已成功免广告${this.rewardAdConfig.rewardTime}分钟`);
          this.$emit('on-reward', {
            blockType: this.blockType,
            rewardTime: this.rewardAdConfig.rewardTime,
            adData: this.adData,
            reason: 1
          })
          this.reportYuewen('reader_videoText_gain_close', 'gain_close')
        } else {
          toast(`视频未播完，不能免广告${this.rewardAdConfig.rewardTime}分钟`);
          this.reportEvent('LPAMP')
          this.reportYuewen('reader_videoText_Ngain_close', 'Ngain_close')
        }
      });
    },
    // 监听文字链曝光
    observeSection() {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((el) => {
            if (el.intersectionRatio > 0 && el.isIntersecting) {
              this.reportShow()
            }
          });
        },
        {
          rootMargin: '0px 0px 0px 0px',
          threshold: 0.1, // 元素出现的阈值，当元素出现比例为0.1时，触发一次监听
        }
      );
      const rewardAdText = this.$refs.rewardAdText;
      rewardAdText && this.observer.observe(rewardAdText);
    },
    reportShow() { // 曝光上报
      console.log('激励视频文字链曝光');
      this.reportEvent('LPAR', {
        cause: 'rewardTextExposure',
      });
      this.reportYuewen('reader_videoText_shown', 'shown');
    },

    // 数据上报
    getAdTime(type) { // 广告请求、渲染时间差
      const time = type === 'req' ? this.adReqTime : this.adRenderTime
      const typeTime = type === 'req' ? 'adReqTime' : 'adRenderTime'
      this[typeTime] = getDisTime(time)
    },
    reportEvent(eventType, eventInfo = {}) { // 上报华为广告事件
      this.$emit('getCurPage')
      setTimeout(() => { // 延迟到 pageIndex 数据更新后再执行
        const isTextEvent = eventInfo.cause === 'rewardTextClick' || eventInfo.cause === 'rewardTextExposure'
        const event = {
          ...eventInfo,
          adSlotId: this.slotId,
          pageIndex: this.pageIndex,
          reqId: isTextEvent ? this.textReqId : this.adReqId,
          blockType: this.isFirstCpAd ? HWAD_TYPE.REWARD : this.blockType,
        };
        jsbridge.commitAdEvent(eventType, event);
      })
    },
    reportYuewen(eventId, eventCode, errorCode) { // 上报阅文埋点
      const adType = AD_TYPE.REWARD // 27
      const event = {
        eventId,
        eventCode,
        eventInfo: {
          ad_type: this.adPos || 2,
          ad_name: adType,
          chap_no: this.ccid,
          adid: this.slotId,
          ext4: this.adReqId,
          ext8: this.isNewUI ? `${adType}_1` : `${adType}_0`, // 1-新样式 0-旧样式
          ext9: `${adType}_${this.posType}`, // 激励视频入口
        },
      };
      if (errorCode) {
        event.eventInfo.ext5 = errorCode;
      }
      // 广告请求、广告渲染上报耗时
      if (['reader_ad_return', 'reader_ad_error'].includes(eventId)) {
        event.eventInfo.time_consuming = this.adReqTime
      }
      logUserBehavior(event);
    },
  },
  // 组件销毁时，卸载监听事件
  beforeDestroy() {
    if (this.rewardAd) {
      this.rewardAd.offLoad();
      this.rewardAd.offError();
      this.rewardAd.offShow();
      this.rewardAd.offReward();
      this.rewardAd.offClose()
      this.rewardAd.destroy();
    }
  },
};
</script>

<style lang="scss" scoped>
.reward_index{
  margin-top: 25px;
  line-height: 1 !important;
}
.reward_text{
  display: flex;
  align-items: center;
  font-weight: 500;
  @include fontSize(16px);
  @include lineHeight(24px);
  color: var(--color-theme);
  .arrow{
    width: 12px;
    height: 24px;
    margin-left: 4px;
    color: var(--color-theme);
  }
}

.reward_index_new{
  margin-top: 16px;
  width: 100%;
  display: flex;
  justify-content: center;
  .reward_text_new {
    width: 100%;
    height: 64px;
    padding: 12px 16px;
    border-radius: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--color-button-border);
    .ad_wrap{
      margin-right: 8px;
      flex: 1;
      overflow: hidden;
      display: flex;
      align-items: center;
      .ad_img{
        margin-right: 4px;
        width: 40px;
        height: 40px;
      }
      .ad_text_wrap{
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .tit{
          @include text-ellipsis(1);
          @include fontSize(14px);
          font-weight: 500;
          color: #000;
        }
        .desc{
          margin-top: 4px;
          @include text-ellipsis(1);
          @include fontSize(12px);
          color: var(--color-4);
        }
      }
    }
    .ad_btn{
      display: flex;
      justify-content: center;
      align-items: center;
      width: 68px;
      height: 28px;
      border-radius: 16px;
      background-color: #CB8635;

      @include fontSize(12px);
      font-weight: 500;
      color: #fff;
    }
  }
  .reward_text_new_dark{
    .ad_wrap{
      .ad_text_wrap{
        .tit{
          color: rgba(255, 255, 255, 0.45);
        }
      }
    }
    .ad_btn{
      background-color: #9B6A2E;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

.reward_index_bottom{
  margin: 25px auto 16px;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: flex-end;
  .reward_text{
    margin: 0 auto;
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
    background: var(--color-ad-bg);
  }
}

.reward_index_first{
  margin-top: 0;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  opacity: 0;
  .empty{
    height: 100%;
  }
}

.reward_maxwidth{
  @include mediaScreen('hw_fold') {
    max-width: 562px;
  }
  @include mediaScreen('hw_pad') {
    max-width: 708px;
  }
}
</style>
