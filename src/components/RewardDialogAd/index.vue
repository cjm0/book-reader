<!--
 * @Description : 章首弹窗激励视频
 * @Author      : chenjianmin
 * @Date        : 2024-04-01 15:03:17
-->
<template>
  <van-overlay
    :show="show"
    :style="{'background-color': 'rgba(0,0,0,0.2)'}"
    z-index="290"
    @click.stop
  >
    <div
      :class="[isHmArk ? 'is_hm_ark' :'reward_dialogad_index', isDark && 'reward_dialogad_dark']"
      :style="{'width': innerWidth + 'px'}"
    >
      <div class="cont">
        <div class="inner">
          <p class="tit_wrap">
            <img class="img_tit mr2" :src="isDark ? require('@/assets/images/ad-down/dialog_left_dark.png') : require('@/assets/images/ad-down/dialog_left.png')" @contextmenu.prevent /><span class="tit">免广畅读权益</span><img class="img_tit ml2" :src="isDark ? require('@/assets/images/ad-down/dialog_right_dark.png') : require('@/assets/images/ad-down/dialog_right.png')" @contextmenu.prevent />
          </p>
          <p class="tip">看视频享 {{ rewardAdConfig.rewardTime }} 分钟无广告阅读</p>
          <p class="agree" @click="changeAgree">
            <img class="img_agree" :src="require('@/assets/images/ad-reward/agree.png')" @contextmenu.prevent v-if="agree" />
            <img class="img_agree" :src="isDark ? require('@/assets/images/ad-reward/agree_no_dark.png') : require('@/assets/images/ad-reward/agree_no.png')" @contextmenu.prevent v-else />
            7 天内不再提示
          </p>
          <div class="btn_wrap">
            <p class="btn">去看视频</p>
            <RewardAd
              :posType="1"
              :ccid="ccid"
              :pageIndex="pageIndex"
              @on-reward="onReward"
              @getCurPage="getCurPage"
            />
          </div>
        </div>

        <img class="bg_img_top" :src="isDark ? require('@/assets/images/ad-down/top_dark.png') : require('@/assets/images/ad-down/top.png')" @contextmenu.prevent />
        <img class="bg_img_bottom" :src="isDark ? require('@/assets/images/ad-down/bottom_dark.png') : require('@/assets/images/ad-down/bottom.png')" @contextmenu.prevent />
        <img class="img_close" :src="isDark ? require('@/assets/images/ad-down/dialog_close_dark.png') : require('@/assets/images/ad-down/dialog_close.png')" @click="handleClose" @contextmenu.prevent/>
      </div>
    </div>
  </van-overlay>
</template>

<script>
import { mapGetters } from 'vuex';
import { getRewardAdUseConfig, setRewardAdUseConfig } from '@/utils/cacheData';
import { getGap } from '@/utils/helpers';
import { logUserBehavior } from '@/service';

export default {
  name: 'RewardDialogAd',
  components: {
    RewardAd: import('../RewardAd'),
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    ccid: {
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
      agree: false // 勾选提示
    };
  },
  computed: {
    ...mapGetters([
      'theme',
      'novelInsideAdConfig',
      'isHmArk'
    ]),
    isDark() {
      return this.theme.theme === 'dark'
    },
    innerWidth() { // 弹窗宽度
      const padding = getGap(this.clientWidth)
      return this.clientWidth - padding * 2;
    },
    rewardAdConfig() {
      return  this.novelInsideAdConfig.rewardAdConfig
    },
  },
  mounted() {
    // 使用次数加1
    const useConfig = getRewardAdUseConfig()
    const now = new Date() * 1
    let useData = { useAll: 1, useNum: 1, time: now, agree: 0 }
    if (useConfig) {
      const { useAll, useNum, time } = useConfig
      useData = {
        ...useConfig,
        useAll: useAll + 1,
        useNum: useNum + 1,
        time: time || now,
      }
    }
    setRewardAdUseConfig(useData)
  },

  methods: {
    changeAgree() { // 勾选切换
      this.agree = !this.agree
    },
    handleClose() { // 点击关闭弹窗
      this.closeDialog()

      // 关闭按钮点击上报
      logUserBehavior({
        eventId: 'reader_videoPop_close_clicked',
        eventCode: 'clicked'
      })
    },
    closeDialog() { // 关闭弹窗
      if (this.agree) { // 勾选同意，7天内不出提示
        const useConfig = getRewardAdUseConfig() || {}
        if (useConfig) {
          setRewardAdUseConfig({ ...useConfig, agree: new Date() * 1 })
        }
      }
      this.$emit('closeRewardDialog')
    },
    onReward(detail) { // 激励视频开启免广告权益
      this.closeDialog()
      this.$emit('handleReward', detail)
    },
    getCurPage() { // 更新 pageIndex
      this.$emit('getCurPage')
    },
  },
};
</script>

<style lang="scss" scoped>

.reward_dialogad_index{
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);

  @include mediaScreen('hw_fold') {
    width: 410px !important;
  }
  @include mediaScreen('hw_pad') {
    width: 500px !important;
  }

  .cont{
    position: relative;
    width: 100%;
    height: 100%;
    padding: 40px 16px 32px;
    box-sizing: border-box;
    border-radius: 24px;
    border: 1px solid rgba(255, 246, 233, 0.8);
    background-color: #F4E7D4;
    .bg_img_top{
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
      width: 157px;
      height: 69px;
    }
    .bg_img_bottom{
      position: absolute;
      bottom: 0;
      right: 0;
      z-index: 0;
      width: 149px;
      height: 64px;
    }
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
    .tit{
      font-weight: 700;
      @include fontSize(26px);
      @include lineHeight(32px);
      color: #825736;
    }
    .img_tit{
      width: 13px;
      height: 26px;
    }
    .mr2{
      margin-right: 2px;
    }
    .ml2{
      margin-left: 2px;
    }
  }

  .tip {
    margin-top: 16px;
    @include fontSize(18px);
    @include lineHeight(32px);
    color: #825736;
  }

  .agree{
    margin-top: 14px;
    display: flex;
    align-items: center;
    @include fontSize(14px);
    @include lineHeight(20px);
    color: var(--color-5);
    .img_agree{
      margin-right: 4px;
      width: 24px;
      height: 24px;
    }
  }

  .btn_wrap{
    margin-top: 26px;
    position: relative;
    width: 220px;
    height: 40px;
    border-radius: 32px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(270deg, #825736 0%, #AB8263 100%);
    .btn{
      font-weight: 500;
      @include fontSize(16px);
      @include lineHeight(20px);
      color: #F6E1B8;
    }
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
}

.reward_dialogad_dark{
  .cont{
    border: none;
    background-color: #56472E;
  }
  .tit_wrap{
    .tit{
      color: #E99B3F;
    }
  }
  .tip{
    color: #E99B3F;
  }
  .btn_wrap{
    background: linear-gradient(90deg, #F2AF5F 0%, #D58E3B 100%);
    .btn{
      color: #fff;
    }
  }
}

.is_hm_ark {
  @extend .reward_dialogad_index;
  top: 50%;
  bottom: auto;
  transform: translate(-50%, -50%);

  .cont {
    padding: 40px 16px 32px;
    border-radius: 32px;
  }
}
</style>