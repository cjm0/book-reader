<template>
  <van-overlay :show="show" z-index="310" :style="{'background-color':'rgba(0,0,0,0.85)'}">
    <div class="onboarding">
      <div v-if="pageMode.isVertical">
        <div class="guide">
          <img class="guide1" src="@/assets/images/guide/vertical1.png" @contextmenu.prevent />
          <img class="guide2" src="@/assets/images/guide/vertical2.png" @contextmenu.prevent />
        </div>
      </div>
      <div v-else>
        <div class="desc">
          <div class="desc-item">
            <div class="item-top">点击 / 滑动</div>
            <div class="item-middle">上一页</div>
            <img class="item-bottom" src="~@/assets/images/guide/guide_icon_left.png" alt="上一页" @contextmenu.prevent />
          </div>
          <div class="desc-item desc-middle">
            <div class="item-top">点击中间</div>
            <div class="item-middle">显示菜单</div>
            <img class="item-bottom img-middle" src="~@/assets/images/guide/guide_icon_middle.png" alt="点击" @contextmenu.prevent />
          </div>
          <div class="desc-item">
            <div class="item-top">点击 / 滑动</div>
            <div class="item-middle">下一页</div>
            <img class="item-bottom" src="~@/assets/images/guide/guide_icon_right.png" alt="下一页" @contextmenu.prevent />
          </div>
        </div>
      </div>
      <div class="btn" @click.stop="close">知道了</div>
    </div>
  </van-overlay>
</template>

<script>
import { PAGE_CHANGE_MODE } from '@/constants';
export default {
  name: 'Onboarding',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    pageChangeMode: {
      type: String,
      default: PAGE_CHANGE_MODE.HORIZONTAL,
    },
  },
  computed: {
    pageMode() {
      return {
        isVertical: this.pageChangeMode === PAGE_CHANGE_MODE.VERTICAL,
      };
    },
  },
  methods: {
    close() {
      this.$emit('onClose');
    },
  },
};
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
