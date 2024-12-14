<template>
  <div
    :class="[showPop && 'catalog_index']"
    :style="{
      'background-color': isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)',
    }"
  >
    <div
      ref="catalogBox"
      :class="[
        isHmArk ? 'is_hm_ark' : 'catalog',
        showPop && 'show_pop',
        hidePop && 'hide_pop',
      ]"
      :style="{ height: `calc(100vh - ${topDistance}px)` }"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    >
      <div class="header" :style="{ backgroundColor: theme.bg }" v-if="book">
        <div class="xmark" v-if="isHmArk">
          <div class="close-icon" @click="closeCatalog">
            <svg-icon
              icon-class="xmark"
              :class="['xmark-svg', isDark && 'xmark-svg-dark']"
            />
          </div>
        </div>
        <div class="arrow" @click="closeCatalog" v-else>
          <svg-icon
            v-if="isDark"
            icon-class="arrow-downdark"
            class="arrow-down"
          />
          <svg-icon v-else icon-class="arrow-down" class="arrow-down" />
        </div>
        <div class="book">
          <div class="book_wrap">
            <BookCover :url="book.coverHttps" :size="45" />
            <div class="book_content">
              <p class="name">{{ book.title || '' }}</p>
              <p class="author">{{ book.author || '' }}</p>
            </div>
          </div>
          <div
            class="book_detail"
            @click="toBookDetail"
            v-if="readUIConfig > 0"
          >
            书籍详情
          </div>
        </div>
        <div class="chapter">
          <div class="chapter-content">
            <div>{{ book.finished ? '已完结' : '连载中' }}</div>
            <div class="chapter-line"></div>
            <div>共 {{ maxChapterIndex }} 章</div>
          </div>
          <div class="chapter-direction" @click="changeDirection">
            <svg-icon icon-class="sort" class="sort" />
            <span class="txt">{{ sortPositive ? '倒序' : '正序' }}</span>
          </div>
        </div>
      </div>
      <div class="list" :style="{ backgroundColor: theme.bg }">
        <div v-if="catalogLoading <= 1" class="loading">
          <img
            class="loading-icon"
            src="@/assets/images/loading.webp"
            @contextmenu.prevent
          />
        </div>
        <VirtualList
          v-if="catalogLoading > 1 && list && list.length > 0"
          ref="catalog"
          :scrollToIndex="scrollToIndex"
          :data="list"
          :itemHeight="48"
          :intervalPageSize="2"
          class="virtual-list-wrap"
          :style="{ 'padding-bottom': `${navigationHeight}px` }"
        >
          <template v-slot="{ item }">
            <div
              class="list-cell"
              :ref="'chapter_' + item.ccid"
              @click="toOne(item.ccid, item.cid)"
            >
              <span
                v-if="item.ccid === activeCcid"
                class="name active"
                :style="{ color: theme.activePaper }"
              >
                {{ item.title }}
              </span>
              <span v-else class="name">{{ item.title }}</span>
            </div>
          </template>
        </VirtualList>
      </div>
    </div>
  </div>
</template>

<script>
import BookCover from '@/components/BookCover';
import VirtualList from '@/components/VirtualList';
import { mapGetters } from 'vuex';
import { logUserBehavior } from '@/service';

