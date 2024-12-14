<!-- 书籍详情 -->
<template>
  <div
    :class="show && 'book_detail_bg'"
    :style="{backgroundColor: isDark ?'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)'}"
  >
    <div
      :class="[isHmArk ? 'is_hm_ark' : 'book_detail', show && 'show_pop']"
      :style="{ height:`calc(100vh - ${topDistance}px)`, backgroundColor: theme.bg}"
    >
      <div
        ref="bookTop"
        class="book_top"
        :style="{'background':isDark?'#000':theme.sliderBgActiveColor}"
        @touchstart="touchStart"
        @touchmove="touchMove"
        @touchend="touchEnd"
      >
        <div class="xmark" v-if="isHmArk">
          <div class="close-icon" @click="closeBookDetail">
            <svg-icon
              icon-class="xmark"
              :class="['xmark-svg', isDark && 'xmark-svg-dark']"
            />
          </div>
        </div>
        <div class="arrow" @click="closeBookDetail" v-else>
          <svg-icon v-if="isDark" icon-class="arrow-downdark" class="arrow_down" />
          <svg-icon v-else icon-class="arrow-down" class="arrow_down" />
        </div>
        <div class="book_cover">
          <BookCover :url="book.coverHttps" :size="96" />
          <p class="name">{{ book.title || '' }}</p>
          <p class="author">{{ book.author || '' }}</p>
        </div>
      </div>

      <div class="book_wrap">
        <!-- 书籍简介标签评分/在读人数/字数  -->
        <div class="book_cont">
          <div class="detail_block">
            <p class="label1">
              <span class="num">{{ bookScore }}</span>
              <span class="txt">分</span>
            </p>
            <p class="label2">
              <span v-for="(item, index) in 5" :key="index">
                <svg-icon class="star null" icon-class="star_null" />
              </span>
            </p>
            <p v-if="bookScore > 0" class="label2 label3">
              <span v-for="(item, index) in Math.ceil(bookScore / 2)" :key="index">
                <svg-icon v-if="index === Math.floor(bookScore / 2)" class="star" icon-class="star_half" />
                <svg-icon v-else class="star all" icon-class="star_all" />
              </span>
            </p>
          </div>
          <div class="detail_block">
            <p class="label1">
              <span class="num">{{ readingNum }}</span>
              <span class="txt">万人</span>
            </p>
            <p class="label2">在读</p>
          </div>
          <div class="detail_block">
            <p class="label1">
              <span class="num">{{ wordCount }}</span>
              <span class="txt">万字</span>
            </p>
            <p class="label2">{{ book.finished ? '已完结' : '连载中' }}</p>
          </div>
        </div>
        <!-- 书籍简介标签部分 -->
        <div class="book_category">
          <div class="tag_tit">书籍简介</div>
          <div class="tag_list">
            <p :class="['tag_name1', isDark && 'tag_name2']">{{ book.categoryName}}</p>
            <div class="tag_coat">
              <p
                class="tag"
                v-for="(item, index) in book.labels.slice(0, 2)"
                :key="index"
                :style="{ backgroundColor: theme.sliderBgActiveColor }"
              >
                <span>{{ item.labelName }}</span>
              </p>
            </div>
          </div>
        </div>
        <!-- 书籍简介内容 -->
        <div class="intro_wrap">
          <div class="intro_box">
            <p v-if="book.intro">{{ book.intro }} {{ book.intro }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BookCover from '@/components/BookCover';
import { mapGetters } from 'vuex';
import { logUserBehavior } from '@/service';
import { formatNum } from '@/utils/helpers';

export default {
  name: 'BookDetail',
  components: {
    BookCover,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    book: { // 作品信息
      type: Object,
      default: null,
    },
  },
  data() {
    return {

    }
  },
  computed: {
    ...mapGetters(['theme', 'statusBarHeight', 'isHmArk']),
    isDark() {
      return this.theme.theme === 'dark'
    },
    topDistance() {
      return this.statusBarHeight + 8;
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
  },

  created() {
    logUserBehavior({
      eventId: 'reader_control_DetailPage_shown',
      eventCode: 'shown',
    })
  },

  methods: {
    touchStart(ev) { // 手势触摸开始
      if (this.isHmArk) return;
      this.yDown = ev.touches[0].clientY;
    },
    touchMove(ev) { // 手势移动
      if (this.isHmArk) return;
      const offsetTop = this.$refs.bookTop.offsetTop
      if (!this.yDown || this.yDown > offsetTop + 134) { // 超过范围不响应
        return
      }
      ev.preventDefault()
      this.disY = ev.touches[0].clientY - this.yDown
    },
    touchEnd() { // 手势停止
      if (this.isHmArk) return;
      if (this.disY && this.disY > 0) {
        this.closeBookDetail()
        this.yDown = 0
        this.disY = 0
      }
    },
    closeBookDetail() {
      logUserBehavior({
        eventId: 'reader_close_DetailPage_shown',
        eventCode: 'shown',
      })
      this.$emit('onClose')
    }
  },
};
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
