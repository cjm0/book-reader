<!--
 * @Description : 激励下载广告-互动弹窗 DownDialog
 * @Author      : chenjianmin
 * @Date        : 2023-12-20 18:18:56
-->
<template>
  <van-overlay
    :show="show"
    :style="{'background-color': 'rgba(0,0,0,0.2)'}"
    z-index="1100"
    @click.stop
  >
    <div
      :class="[isHmArk ? 'is_hm_ark' : 'down_dialog_index', isDark && 'down_dialog_dark']"
      :style="{'width': innerWidth + 'px'}"
    >
      <div class="cont">
        <div class="inner">
          <template v-if="type !== 'list'">
            <div class="tit_wrap">
              <span class="tit mr6" v-if="hasCancel">打开应用即享</span>
              <span class="tit mr6" v-if="isAuto">领取</span>
              <p class="tit_wrap2">
                <img class="img_left" :src="isDark ? require('@/assets/images/ad-down/dialog_left_dark.png') : require('@/assets/images/ad-down/dialog_left.png')" @contextmenu.prevent /><span class="tit_active">免广畅读权益</span><img class="img_right" :src="isDark ? require('@/assets/images/ad-down/dialog_right_dark.png') : require('@/assets/images/ad-down/dialog_right.png')" @contextmenu.prevent />
              </p>
               <span class="tit ml6" v-if="hasTime">{{ type === 'active' ? '生效中' : '权益已开启'}}</span>
            </div>
            <template v-if="hasCancel">
              <p class="tip mt16">您还未打开已下载的应用，</p>
              <p class="tip">打开后即可领取 {{ getTimeText.time }} {{ getTimeText.text }}免广权益</p>
              <p class="btn" @click="openAd">去打开<img class="icon" :src="adData[0]?.adImg" @contextmenu.prevent /></p>
              <p class="cancel" @click="handleCancel">{{ type === 'open' ? '放弃权益' : '退出阅读'}}</p>
            </template>
            <template v-if="isAuto">
              <p class="tip mt16">您有一份免广告畅读权益未领取</p>
              <p class="btn" @click="openAd">立即领取</p>
              <p class="cancel" @click="handleCancel">放弃权益</p>
            </template>
            <template v-if="type === 'start'">
              <p class="tip mt16">恭喜，你已开启 {{ getTimeText.time }} {{ getTimeText.text }}免广权益！</p>
              <p class="time mt8">有效期至: {{ effectTime }}</p>
            </template>
            <template v-if="type === 'active'">
              <p class="time mt16">免广权益还剩：{{ getLastTime.time }}{{ getLastTime.text }}</p>
            </template>
            <p class="btn" v-if="hasTime" @click="handleCancel">我知道了</p>
          </template>
          <template v-if="type === 'list'">
            <p class="tit_wrap mb16">
              <span class="tit">打开应用免 {{ getTimeText.time }} {{ getTimeText.text }}广告</span>
            </p>
            <div class="ad_item" v-for="(item, index) in adDatas" :key="item.adId">
              <div class="ad_cont">
                <ImageBox class="ad_logo" :url="item.adImg"/>
                <div class="ad_info">
                  <p class="ad_tit">{{ item.adName }}</p>
                  <p class="ad_desc">{{ item.app.developerName }}</p>
                  <p class="ad_link_wrap">
                    <span class="ad_version" v-if="item.versionName">{{ item.versionName }}</span>
                    <span class="ad_link_line" v-if="item.versionName && (item.privacyLink || item.permissionUrl || item.appDetailUrl)"></span>
                    <span class="ad_text" @click="toLink('showAppDetailPage', item)" v-if="item.appDetailUrl">介绍</span>
                    <span class="ad_link_line" v-if="item.appDetailUrl && (item.permissionUrl || item.privacyLink)"></span>
                    <span class="ad_text" @click="toLink('showPrivacyPolicyInWeb', item)" v-if="item.privacyLink">隐私</span>
                    <span class="ad_link_line" v-if="item.privacyLink && item.permissionUrl"></span>
                    <span class="ad_text" @click="toLink('showPermissionPageInWeb', item)" v-if="item.permissionUrl">权限</span>
                  </p>
                </div>
              </div>
              <DownButtom
                :nativeAd="item.nativeAd"
                :adData="item"
                :theme="theme"
                btnType="dialog"
                @clickDownAd="clickDownAd(item)"
                @onReward="onReward(item)"
                @reportDownAd="reportDownAd(index, $event)"
              />
            </div>
          </template>
        </div>

        <img class="bg_img_top" :src="isDark ? require('@/assets/images/ad-down/top_dark.png') : require('@/assets/images/ad-down/top.png')" @contextmenu.prevent />
        <img class="bg_img_bottom" :src="isDark ? require('@/assets/images/ad-down/bottom_dark.png') : require('@/assets/images/ad-down/bottom.png')" @contextmenu.prevent />
        <img class="img_close" :src="isDark ? require('@/assets/images/ad-down/dialog_close_dark.png') : require('@/assets/images/ad-down/dialog_close.png')" @click="handleCancel" @contextmenu.prevent v-if="!isAuto" />
      </div>
    </div>
  </van-overlay>
