<!--
 * @Description : 阅读器章尾推书栏目 BookRecommend
 * @Author      : p_ywqqzhang
 * @Date        : 2023-06-18
-->

<template>
  <div
    ref="refBookRecommend"
    :class="[
      'book_recommend_index',
      isDark && 'book_recommend_dark',
      !isShowBookList && 'book_recommend_empty',
      pageMode === 'vertical' && 'book_recommend_v',
    ]"
    @touchstart="touchStart"
    @touchmove.passive="touchMove"
    @touchend="touchEnd"
    @touchcancel="touchEnd"
  >
    <div class="recommend_top" ref="currentBookModule">
      <BookCover :url="bookInfo.coverHttps" :size="72" />
      <p class="book_name">{{ bookInfo.title }}</p>
      <p class="book_finished"><span class="line_left"></span>{{ bookFinished }}<span class="line_right"></span></p>
    </div>
    <template v-if="isShowBookList">
      <div class="current_book_recommend" :style="{'background-color': theme.bg}">
        <p class="title">读过本书的人也在看</p>
        <div class="book_list">
          <div
            class="book"
            v-for="(book, index) in otherLookBookList"
            :key="book.hwBookId + index"
            @click.stop="toRead(book, 1)"
          >
            <BookCover :url="book.cover" :size="62" />
            <p class="book_name">{{ book.name }}</p>
            <p class="book_score" :style="{color: theme.activePaper}">{{ book.score }}分</p>
          </div>
        </div>
      </div>
      <div class="for_you_recommend" :style="{'background-color': theme.bg}" v-if="recommendBookList.length > 0">
        <p class="title txt_dark">为你推荐</p>
        <div class="book_list">
          <div
            class="book"
            v-for="(book, index) in recommendBookList"
            :key="book.hwBookId + index"
            @click.stop="toRead(book, 2)"
          >
            <BookCover :url="book.cover" :size="62" class="book_cover" />
            <div class="book_right">
              <p class="book_title"><span class="book_name">{{ book.name }}</span><span class="book_score" :style="{color: theme.activePaper}">{{ book.score }}分</span></p>
              <p class="book_intro">{{ book.introduction }}</p>
              <p class="book_category"><span v-if="book.categoryNameList[0]">{{ book.categoryNameList[0] }}</span><span v-if="book.categoryNameList[1]">{{ book.categoryNameList[1] }}</span><span v-if="book.categoryNameList[2]">{{ book.categoryNameList[2] }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div v-else :class="['back', isDark && 'back_dark']" @click.stop="onBack">返回书城</div>
  </div>
</template>

<script>
import BookCover from '@/components/BookCover';
import { mapGetters } from 'vuex';
import { logUserBehavior } from '@/service';
import jsbridge from '@/utils/jsbridge';
import { getRecommendBooks } from '@/pages/read/read.js';

export default {
  name: 'BookRecommend',
  components: {
    BookCover,
  },
  props: {
    pageMode: {
      type: String,
      default: '',
    },
    hwbid: {
      type: String,
      default: '',
    },
    bookInfo: {
      type: Object,
      default: () => {},
    },
    showBookRecommend: {
      type: Boolean,
      default: false,
    },
    moveXIng: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      bookList: [], // 当前推荐书籍列表
      // recommendBooks: [], // 推荐书籍原始数据
    }
  },
  computed: {
    ...mapGetters(['theme']),
    isDark() {
      return this.theme.theme === 'dark'
    },
    isShowBookList() { // 是否展示书籍列表
      return this.bookList.length > 0
    },
    otherLookBookList() { // 读过本书的人也在看
      return this.bookList.slice(0, 4)
    },
    recommendBookList() { // 为你推荐
      return this.bookList.slice(4, 10)
    },
    bookFinished() {
      return this.bookInfo.finished === 1 ? '全书完' : '未完待续'
    },
  },
  watch: {
    showBookRecommend: {
      handler(newVal) {
        if (newVal) { // // 请求数据时机：由外部控制，横翻提前 3 页，竖翻提前 1章
          this.getBooks()
        }
      },
      immediate: true,
    },
    moveXIng(newVal) { // 横向滑动中，竖向不可滚动
      this.$refs.refBookRecommend.style.overflowY = newVal ? 'hidden' : 'auto'
    }
  },

  mounted() {
    this.observeSection()
  },

  methods: {
    async getBooks() { // 获取书籍
      // 已有书籍不再请求
      if (this.bookList.length > 0) {
        return
      }

      // 从 kit 获取推荐书
      const result = await getRecommendBooks(this.hwbid, '2', 15)
      if (result) {
        this.recommendBooks = result[0]
        if (result[1].length > 0) {
          this.bookList = result[1].slice(0, 10) // 只取 10 本
          this.reportBook()
        }
      }
    },

    toRead(book, column) { // 跳另一本书
      logUserBehavior({
        eventId: 'reader_recommendedBooks_clicked',
        eventCode: 'clicked',
        eventInfo: {
          ext1: column, // 1-读过这本书的人也在看 2-为你推荐
          ext2: book.cbid,
        },
      })
      // 跳走前上报阅读时长
      this.$emit('onLeave')

      // 小说卡片点击时先调用此接口
      const eBook = this.recommendBooks.filter(val => val.ebookInfo.hwBookId === book.hwBookId)
      jsbridge.call('clickFeedsCard', eBook[0])
      window.location.replace(book.link)
    },
    onBack() { // 返回书城
      logUserBehavior({
        eventId: 'reader_AfterReading_return_clicked',
        eventCode: 'clicked',
      })

      location.href = 'hwbrowser://com.huawei.browser/parameter?source=novelReaderApp&scene=8&channelId=HW_NOVEL_H5_ZH&skipSplashAd=1'
    },
    // 手势触摸
    touchStart(ev) { // 手势触摸开始
      if (this.isLimit()) {
        return
      }
      const touch = ev.clientX ? ev : ev.touches[0]
      this.xDown = touch.clientX
      this.yDown = touch.clientY
    },
    touchMove(ev) { // 手势移动
      if (this.isLimit()) {
        return
      }

      const touch = (ev.clientX || ev.clientX === 0) ? ev : ev.touches[0]
      const xDiff = Math.abs(this.xDown - touch.clientX)
      const yDiff = Math.abs(this.yDown - touch.clientY)
      if (yDiff > xDiff && yDiff > 0) {
        this.$emit('onMoveYIng', true) // 竖向滑动中
      }
    },
    touchEnd() { // 手势停止移动
      if (this.isLimit()) {
        return
      }
      this.$emit('onMoveYIng', false) // 竖向滑动结束
    },
    isLimit() { // 竖翻和横翻页面移动中不执行
      return this.pageMode === 'vertical'
    },

    // 监听节点曝光
    observeSection() {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((el) => {
            if (el.intersectionRatio > 0) {
              if (el.isIntersecting) {
                this.log('曝光')
                this.show = true
                logUserBehavior({
                  eventId: 'reader_recommendedBooks_wholePage_shown',
                  eventCode: 'shown',
                })
                this.reportBook()
              }
            }
          });
        },
        {
          rootMargin: '0px 0px 0px 0px',
          threshold: 0.1, // 元素出现的阈值，当元素出现比例为0.1时，触发一次监听
        },
      );
      const bookRef = this.$refs.refBookRecommend
      bookRef && this.observer.observe(bookRef)
    },
    reportBook() { // 书封曝光上报
      if (this.show && this.bookList.length > 0) {
        this.bookList.forEach((item, index) => {
          logUserBehavior({
            eventId: 'reader_recommendedBooks_shown',
            eventCode: 'shown',
            eventInfo: {
              ext1: index < 4 ? 1 : 2, // 1-读过这本书的人也在看 2-为你推荐
              ext2: item.cbid,
            },
          })
        })
        this.log('书封曝光')
      }
    },
    log(name, ...msg) {
      console.log(`章尾推荐书籍-${name}`, ...msg);
    },
  },
};
</script>

<style scoped lang="scss">
@import './index.scss'
</style>