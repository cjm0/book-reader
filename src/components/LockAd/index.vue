<!--
 * @Description : 拦截式广告 LockAd
 * @Author      : chenjianmin
 * @Date        : 2023-02-03 14:27:04
-->
<template>
  <div
    v-if="showAd"
    ref="lockAd"
    class="lock_ad_index"
    :style="{ bottom: pageMode==='horizontal'?'14px':'0px' }"
  >
    <p class="text">{{adText}}</p>
  </div>
</template>

<script>
import IntersectionObserver from 'intersection-observer-polyfill';

export default {
  name: 'FixBottonAD',
  props: {
    adConfig: {
      type: Object,
      default: null,
    },
    controlLockAd: {
      type: Object,
      default: null,
    },
    ccid: {
      type: String,
      default: '',
    },
    pageIndex: { // 页数
      type: Number,
      default: 0,
    },
    showLockAdStr: { // 字串匹配则显示
      type: String,
      default: '',
    },
    pageMode: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showAd: false, // 是否显示以及初始化广告拦截条
      lock: true,
      timer: null,
      theLockIng: false, // 当前组件是否锁定状态
      lockChapterTime: this.adConfig.lockChapterConfig.lockChapterTime
    };
  },
  computed: {
    adText() {
      return this.lock ? `${this.lockChapterTime} 秒后，自动解锁下一章` : '继续阅读下一章'
    }
  },
  watch: {
    showLockAdStr: {
      handler(preload) {
        if (preload === `${this.ccid}_${this.pageIndex}`) {
          this.init()
        }
      },
    },
  },
  created() {
    // this.init()
  },
  beforeDestroy() {
    clearTimeout(this.timer)

    // 横翻只有一个，切章被销毁需要重置状态。竖翻有多个，切章当前组件被销毁需要重置状态
    if (this.theLockIng) {
      window.$config.lockIngCcid = ''
      this.$store.commit('adConfig/setControlLockAd', { lockIng: false })
      if (this.pageMode === 'vertical') {
        this.showNode()
      }
    }
  },

  methods: {
    init() {
      // 已经锁过的章节不再锁章
      if (window.$config.lockCacheCcids.includes(this.ccid)) {
        return
      }
      // 已经在锁定状态，往回看不再出现新的锁章
      if (this.controlLockAd.lockIng) {
        return
      }

      window.$config.lockIngCcid = this.ccid
      this.showAd = true
      this.theLockIng = true
      this.$store.commit('adConfig/setControlLockAd', { lockIng: true })
      this.$nextTick(() => {
        this.observeSection();
      })
    },
    // 监听节点曝光
    observeSection() {
      const lockAdRef = this.$refs.lockAd
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((el) => {
            if (el.intersectionRatio > 0) {
              if (el.isIntersecting) {
                console.log('锁章文字曝光，倒计时开始')
                this.countDown()
                this.observer.unobserve(lockAdRef)
              } else {
                this.adInView = false;
              }
            }
          });
        },
        {
          rootMargin: '0px 0px 0px 0px',
          threshold: 0.1, // 元素出现的阈值，当元素出现比例为0.1时，触发一次监听
        },
      );
      lockAdRef && this.observer.observe(lockAdRef)
    },
    countDown() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        const lockTime = this.lockChapterTime - 1
        this.lockChapterTime = lockTime > 0 ? lockTime : 1
        if (lockTime <= 0) {
          window.$config.lockCacheCcids.push(this.ccid)
          window.$config.lockIngCcid = ''
          this.lock = false
          this.theLockIng = false
          this.$store.commit('adConfig/setControlLockAd', { lockIng: false })

          // 竖翻解锁处理
          if (this.pageMode === 'vertical') {
            this.$nextTick(() => {
              this.showNode()
            })
          }
        } else {
          this.countDown()
        }
      }, 1000)
    },
    showNode() {
      const nodeList = document.querySelectorAll('.vchapter_index')
      nodeList.forEach((node, index) => {
        if (node.style.display === 'none') {
          nodeList[index].style.display = 'block'
        }
      })
      this.$store.commit('adConfig/setControlLockAd', { lockVertical: false })
    }
  }
};
</script>

<style lang="scss" scoped>
.lock_ad_index{
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  .text{
    @include fontSize(12px);
    font-weight: 400;
    color: var(--color-4);
  }
}
</style>