export default {
  name: 'Catalog',
  components: {
    VirtualList,
    BookCover,
  },
  props: {
    showPop: {
      type: Boolean,
      default: false,
    },
    hidePop: {
      type: Boolean,
      default: false,
    },
    book: {
      type: Object,
      default: null,
    },
    cbid: {
      type: String,
      default: '',
    },
    chapter: {
      type: Object,
      default: null,
    },
    chapterIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      sortPositive: true,
      changing: false,
    };
  },
  yDown: 0,
  disY: 0,

  computed: {
    ...mapGetters([
      'theme',
      'catalogList',
      'catalogLoading',
      'statusBarHeight',
      'navigationHeight',
      'readUIConfig',
      'isHmArk',
    ]),
    isDark() {
      return this.theme.theme === 'dark';
    },
    activeCcid() {
      if (this.chapter) {
        return this.chapter.ccid;
      }
      // 章节请求失败，目录章节定位
      if (this.chapterIndex) {
        // 超过目录最大章节数就定位到最后一章
        const cp = this.list[this.chapterIndex - 1] || this.list[this.list.length - 1];
        if (cp) {
          return cp.ccid;
        }
      }
      return '';
    },
    scrollToIndex() {
      if (this.changing) {
        return 0;
      }
      if (!this.activeCcid || this.list.length <= 0) {
        return 0;
      }
      return this.list.findIndex(({ ccid }) => ccid === this.activeCcid);
    },
    list() {
      const cloneList = [...this.catalogList];
      return this.sortPositive ? cloneList : cloneList.reverse();
    },
    maxChapterIndex() {
      // 最大章节索引
      return (
        this.catalogList.length || (this.book && this.book.lastChapter) || 1
      );
    },
    topDistance() {
      return this.statusBarHeight + 8;
    },
  },
  watch: {
    showPop(visible) {
      if (visible) {
        this.fixedBody();
        const catalogRef = this.$refs.catalog;
        if (catalogRef) {
          catalogRef.autoScrollToIndex(this.scrollToIndex);
        } else {
          // 尝试请求获取目录数据
          this.$store.dispatch('catalogList/getCatalogList', this.cbid);
        }
      } else {
        this.unFixedBody();
      }
    },
  },

  methods: {
    touchStart(ev) { // 手势触摸开始
      if (this.isHmArk) return;
      this.yDown = ev.touches[0].clientY;
    },
    touchMove(ev) { // 手势移动
      if (this.isHmArk) return;
      const offsetTop = this.$refs.catalogBox.offsetTop;
      if (!this.yDown || this.yDown > offsetTop + 134) {
        // 超过范围不响应
        return;
      }
      ev.preventDefault();
      this.disY = ev.touches[0].clientY - this.yDown;
    },
    touchEnd() { // 手势停止
      if (this.isHmArk) return;
      if (this.disY && this.disY > 0) {
        this.closeCatalog();
        this.yDown = 0;
        this.disY = 0;
      }
    },
    closeCatalog() {
      this.changing = false;
      this.$emit('onClose');
    },
    toOne(ccid, cid) {
      logUserBehavior({
        eventId: 'reader_menu_Chapter_clicked',
        eventCode: 'clicked',
      });
      this.changing = false;
      this.$emit('toOne', ccid, cid, 'catalog');
    },
    toBookDetail() {
      // 跳书籍详情
      logUserBehavior({
        eventId: 'reader_menu_DetailPage_clicked',
        eventCode: 'clicked',
      });
      this.changing = false;
      this.$emit('openBookDetail');
    },
    fixedBody() {
      // const { body } = document;
      // const bodyStyle = getComputedStyle(body);
      // // 有可能出现浮层内切换的情况，已经设置了就不用重复设置了。
      // if (bodyStyle.position !== 'fixed') {
      //   const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      //   body.style.cssText += `position:fixed;top:-${scrollTop}px;`;
      // }
    },
    unFixedBody() {
      // const scrollEle = document.body;
      // const { top } = scrollEle.style;
      // scrollEle.style = null;
      // // eslint-disable-next-line no-multi-assign
      // document.body.scrollTop = document.documentElement.scrollTop = -parseInt(
      //   top,
      //   10,
      // );
    },
    // 改变目录顺序
    changeDirection() {
      this.changing = true; // 拦截 scrollToIndex
      this.sortPositive = !this.sortPositive;
      setTimeout(() => {
        this.$refs.catalog.$el.scrollTo({
          left: 0,
          top: 0,
          behavior: 'instant',
        });
      }, 0);
    },
  },
  beforeDestroy() {
    this.unFixedBody();
  },
};
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
