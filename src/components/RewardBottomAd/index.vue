<!--
 * @Description : 章首固底激励视频
 * @Author      : chenjianmin
 * @Date        : 2024-04-01 15:03:17
-->
<template>
  <div
    :class="[
      'reward_bottomad_index',
      isDark && 'reward_bottomad_dark',
    ]"
    :style="{
      'background-color': theme.paper,
      'height': `${bootomBarHeight}px`,
    }"
  >
    <div class="ad_out">
      <div class="ad_cont">
        <ImageBox
          class="ad_img"
          :url="require('@/assets/images/ad-reward/free.png')"
          :style="{width: 58, height: 40 }"
        />
        <div class="ad_info">
          <p class="ad_tit">看视频免 {{ rewardAdConfig.rewardTime }} 分钟广告</p>
          <p class="ad_desc">{{ rewardAdConfig.rewardTime }} 分钟后可重复领取</p>
        </div>
      </div>
      <div class="ad_button">去看视频</div>
      <RewardAd
        :posType="2"
        :ccid="ccid"
        :pageIndex="pageIndex"
        @on-reward="onReward"
        @getCurPage="getCurPage"
      />
    </div>
  </div>
</template>

<script>
import ImageBox from '../ImageBox';

import { mapGetters } from 'vuex';
import { getRewardAdUseConfig, setRewardAdUseConfig } from '@/utils/cacheData';
import { BOOTM_BAR_HEIGHT } from '@/constants';

export default {
  name: 'RewardBottomAd',
  components: {
    ImageBox,
    RewardAd: import('../RewardAd'),
  },
  props: {
    ccid: {
      type: String,
      default: '',
    },
    pageIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      bootomBarHeight: BOOTM_BAR_HEIGHT,
    };
  },
  computed: {
    ...mapGetters([
      'theme',
      'novelInsideAdConfig'
    ]),
    isDark() {
      return this.theme.theme === 'dark'
    },
    rewardAdConfig() {
      return  this.novelInsideAdConfig.rewardAdConfig
    },
  },
  mounted() {
    // 使用次数加1
    const useConfig = getRewardAdUseConfig()
    const now = new Date() * 1
    let useData = { useAll: 1, useNum: 0, time: now, agree: 0 }
    if (useConfig) {
      const { useAll, time } = useConfig
      useData = {
        ...useConfig,
        useAll: useAll + 1,
        time: time || now,
      }
    }
    setRewardAdUseConfig(useData)
  },

  methods: {
    onReward(detail) { // 激励视频开启免广告权益
      this.$emit('closeRewardBottom')
      this.$emit('handleReward', detail)
    },
    getCurPage() { // 更新 pageIndex
      this.$emit('getCurPage')
    }
  },
};
</script>

<style lang="scss" scoped>
.reward_bottomad_index{
  position: fixed;
	left: 0;
	bottom: 0;
	z-index: 3;
	width: 100%;
  .ad_out{
    position: relative;
		display: flex;
    justify-content: space-between;
    align-items: center;
		width: 100%;
		height: 100%;
    padding: 0 16px;
		background-color: var(--color-ad-bg);
	}

  .ad_cont{
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    .ad_img{
      margin-right: 8px;
      border-radius: 12px;
    }
    .ad_info{
      flex: 1;
			overflow: hidden;
			display: flex;
			flex-direction: column;
    }
    .ad_tit {
      @include text-ellipsis(1);
      @include fontSize(14px);
      color: rgba(0, 0, 0, 1);
    }
    .ad_desc {
      margin-top: 4px;
      @include text-ellipsis(1);
      @include fontSize(12px);
      color: var(--color-4);
    }
  }

  .ad_button{
    margin-left: 10px;
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
.reward_bottomad_dark {
	.ad_cont {
		.ad_tit {
      color: rgba(255, 255, 255, 0.5);
    }
	}
  .ad_button{
    background-color: #9B6A2E;
    color: rgba(255, 255, 255, 0.6);
  }
}
</style>
