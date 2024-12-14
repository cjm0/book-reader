<!--
 * @Description : 底部加书架提示条 AddBookBar
 * @Author      : chenjianmin
 * @Date        : 2023-02-03 14:27:04
-->
<template>
  <div
    :class="['add_bookbar_index', `add_bookbar_${theme.theme}`, showAddBookBarState === 1 && 'add_bookbar_show', showAddBookBarState === 2 && 'add_bookbar_hide']"
    :style="{
      'background-color': theme.bg,
      'height': `${bootomBarHeight}px`,
    }"
  >
    <div class="cont_bg">
      <div class="wrap">
        <BookCover class="img" :url="bookCover" :size="30"/>
        <div class="text_wrap">
          <p class="text">已为你将本书添加到书架</p>
          <p class="desc">可在设置内取消自动添加</p>
        </div>
      </div>
      <div class="btn" @click.stop="cancelAddBook">撤 销</div>
    </div>
  </div>
</template>

<script>
import BookCover from '@/components/BookCover';
import { mapGetters } from 'vuex';
import { BOOTM_BAR_HEIGHT } from '@/constants';

export default {
  name: 'AddBookBar',
  components: {
    BookCover,
  },
  props: {
    showAddBookBarState: {
      type: Number,
      default: 0,
    },
    bookCover: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      bootomBarHeight: BOOTM_BAR_HEIGHT,
      timer: null,
    };
  },
  computed: {
    ...mapGetters(['theme']),
  },
  watch: {
    showAddBookBarState(newVal) {
      if (newVal === 1) {
        this.hideBar()
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },

  methods: {
    hideBar() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => { // 加书架提示条自动关闭时
        this.$emit('hideAddBookBar')
      }, window.$config.addBookBarCloseTime)
    },
    cancelAddBook() { // 撤销
      this.$emit('cancelAddBook')
    },
  },
};
</script>

<style lang="scss" scoped>
.add_bookbar_index {
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 4;
	width: 100%;
  opacity: 0;

	animation-iteration-count: 1;
	animation-timing-function: ease-out;
	animation-duration: 200ms;
	animation-fill-mode: forwards;

	.cont_bg {
		height: 100%;
    padding: 0 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
    background-color: var(--color-button-border);
	}
  .wrap{
    flex: 1;
    overflow: hidden;
    display: flex;
    .img{
      margin-right: 12px;
    }
    .text_wrap{
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .text{
        font-weight: 400;
        @include fontSize(14px);
        @include lineHeight(16px);
        color: rgba(0, 0, 0, 0.9);
      }
      .desc{
        margin-top: 6px;
        font-weight: 400;
        @include fontSize(12px);
        @include lineHeight(14px);
        color: var(--color-4);
      }
    }
  }
  .btn{
    width: 64px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100px;
    @include fontSize(12px);
    font-weight: 500;
    color: var(--color-6);
    background-color: var(--color-button-border);
  }
}
.add_bookbar_dark {
  .wrap{
    .text_wrap{
      .text{
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}
.add_bookbar_show {
	animation-name: animationShow;
}
.add_bookbar_hide {
	animation-name: animationHide;
}
@keyframes animationShow {
	from {
		opacity: 0;
		transform: translateY(64px);
	}
	to {
		opacity: 1;
		transform: translateY(0px);
	}
}
@keyframes animationHide {
	0% {
		opacity: 1;
		transform: translateY(0px);
	}
	100% {
		opacity: 0;
		transform: translateY(64px);
	}
}
</style>
