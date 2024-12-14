<template>
  <div >
    <div v-if="show" :class="[isHmArk ? 'toast_hm' : 'toast', show && showToast && 'show-toast']" >
      <span class="percent">{{value}} / {{ max }}</span>
      <span class="name">{{title}}</span>
    </div>
    <div
      class="progress"
      :style="{
        'background-color': theme.bg,
        'transform': `translateY(${show ? -(bootomBarHeight - 1 + navigationHeight)+ 'px' : '100%'})`
      }"
    >
      <div class="operation">
        <div
          :class="['chanpter-btn left', getPrevDisabled && 'disabled']"
          @click="toPrevChapter"
        >
          <template v-if="showNewUI">
            上一章
          </template>
          <template v-else>
            <svg-icon icon-class="progress-arrow" class="arrow"/>
          </template>
        </div>
        <div ref="sliderWrap" class="slider_wrap">
          <van-slider
            class="slider"
            v-model="value"
            :min="1"
            :max="max"
            :step="1"
            :bar-height="40"
            :active-color="theme.sliderBgActiveColor"
            :inactive-color="theme.sliderBgColor"
            @drag-start="dragStart"
            @change="onChange"
          >
            <template #button>
              <div class="custom_button" :style="{ backgroundColor: theme.sliderBgActiveColor }">
                <div class="slider_button" :style="{ backgroundColor: theme.sliderButtonColor }"></div>
              </div>
            </template>
          </van-slider>
          <transition name="fade">
            <p
              class="slider_button_left"
              :style="{ left: buttonLeft + 'px', backgroundColor: theme.sliderLeftButtonColor }"
              @click.stop="restoreSlide"
              v-show="showButtonLeft"
              v-if="showNewUI && isButtonLeft"
            ></p>
          </transition>
          <p class="place" :style="{ backgroundColor: theme.sliderBgColor }"></p>
        </div>
        <div
          :class="['chanpter-btn', showNewUI?'right_new':'right', getNextDisabled && 'disabled']"
          @click="toNextChapter"
        >
          <template v-if="showNewUI">
            下一章
          </template>
          <template v-else>
            <svg-icon icon-class="progress-arrow" class="arrow"/>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { BOOTM_BAR_HEIGHT } from '@/constants';
import { logUserBehavior } from '@/service';

const offset = 3
export default {
  name: 'Progress',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    chapter: {
      type: Object,
      default: null,
    },
    clientResize: { // 屏幕宽高发生变化
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      bootomBarHeight: BOOTM_BAR_HEIGHT,
      value: 1,
      currentValue: 1,
      showToast: false,

      isButtonLeft: true, // 是否渲染 leftButton
      showButtonLeft: false, // 记忆 leftButton 是否出现
      slideWidth: 0, // slider 宽度
      buttonLeft: offset, // 记忆 leftButton 位置
      buttonValue: 1, // 记忆 leftButton 章节值

      // sliderChangeTimer: null,
      // timer: null
    };
  },
  computed: {
    ...mapGetters(['theme', 'navigationHeight', 'catalogList', 'readUIConfig', 'isHmArk']),
    title() {
      const chapterName =  this.catalogList.length > 0 ? this.catalogList[this.value - 1].title : '';
      return chapterName;
    },
    max() {
      return this.catalogList.length || 100;
    },
    getPrevDisabled() {
      return this.value === 1;
    },
    getNextDisabled() {
      return this.value === this.catalogList.length;
    },
    showNewUI() {
      return this.readUIConfig > 0
    }
  },
  watch: {
    chapter: {
      handler() {
        this.initValue();
      },
      deep: true,
    },
    catalogList() {
      this.initValue();
    },
    value() {
      if (!this.show) {
        return
      }
      this.showToast = true
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.showToast = false;
      }, 2000);
    },
    clientResize() { // 屏幕宽高发生变化-清空 leftButton
      this.init()
      this.clearLeftButton()
    },
    show() {
      if (!this.show) { // 关闭的时候清空 leftButton
        setTimeout(() => {
          this.clearLeftButton()
        }, 200)
      }
    }
  },

  mounted() {
    setTimeout(() => { // 延迟获取 sliderWrap 宽度，否则不准确
      this.init()
    }, 100)
  },
  destroyed() {
    clearTimeout(this.timer)
    clearTimeout(this.sliderChangeTimer)
  },

  methods: {
    init() {
      this.slideWidth = this.$refs.sliderWrap.offsetWidth - 40
    },
    dragStart() {
      this.isButtonLeft = true
      this.showButtonLeft = false
    },
    clearLeftButton() { // 清空 leftButton
      this.isButtonLeft = false
      this.showButtonLeft = false
    },
    onChange(v) {
      if (this.showNewUI) {
        !this.showButtonLeft && this.dragStart()
        this.setButton(v)
      }
      this.changeSlide(v)
    },
    changeSlide(v) {
      this.currentValue = v;
      clearTimeout(this.sliderChangeTimer)
      this.sliderChangeTimer = setTimeout(() => {
        const { ccid, cid } = this.catalogList[this.currentValue - 1];
        logUserBehavior({
          eventId: 'reader_menu_Guide_clicked',
          eventCode: 'clicked',
          eventInfo: {
            ext1: ccid,
          },
        })
        this.$emit('toOne', ccid, cid);
      }, 100);
    },
    setButton(v) {
      // 计算移动距离
      const dis = v - this.currentValue
      const disX = Math.abs((this.slideWidth * dis) / this.max)
      if (disX >= 34) { // 移动距离大于 button
        // 记忆按钮移动距离
        let left = (this.slideWidth * this.currentValue) / this.max
        if (left < offset) {
          left = 0
        }
        if (left > this.slideWidth) {
          left = this.slideWidth
        }
        this.buttonLeft = left + offset
        this.buttonValue = this.currentValue
        this.showButtonLeft = true
      }
    },
    restoreSlide() {
      const value = this.buttonValue
      this.value = value
      setTimeout(() => { // 延迟到 slider 动效走完再切章
        this.changeSlide(value)
      }, 100)

      this.currentValue = value
      setTimeout(() => {
        this.clearLeftButton()
      }, 20)
    },
    toPrevChapter() {
      if (!this.getPrevDisabled) {
        const { prevCcid } =  this.catalogList[this.currentValue - 1];
        this.$emit('toPrev', prevCcid);
        logUserBehavior({
          eventId: 'reader_menu_progressUp_clicked',
          eventCode: 'clicked',
          eventInfo: {
            ext1: prevCcid,
          },
        });
      }
    },
    toNextChapter() {
      if (!this.getNextDisabled) {
        const { nextCcid } =  this.catalogList[this.currentValue - 1];
        this.$emit('toNext', nextCcid);
        logUserBehavior({
          eventId: 'reader_menu_progressDown_clicked',
          eventCode: 'clicked',
          eventInfo: {
            ext1: nextCcid,
          },
        });
      }
    },
    initValue() {
      if (this.chapter && this.catalogList.length > 0) {
        const { ccid } = this.chapter;
        const foundIndex = this.catalogList.findIndex(chapter => chapter.ccid === ccid);
        if (foundIndex > -1) {
          this.value = foundIndex + 1;
          this.currentValue = foundIndex + 1;
        }
      }
    },
  },
};
</script>
<style scoped lang="scss">
@import './index.scss';
</style>
