<template>
  <van-overlay
    :show="show"
    z-index="1000"
    :style="{ 'background-color': 'rgba(0,0,0,0.65)' }"
    @click.stop="cancel"
  >
    <div
      v-if="show"
      class="popup"
      :style="
        offsetPosition === 'bottom'
          ? {
              top: `${offsetTop}px`,
              justifyContent: offsetHorizontalPosition === true ? 'center' : '',
            }
          : {
              justifyContent: offsetHorizontalPosition === true ? 'center' : '',
            }
      "
    >
      <svg-icon
        v-if="offsetPosition === 'bottom'"
        icon-class="popup"
        :class="[isDark?'popup-img-dark':'popup-img']"
        :style="{
          position: 'absolute',
          left: typeof(offsetLeft) === 'number' ? `${offsetLeft}px` : offsetLeft,
          right: typeof(offsetRight) === 'number' ? `${offsetRight}px` : offsetRight,
        }"
      />

      <div
        @click.stop
        :class="['close-popup', isDark && 'close-popup-dark']"
        :style="
          offsetHorizontalPosition === false
            ? {
                maxWidth: maxWidth,
                position: 'absolute',
                left: typeof(offsetLeft) === 'number' ? `${offsetLeft - 17}px` : offsetLeft,
                right: typeof(offsetRight) === 'number' ? `${offsetRight - 17}px` : offsetRight,
                bottom:
                  offsetPosition === 'top' ? `${offsetTop + 8}px` : 'inherit',
              }
            : {
                maxWidth: maxWidth,
                position: 'absolute',
                bottom:
                  offsetPosition === 'top' ? `${offsetTop + 8}px` : 'inherit',
              }
        "
      >
        <div class="close-popup-top">
          <span class="popup-title">{{ title }}</span>
        </div>
        <div class="close-popup-item">
          <div
            :class="['popup-item', isDark && 'popup-item-dark']"
            v-for="(item, index) in words"
            :key="index"
            @click.stop="closePopup(item)"
          >
            <span class="popup-item-txt">{{ item }}</span>
          </div>
        </div>
      </div>
      <svg-icon
        v-if="offsetPosition === 'top'"
        icon-class="popdown"
        :class="[isDark?'popup-img-dark':'popup-img']"
        :style="{
          position: 'absolute',
          left: typeof(offsetLeft) === 'number' ? `${offsetLeft}px` : offsetLeft,
          right: typeof(offsetRight) === 'number' ? `${offsetRight}px` : offsetRight,
          bottom: `${offsetTop}px`,
        }"
      />
    </div>
  </van-overlay>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    words: {
      type: Array,
      default: () => [],
    },
    clientResize: { // 屏幕宽高发生变化
      type: Number,
      default: 0,
    },
    maxWidth: {
      type: Number,
      default: 0,
    },
    offsetTop: {
      type: Number,
      default: 0,
    },
    offsetLeft: {
      type: [String, Number],
      default: 'auto',
    },
    offsetRight: {
      type: [String, Number],
      default: 'auto',
    },
    // 反馈气泡弹窗展示位置，判断是在页面上半部分展示还是下半部分
    offsetPosition: {
      type: String,
      default: 'bottom', // top bottom
    },
    // 反馈按钮是否在水平位置中间，如果在中间的话，反馈气泡弹窗需要居中
    offsetHorizontalPosition: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      title: '不感兴趣',
    };
  },
  computed: {
    ...mapGetters(['theme']),
    isDark() {
      return this.theme.theme === 'dark'
    },
  },
  watch: {
    show(visible) {
      if (visible) {
        this.mountBody();
      } else {
        this.removeNodeChild();
      }
    },
    clientResize() { // 屏幕宽高发生变化-关闭负反馈
      this.cancel()
    }
  },

  methods: {
    mountBody() {
      const body = document.querySelector('#read_body');
      body.appendChild(this.$el);
    },
    removeNodeChild() {
      if (this.$el && document.body.contains(this.$el)) {
        document.querySelector('#read_body').removeChild(this.$el);
      }
    },
    closePopup(keyWords) {
      this.removeNodeChild();
      this.$emit('closepopup', keyWords);
    },
    cancel() {
      this.$emit('cancelpopup');
    },
  },
  beforeDestroy() {
    this.removeNodeChild();
  },
};
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
