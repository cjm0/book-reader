<!--
 * @Description : 退出加书架弹窗 AddBookShelf
 * @Author      : chenjianmin
 * @Date        : 2023-02-03 14:27:04
-->
<template>
  <van-overlay
    :show="show"
    @click="onClickMask"
    :style="{'background-color': isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)'}"
    z-index="1100"
  >
    <div class="add_bookshelf_index is_hm_ark" v-if="isHmArk">
      <div class="block" @click.stop>
        <BookCover class="cover" :url="cover" :size="96"/>
        <div class="content-area">
          <span class="message">喜欢本书就加入书架吧</span>
        </div>
        <div class="btn-area">
          <div class="btn cancel" @click="onCancel">暂不加入</div>
          <div class="btn confirm" @click="onConfirm">加入书架</div>
        </div>
      </div>
    </div>
    <div class="add_bookshelf_index" v-else>
      <div
        class="block"
        :style="{ backgroundColor: theme.bg}"
        @click.stop
      >
        <div class="closebtn" @click="onClose">
          <svg-icon icon-class="close" :class="['close', isDark && 'close-dark']"/>
        </div>
        <BookCover class="cover" :url="cover" :size="96"/>
        <div class="content-area">
          <span class="message">喜欢本书就加入书架吧</span>
        </div>
        <div class="btn-area">
          <div class="btn cancel" @click="onCancel">退出</div>
          <div class="btn-line"></div>
          <div class="btn confirm" @click="onConfirm">确定</div>
        </div>
      </div>
    </div>
  </van-overlay>
</template>

<script>
import { mapGetters } from 'vuex';
import BookCover from '@/components/BookCover';
import { loginMixin } from '@/mixins/login';

export default {
  mixins: [loginMixin],
  components: {
    BookCover,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    cover: {
      type: String,
      default: '',
    },
    theme: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    ...mapGetters(['isHmArk']),
    isDark() {
      return this.theme.theme === 'dark'
    },
  },

  methods: {
    onClickMask() {
      // 鸿蒙单框机
      if (this.isHmArk) {
        this.onClose();
      }
    },
    onClose() {
      this.$emit('onClose');
    },
    onCancel() {
      this.$emit('onCancel');
    },
    async onConfirm() {
      try {
        await this.beforeAddShelfCheck();
      } catch (err) {
        console.log('当前状态未登录', err);
        return false;
      }
      this.$emit('onConfirm');
    },
  },
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
