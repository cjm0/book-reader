<!-- 书籍扉页 -->
<template>
  <div
    v-if="book"
    ref="refBookInfo"
    :class="['bookinfo_index', isSmall && 'bookinfo_index_small']"
    :style="{ 'padding-top': paddingTop, 'background-color': theme.bg }"
    @click="setTool"
  >
    <div
      class='topbox_bg'
      :style="{
        'padding-top': paddingTop,
        'background-color':isDark?'#000':theme.sliderBgActiveColor
      }"
    >
      <div class="book_top book_top_bg">
        <BookCover :url="book.coverHttps" :size="isSmall ? 72 : 96"/>
        <p class="name">{{ book.title || '' }}</p>
        <p class="author">{{ book.author || '' }}</p>
      </div>
    </div>
    <div class="bg_box">
      <div class="book_border" :style="{'background':isDark?'#000':theme.sliderBgActiveColor}"></div>
      <div class="book_border" :style="{'background':isDark?'#000':theme.sliderBgActiveColor} "></div>
      <div class="book_border" :style="{'background':theme.bg}"></div>
      <div class="book_border" :style="{'background':theme.bg}"></div>
      <div class="bg_inner">
        <div class="book_top">
          <BookCover :url="book.coverHttps" :size="isSmall ? 72 : 96"/>
          <p class="name">{{ book.title || '' }}</p>
          <p class="author">{{ book.author || '' }}</p>
          <img
            class="book_feiye_img1"
            @contextmenu.prevent
            :src="isDark ? bookFeiyeImg1.imgUrlDark : bookFeiyeImg1.imgUrl"
            v-if="showImg1"
          >
          <img
            class="book_feiye_img2"
            @contextmenu.prevent
            :src="bookFeiyeImg2.imgUrl"
            v-if="showImg2"
          >
        </div>
        <div :style="{ backgroundColor: theme.sliderBgActiveColor }"></div>
        <!-- 书籍简介标签评分/在读人数/字数 -->
        <div class="book_detail">
          <div class="detail_block">
            <div class="label1">
              <span class="num">{{ bookScore }}</span>
              <span class="txt">分</span>
            </div>
            <div class="label2">
              <span
                v-for="(item, index) in 5"
                :key="index"
              >
                <svg-icon
                  class="star null"
                  icon-class="star_null"
                />
              </span>
            </div>
            <div v-if="bookScore > 0" class="label2 label3">
              <span
                v-for="(item, index) in Math.ceil(bookScore / 2)"
                :key="index"
              >
                <svg-icon
                  v-if="index === Math.floor(bookScore / 2)"
                  class="star"
                  icon-class="star_half"
                />
                <svg-icon
                  v-else
                  class="star all"
                  icon-class="star_all"
                />
              </span>
            </div>
          </div>
          <div class="detail_block">
            <p class="label1">
              <span class="num">{{readingNum}}</span>
              <span class="txt">万人</span>
            </p>
            <p class="label2">在读</p>
          </div>
          <div class="detail_block">
            <p class="label1">
              <span class="num">{{wordCount}}</span>
              <span class="txt">万字</span>
            </p>
            <p class="label2">{{ book.finished ? '已完结' : '连载中' }}</p>
          </div>
        </div>
        <!-- 书籍简介标签部分 -->
        <div class="book_content">
          <div class="content">书籍简介</div>
          <div class="tagList">
            <div :class="['tagName1', isDark && 'tagName2']">{{ book.categoryName}}</div>
            <div class="tagCoat">
              <div
                class="tag"
                v-for="(item, index) in book.labels.slice(0, 2)"
                :key="index"
                :style="{
                  backgroundColor: theme.sliderBgActiveColor,
                }"
              >
                <span>{{ item.labelName }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 书籍简介内容 -->
        <div class="intro_box">
          <div class="intro_wrap" :style="{height: `calc(100% - ${navigationHeight}px)`}">
            <div ref="info" class="intro_text" v-if="book.intro">{{ book.intro }}</div>
          </div>
          <div class="mask" :style="{background:`linear-gradient(180deg, rgba(211, 223, 237, 0) 0%, ${theme.bg} 100%)`}"></div>
        </div>

        <!-- 书籍简介手势滑动-->
        <div class="page_mode">
          <img
            :class="[isLrPageMode ? 'mode' : 'mode_up']"
            :src="arrowStatus"
            alt=""
            srcset=""
            @contextmenu.prevent
          />
          <span>{{isLrPageMode ? '左' : '上'}}滑开始阅读</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BookCover from '@/components/BookCover';
import { mapGetters } from 'vuex';
import { PAGE_CHANGE_MODE } from '@/constants';
import { formatNum } from '@/utils/helpers';
import { logUserBehavior } from '@/service';

const ARROW = {
  up: require('@/assets/images/guide/arrow_up.svg'),
  up_dark: require('@/assets/images/guide/arrow_updark.svg'),
  left: require('@/assets/images/guide/arrow_left.svg'),
  left_dark: require('@/assets/images/guide/arrow_leftdark.svg'),
}
export default {
  name: 'BookInfo',
  components: {
    BookCover,
  },
  props: {
    cbid: { // 阅文书籍 id
      type: String,
      default: '',
    },
    book: { // 作品信息
      type: Object,
      default: null,
    },
    pageChangeMode: {
      type: String,
      default: '',
    },
    clientHeight: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {

    };
  },
  computed: {
    ...mapGetters(['theme',  'themeIndex', 'statusBarHeight', 'bookFeiyeImg1', 'bookFeiyeImg2', 'navigationHeight']),
    isDark() {
      return this.theme.theme === 'dark'
    },
    isSmall() { // 屏幕低高度处理
      return this.clientHeight <= 655 + this.statusBarHeight
    },
    paddingTop() {
      return `${this.statusBarHeight + 32}px`;
    },
    isLrPageMode() { // 是否是左右翻页
      return this.pageChangeMode === PAGE_CHANGE_MODE.HORIZONTAL;
    },
    arrowStatus() {
      let arrow = null;
      const isHorizontal = this.pageChangeMode === PAGE_CHANGE_MODE.HORIZONTAL;
      if (isHorizontal) {
        arrow = this.isDark ? ARROW.left_dark : ARROW.left;
      } else {
        arrow = this.isDark ? ARROW.up_dark : ARROW.up;
      }
      return arrow;
    },
    readingNum() { // 阅读人数
      if (!this.book || !this.book.readingNum) {
        return 0;
      }
      return formatNum(this.book.readingNum);
    },
    wordCount() {
      if (!this.book || !this.book.wordCount) {
        return 0;
      }
      return formatNum(this.book.wordCount);
    },
    bookScore() {
      if (!this.book || !this.book.score) {
        return 0
      }
      return this.book.score
    },
    showImg1() { // 书籍扉页素材1配置
      const { show, cbids } = this.bookFeiyeImg1
      if (show || (cbids && cbids.includes(this.cbid))) {
        return true
      }
      return false
    },
    showImg2() { // 书籍扉页素材2配置
      const { show, cbids } = this.bookFeiyeImg2
      if (show || (cbids && cbids.includes(this.cbid))) {
        return true
      }
      return false
    }
  },

  mounted() {
    this.observeSection();
  },

  methods: {
    setTool() { // 唤起顶部导航和底部菜单栏
      this.$emit('setTool');
    },

    // 监听节点曝光
    observeSection() {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((el) => {
            if (el.intersectionRatio > 0) {
              if (el.isIntersecting) {
                // 延迟 200ms 上报，确保上报时，素材已获取完毕
                clearTimeout(this.timer)
                this.timer = setTimeout(() => {
                  this.report()
                }, 200)
              }
            }
          });
        },
        {
          rootMargin: '0px 0px 0px 0px',
          threshold: 0.1, // 元素出现的阈值，当元素出现比例为0.1时，触发一次监听
        },
      );
      const bookRef = this.$refs.refBookInfo
      bookRef && this.observer.observe(bookRef)
    },
    report() { // 书籍扉页素材曝光上报
      /*
        扉页素材配置
        0-无运营素材配置
        1-仅配置背景素材
        2-仅配置水印素材
        3-同时配置水印素材和背景素材
       */
      let ext9 = 0
      if (this.showImg1 && !this.showImg2) {
        ext9 = 1
      } else if (!this.showImg1 && this.showImg2) {
        ext9 = 2
      } else if (this.showImg1 && this.showImg2) {
        ext9 = 3
      }
      logUserBehavior({
        eventId: 'reader_feiye_shown',
        eventCode: 'shown',
        eventInfo: { ext9 },
      })
    }
  },
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