</template>

<script>
import DownButtom from '../DownAd/down-buttom.vue';
import ImageBox from '../ImageBox';

import { mapGetters } from 'vuex';
import { getTransTime, formatDate, getGap } from '@/utils/helpers';
import { HWAD_TYPE, AD_TYPE } from '@/constants';
import jsbridge from '@/utils/jsbridge';
import { logUserBehavior } from '@/service';

// 弹窗类型：1-权益领取弹窗 2-退出拦截弹窗 3-权益生效中弹窗 4-权益已开启弹窗 5-应用列表弹窗 6-权益自动领取弹窗
const mapType = {
  open: 1,
  out: 2,
  active: 3,
  start: 4,
  list: 5,
  auto: 6
}
export default {
  name: 'DownDialog',
  components: {
    DownButtom,
    ImageBox,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    /*
      open-权益领取弹窗
      out-退出拦截弹窗
      active-权益生效中弹窗
      start-权益已开启弹窗
      list-应用列表弹窗
     */
    type: {
      type: String,
      default: '',
    },
    adData: {
      type: Array,
      default: () => [],
    },
    adReportType: {
      type: String,
      default: '',
    },
    ccid: { // 当前章节 id
      type: String,
      default: '',
    },
    pageIndex: {
      type: Number,
      default: 0,
    },
    clientWidth: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      // 注释掉无关视图变量
      // dialogNum: 0, // 弹窗类型
      // reportDownNum: 0, // 下载按钮状态变化上报
      // clickTag: '', // 控制下载按钮点击上报频率
    };
  },
  computed: {
    ...mapGetters(['theme', 'rewardInfo', 'rewardTimeGap', 'downAdConfig', 'downAdDatas', 'insertAdConfig', 'isHmArk']),
    isDark() {
      return this.theme.theme === 'dark'
    },
    innerWidth() { // 弹窗宽度
      const padding = getGap(this.clientWidth)
      return this.clientWidth - padding * 2;
    },
    adDatas() { // 展示去掉 packageName 重复的 app
      return this.uniqueFunc(this.downAdDatas, 'packageName')
    },
    isAuto() { // 权益自动领取弹窗
      return this.type === 'auto'
    },
    hasCancel() {
      return this.type === 'open' || this.type === 'out'
    },
    hasTime() {
      return this.type === 'active' || this.type === 'start'
    },
    configTime() { // 免广时间
      let time = this.downAdConfig?.time
      if (this.adReportType === AD_TYPE.INSERTREWARD) { // 激励插页广告
        time = this.insertAdConfig?.time
      }
      return time || 0
    },
    getTimeText() { // 时间展示
      return getTransTime(this.configTime)
    },
    effectTime() { // 有效期
      if (this.type === 'start') {
        const minut = new Date().setMinutes(new Date().getMinutes() + this.configTime)
        return formatDate(new Date(minut), 'yyyy年MM月dd日HH时mm分')
      }
      return ''
    },
    getLastTime() { // 剩余时间
      const { rewardTime = 0, startTime = 0 } = this.rewardInfo || {}
      const now = new Date().getTime() + this.rewardTimeGap // 加上时间差
      let timeDiff = rewardTime - Math.abs((now - startTime) / 1000 / 60)
      timeDiff = timeDiff <= 0 ? 1 : Math.ceil(timeDiff)
      return getTransTime(timeDiff)
    },
  },
  watch: {
    type: {
      handler(val) {
        if (val) {
          const dialogNum = mapType[val]
          if (dialogNum) {
            this.dialogNum = dialogNum

            let obj = {}
            if (dialogNum === 4) { // 获取权益区分
              obj = {
                // 通过 ad_name 区分弹窗：26-激励下载广告 29-激励插页广告
                ad_name: this.adReportType || AD_TYPE.DOWNAD,
              }
            }
            logUserBehavior({
              eventId: 'reader_incentiveDownload_pop_shown',
              eventCode: 'shown',
              eventInfo: {
                ...obj,
                ext1: dialogNum
              }
            })
          }
          if (this.show && dialogNum === 5) {
            this.showFn()
          }
        }
      },
      immediate: true
    },
  },

  methods: {
    uniqueFunc(arr, uniId) { // 对象数组去重
      const res = new Map();
      return arr.filter((item) => !res.has(item[uniId]) && res.set(item[uniId], 1));
    },
    openAd() { // 点击打开广告
      this.reportBtnClick(1) // 点击数据上报

      const theData = this.adData[0]
      if (!this.isAuto) {
        // 打开广告
        theData.nativeAd.startDownload({ adId: theData.adId })
        this.reportDownAd(0, 7)
      }
      // 获取免广权益
      this.$emit('closeDownDialog', 'reward', theData)
    },
    handleCancel() { // 取消关闭弹窗
      this.$emit('closeDownDialog', this.type)
      this.reportBtnClick(0)
    },

    showFn() { // 列表广告曝光上报
      this.adDatas.forEach((val) => {
        this.reportEvent(val, 'LPAR', { adData: val, cause: 'exposure' });
        this.reportYuewen(val, 'reader_ad_shown', 'ad_shown');
        val.nativeAd.reportAdShow({ adId: val.adId });
      })
    },
    toLink(fn, item) { // 外链跳转
      // 控制按钮点击频率
      if (this.clickTag) {
        return
      }
      this.clickTag = true
      setTimeout(() => {
        this.clickTag = false
      }, 800)

      item.nativeAd[fn]({ adId: item.adId })
    },
    clickDownAd(item) { // 下载按钮被点击
      if (this.clickTag) {
        return
      }
      this.clickTag = true
      setTimeout(() => {
        this.clickTag = false
      }, 250)

      // 广告点击上报
      this.reportEvent(item, 'LPAR', { adData: item, cause: 'click' });
      this.reportYuewen(item, 'reader_ad_clicked', 'ad_clicked');
      console.log('激励下载广告-下载按钮被点击', item.button.status)
    },
    onReward(item) { // 获取免广权益-点击打开广告
      this.$emit('getReward', item)
      this.reportBtnClick(1)
    },
    reportDownAd(index, num) { // 点击打开上报
      if (num === 7) {
        this.reportDownNum = num
        this.reportYuewen(this.adDatas[index], 'reader_ad_down_changed', 'changed')
      }
    },
    reportBtnClick(num) { // 弹框点击事件上报
        let obj = {}
        if (this.dialogNum === 4) { // 获取权益区分
          obj = {
            // 通过 ad_name 区分弹窗：26-激励下载广告 29-激励插页广告
            ad_name: this.adReportType || AD_TYPE.DOWNAD,
          }
        }
      logUserBehavior({
        eventId: 'reader_incentiveDownload_pop_clicked',
        eventCode: 'clicked',
        eventInfo: {
          ...obj,
          ext1: this.dialogNum,
          ext2: num, // 点击位置：0-关闭 1-打开
        }
      })
    },
    reportEvent(item, eventType, eventInfo) { // 上报华为广告事件
      this.$emit('getCurPage')
      setTimeout(() => { // 延迟到 pageIndex 数据更新后再执行
        const { slotId, uuid } = item
        const event = {
          ...eventInfo,
          adSlotId: slotId,
          pageIndex: this.pageIndex,
          reqId: uuid,
          blockType: HWAD_TYPE.DOWNAD,
        };
        jsbridge.commitAdEvent(eventType, event);
      })
    },
    reportYuewen(item, eventId, eventCode) { // 上报阅文埋点
      const { slotId, uuid, source, adId, interactionType } = item
      const event = {
        eventId,
        eventCode,
        eventInfo: {
          ad_type: 1, // 1-非物理广告 2-物理广告
          ad_name: AD_TYPE.DOWNAD,
          chap_no: this.ccid,
          adid: slotId,
          ext1: source,
          ext2: adId,
          ext3: interactionType,
          ext4: uuid,
          ext6: 0,
        },
      };
      // 广告点击上报
      if (eventCode === 'ad_clicked') {
        event.eventInfo.cl = '0' // 需要上报是否开启左滑点击事件
        event.eventInfo.ext7 = '1' // 0-滑动触发 1-点击触发
      }
      // 下载按钮状态变化上报
      if (eventCode === 'down_clicked') {
        event.eventInfo.ext8 = this.reportDownNum
      }
      logUserBehavior(event);
    }
  },
};
</script>

