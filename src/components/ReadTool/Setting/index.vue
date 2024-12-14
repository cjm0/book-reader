<template>
  <div
    class="setting-wrapper"
    :style="{
      'background-color': theme.bg,
      'transform': `translateY(${show ? -(bootomBarHeight - 1 + navigationHeight)+ 'px' : '100%'})`
    }"
  >
    <div class="item2" v-if="showItem2">
      <div class="label">
        <p>自动加书架</p>
        <p class="desc" v-show="popBfWin !== -1">阅读书籍 {{ popBfWin }} 页后，自动将当前书籍加入书架</p>
      </div>
      <van-switch v-model="autoAddBookVal" size="18px" :active-color="theme.activePaper" :inactive-color="theme.sliderButtonColor" />
    </div>
    <div class="item">
      <label class="label" :style="labelStyle">字号</label>
      <div class="options">
        <div
          class="slider-wrap"
          :style="{backgroundColor:theme.sliderBgColor}"
        >
          <div :hidden="true">
            <div id="slider-dot">
              <div
                class="dot"
                v-for="index in 8"
                :key="index"
              ></div>
            </div>
          </div>
          <van-slider
            ref="slider"
            v-model="fontSizeValue"
            :step="1"
            :min="1"
            :max="8"
            class="slider"
            :bar-height="40"
            active-color="transparent"
            :inactive-color="theme.sliderBgColor"
          >
            <template #button>
              <div
                class="custom-button"
                :style="{backgroundColor:theme.sliderButtonColor}"
              >
                {{ fontSize }}
              </div>
            </template>
          </van-slider>
        </div>
      </div>
    </div>
    <div class="item">
      <label class="label" :style="labelStyle">行距</label>
      <div class="options">
        <button
          v-for="item in lineHeights"
          :key="item.level"
          :aria-label="item.name"
          class="change_btn"
          :style="{
            borderColor: item.active ? theme.border : 'var(--color-1)',
            color: item.active ? theme.border : 'var(--color-text-primary)',
          }"
          @click="changeLineHeight(item.level)"
        > {{ item.name }}</button>
      </div>
    </div>
    <div class="item">
      <label class="label" :style="labelStyle">背景</label>
      <div class="options">
        <button
          v-for="(item, index) in themeList"
          :key="item.theme"
          aria-label="背景色"
          class="theme-btn"
          :style="{
            backgroundColor: item.paper,
            borderColor: theme.theme === item.theme ? theme.border:'transparent'
          }"
          @click="changeThemeIndex(index)"
        >
        </button>
      </div>
    </div>
    <div class="item">
      <label class="label" :style="labelStyle">翻页</label>
      <div class="options">
        <button
          aria-label="平移"
          class="change_btn"
          :style="{
            borderColor: pageChangeMode === HORIZONTAL ? theme.border : 'var(--color-1)',
            color: pageChangeMode === HORIZONTAL ? theme.border : 'var(--color-text-primary)'
          }"
          @click="changePageMode(HORIZONTAL)"
        >平移</button>
        <button
          aria-label="上下"
          class="change_btn"
          :style="{
            borderColor: pageChangeMode === VERTICAL ? theme.border:'var(--color-1)',
            color: pageChangeMode === VERTICAL ? theme.border : 'var(--color-text-primary)'
          }"
          @click="changePageMode(VERTICAL)"
        >上下</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { PAGE_CHANGE_MODE, BOOTM_BAR_HEIGHT, FONTSIZES, LINE_HEIGHTS } from '@/constants';
