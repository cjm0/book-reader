<template>
  <div ref="list" class="vt-list" :style="{ backgroundColor: theme.paper,}">
    <ul
      class="vt-ul"
      :style="{
        'padding-top': listStyle.paddingTop + 'px',
        'padding-bottom': listStyle.paddingBottom + 'px',
      }"
    >
      <li
        v-for="(item, index) in virtualList"
        :key="index"
        class="vt-item"
        :ref="'item' + index"
      >
        <slot :class="'cell' + index" :item="item"> </slot>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'VirtualList',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    // 预渲染除当前可视区域条数外几屏数据
    intervalPageSize: {
      type: Number,
      default: 3,
    },
    // 自动滚动到某个索引
    scrollToIndex: {
      type: Number,
      default: 0,
    },
    // 章节每行高度
    itemHeight: {
      type: Number,
      default: 48,
    },
  },
  data() {
    return {
      pageSize: 10, // 一屏展示几条
      onScrollFn: this.onScroll,
      scrollTop: 0,
    };
  },
  computed: {
    ...mapGetters(['theme']),
    /**
     * 非渲染区域用padding-bottom和padding-top来填充高度
     */
    listStyle() {
      if (!this.limitRenderRange) {
        return {
          paddingTop: this.data.length * this.itemHeight,
          paddingBottom: 0,
        };
      }
      const { min, max } = this.limitRenderRange;

      return {
        paddingTop: min * this.itemHeight,
        paddingBottom: (this.data.length - max) * this.itemHeight,
      };
    },

    /**
     * 虚拟列表，截取可渲染的数据
     */
    virtualList() {
      const { min, max } = this.limitRenderRange;
      return [...this.data.slice(min, max)];
    },
    limitRenderRange() {
      const currentIndex = Math.round(this.scrollTop / this.itemHeight);
      // 渲染数据最大量 = 上部两屏数据 + 当前可视范围内一屏数据 + 下部两屏数据
      const min = currentIndex - this.intervalPageSize * this.pageSize;
      const max = currentIndex + (this.intervalPageSize + 1) * this.pageSize;

      return {
        min: Math.max(min, 0),
        max: Math.min(this.data.length, max),
      };
    },
  },
  watch: {
    // 当章节id发生变化时自动滚动到当前章节位置
    scrollToIndex(index) {
      this.autoScrollToIndex(index);
    },
  },
  mounted() {
    this.$refs.list.addEventListener('scroll', this.onScrollFn, { passive: true });
    this.getPageSizeItemHeight();
    this.autoScrollToIndex(this.scrollToIndex);
  },
  methods: {
    // 获取一屏可以展示多少条以及每行章节的高度
    getPageSizeItemHeight() {
      // 容器的高度
      const listWrapHeight = this.$refs.list.getBoundingClientRect().height;
      // 一屏可展示章节条数
      this.pageSize = Math.round(listWrapHeight / this.itemHeight);
    },

    onScroll() {
      const { scrollTop } = this.$refs.list;
      // 当前滑到章节的位置index
      this.scrollTop = scrollTop;
    },
    autoScrollToIndex(index) {
      this.$refs.list.scrollTo(0, index * this.itemHeight);
    },
  },
  beforeDestroy() {
    this.$refs.list.removeEventListener('scroll', this.onScrollFn);
  },
};
</script>
<style scoped lang="scss">
@import './index.scss';
</style>