<style lang="scss" scoped>
@import '../DownAd/aditem.scss';
.down_dialog_index{
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);

  @include mediaScreen('hw_fold') {
    width: 410px !important;
    padding: 0;
  }
  @include mediaScreen('hw_pad') {
    width: 500px !important;
    padding: 0;
  }

  .cont{
    position: relative;
    width: 100%;
    height: 100%;
    padding: 40px 16px 24px;
    box-sizing: border-box;
    border-radius: 24px;
    border: 1px solid rgba(255, 246, 233, 0.8);
    background-color: #F4E7D4;
  }
  .inner{
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .tit_wrap{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: wrap;
    font-weight: 700;
    .tit_wrap2{
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .tit{
      @include fontSize(20px);
      @include lineHeight(32px);
      color: var(--color-downad-text);
    }
    .mr6{
      margin-right: 6px;
    }
    .ml6{
      margin-left: 6px;
    }
    .tit_active{
      @include fontSize(22px);
      @include lineHeight(32px);
      color: #AD7027;
    }
    .img_left{
      margin-top: 2px;
      width: 13px;
      height: 26px;
    }
    .img_right{
      margin-left: 2px;
      width: 13px;
      height: 26px;
    }
  }
  .tip {
    @include fontSize(14px);
    @include lineHeight(24px);
    color: var(--color-downad-text);
  }
  .time{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 253px;
    height: 32px;
    padding: 0 10px;
    border-radius: 8px;
    background-color: rgba(173, 112, 39, 0.1);
    @include fontSize(14px);
    @include lineHeight(24px);
    color: #AD7027;
  }

  .btn{
    margin-top: 24px;
    width: 220px;
    padding: 10px 74px;
    border-radius: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(270deg, #825736 0%, #AB8263 100%);

    font-weight: 500;
    @include fontSize(16px);
    @include lineHeight(20px);
    color: #FFF;
    .icon{
      margin-left: 4px;
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }
  }
  .cancel{
    margin-top: 16px;
    font-weight: 500;
    @include fontSize(14px);
    @include lineHeight(20px);
    color: rgba(0, 0, 0, 0.45);
  }

  .img_close{
    position: absolute;
		top: 16px;
		right: 16px;
		z-index: 2;
		width: 24px;
		height: 24px;
    border-radius: 100px;
  }

  .mt8{
    margin-top: 8px;
  }
  .mt16{
    margin-top: 16px;
  }
  .mb16{
    margin-bottom: 16px;
  }
}

.is_hm_ark {
  @extend .down_dialog_index;
  top: 50%;
  transform: translate(-50%, -50%);

  .cont {
    border-radius: 32px;
  }
}

.down_dialog_dark{
  .cont{
    border: none;
    background-color: #56472E;
  }
  .tit_wrap{
    .tit_active{
      color: #E99B3F;
    }
  }
  .time{
    background-color: rgba(233, 155, 63, 0.1);
    color: #E99B3F;
  }
  .btn{
    background: linear-gradient(90deg, #F2AF5F 0%, #D58E3B 100%);
  }
  .cancel{
    color: rgba(255, 255, 255, 0.45);
  }
}
</style>