import { read as readCacheData } from '@/utils/cacheData';
import { logUserBehavior } from '@/service';

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const pageChangeMode = readCacheData.getPageChangeMode();
    return {
      pageChangeMode,
      VERTICAL: PAGE_CHANGE_MODE.VERTICAL,
      HORIZONTAL: PAGE_CHANGE_MODE.HORIZONTAL,
      bootomBarHeight: BOOTM_BAR_HEIGHT,
      fontSizeValue: 0,
      fontSize: 0,
      lineHeights: [
        {
          name: '紧凑',
          level: 1,
          levelSize: LINE_HEIGHTS[0],
          active: false,
        },
        {
          name: '适中',
          level: 2,
          levelSize: LINE_HEIGHTS[1],
          active: true,
        },
        {
          name: '宽松',
          level: 3,
          levelSize: LINE_HEIGHTS[2],
          active: false,
        },
      ],
      autoAddBookVal: true,
      // sliderChangeTimer: null
    };
  },
  computed: {
    ...mapState('login', ['hasLogin']),
    ...mapGetters([
      'theme',
      'navigationHeight',
      'fontSizeRatio',
      'fontSizeInitial',
      'fontSizeLevel',
      'fontLineHeight',
      'themeList',
      'globalData',
      'autoAddBook',
      'isHmArk'
    ]),
    popBfWin() {
      return this.globalData.popBfWin
    },
    showItem2() {
      return (this.popBfWin > 0 || this.popBfWin === -1) && (!this.isHmArk || (this.isHmArk && this.hasLogin));
    },
    labelStyle() { // 系统最大字号宽度不够
      return {
        width: Number(this.fontSizeRatio) !== 1.45 ? '49px' : '53px'
      }
    }
  },
  watch: {
    fontSizeValue(v) {
      // 第1次 mounted 里的变更不触发上报
      if (!this.fontSizeChange) {
        this.fontSizeChange = 1
        return
      }

      this.fontSizeValue = v;
      this.fontSize = FONTSIZES[v - 1];

      clearTimeout(this.sliderChangeTimer)
      this.sliderChangeTimer = setTimeout(() => {
        this.$store.commit('fontSize/setFontSizeLevel', v);
        logUserBehavior({
          eventId: 'reader_menu_SetSize_clicked',
          eventCode: 'clicked',
          eventInfo: {
            ext1: v,
          },
        });
      }, 300);
    },
    autoAddBookVal(val) {
      if (typeof val === 'boolean') { // mounted中的赋值操作this.hasLogin初始值为null，所以此处需要判断val是否为boolean类型
        this.$store.commit('global/setAutoAddBook', val ? 1 : -1);
      }
    },
    hasLogin(val) {
      this.autoAddBookVal = this.autoAddBook > 0 && (!this.isHmArk || (this.isHmArk && val));
    },
  },

  created() {
    // 处理行距
    this.lineHeights = this.lineHeights.map(val => {
      if (val.levelSize === this.fontLineHeight) {
        val.active = true
      } else {
        val.active = false
      }
      return val
    })
  },
  mounted() {
    this.fontSizeValue = this.fontSizeLevel
    this.fontSize = this.fontSizeInitial
    this.autoAddBookVal = this.autoAddBook > 0 && (!this.isHmArk || (this.isHmArk && this.hasLogin));
    this.handleSlider()
  },
  destroyed() {
    clearTimeout(this.sliderChangeTimer)
  },

  methods: {
    // 处理字号滑块
    handleSlider() {
      const dot = document.querySelector('#slider-dot');
      this.$refs.slider.$el.insertBefore(
        dot,
        this.$refs.slider.$el.children[0],
      );
    },
    // 处理行距
    changeLineHeight(level) {
      this.lineHeights = this.lineHeights.map(val => {
        if (val.level === level) {
          val.active = true
        } else {
          val.active = false
        }
        return val
      })
      this.$store.commit('fontSize/setLineHeightLevel', level)
      logUserBehavior({
        eventId: 'reader_line_height_clicked',
        eventCode: 'clicked',
        eventInfo: {
          ext1: LINE_HEIGHTS[level - 1]
        },
      });
    },
    // 设置背景色
    changeThemeIndex(index) {
      this.$store.commit('theme/setTheme', index);
      logUserBehavior({
        eventId: 'reader_menu_SetBackground_clicked',
        eventCode: 'clicked',
        eventInfo: {
          pos: index,
        },
      });
    },
    // 设置阅读模式
    changePageMode(type) {
      this.pageChangeMode = type;
      readCacheData.setPageChangeMode(type);
      this.$emit('setPageMode', type);
      logUserBehavior({
        eventId: 'reader_menu_SetPaging_clicked',
        eventCode: 'clicked',
        eventInfo: {
          ext1: type === this.VERTICAL ? 2 : 1,
        },
      });
    },
  },
};
</script>
<style scoped lang="scss">
@import './index.scss';
</style>
