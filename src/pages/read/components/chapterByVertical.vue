<template>
  <div
    ref="vchapter"
    :id="'vchapter' + chapter.cid"
    class="vchapter_index"
    :style="{
      padding:`${topbarHeight}px ${paddingHorizontal}px 16px`,
      height: showChapter ? 'auto': offsetHeight,
    }"
    @click="setTool"
  >
    <div v-if="showChapter">
      <div
        ref="scrollView"
        class="chapter"
        :style="{
          fontSize: textFontSize + 'px',
          lineHeight: fontLineHeight,
          color: theme.color
        }"
      >
        <template v-for="(item, index) in contentList">
          <NativeAd
            v-if="item.ad && item.adType === 'nativeAd'"
            :key="`${chapter.ccid}${item.id}`"
            :ccid="chapter.ccid"
            :cid="chapter.cid"
            :pageIndex="item.adIndex"
            :clientWidth="clientWidth"
            :innerWidth="innerWidth"
            :innerHeight="innerAdHeight"
            class="ad_box"
            :style="{ padding: `70px 0px ${70 + item.pb}px` }"

            :adConfig="novelInsideAdConfig"
            :preloadAd="shouldPreloadAd(index)"
            :thresholdCancelAd='shouldCancelAd(index)'
            :shouldLoadRewardAd="shouldLoadRewardAd"
            :isShowAdHover="isShowAdHover"
            :isLockAd="item.lock"
            :insertAd="item.insertAd"
            :adLength="adLength"
            turnPagesMode="vertical"
            @reportHw="reportHw"
            @reportYw="reportYw"
            @on-error="onAdError(index)"
            @on-close="onAdClose(index)"
            @on-reward="onReward('nativeAd', $event)"
            @on-reward2="onReward('insertAd', $event)"
            @on-load="setOffset"
          />
          <DownAd
            v-else-if="item.ad && item.adType === 'downAd'"
            :key="`${chapter.ccid}${item.id}_down`"
            :ccid="chapter.ccid"
            :cid="chapter.cid"
            :adIndex="index"
            :pageIndex="item.adIndex"
            :clientWidth="clientWidth"
            :innerWidth="innerWidth"
            :innerHeight="innerAdHeight"
            style="padding:150px 0"

            :adConfig="novelInsideAdConfig"
            :preloadAd="shouldPreloadAd(index)"
            :thresholdCancelAd='shouldCancelAd(index)'
            pageMode="vertical"
            @reportHw="reportHw"
            @reportYw="reportYw"
            @setDownDialog="setDownDialog"
            @closeDownDialog="closeDownDialog"
            @toggleAdType="toggleAdType"
            @on-close="onAdClose(index)"
            @on-error="onAdError(index)"
            @on-reward="onReward('downAd', $event)"
          />
          <!-- <RewardAd
            v-else-if="item.chapterBottomAd"
            :key="chapter.ccid + index"
            :posType="4"
            :style="{marginTop:'300px'}"
            :blockType="HWAD_TYPE.REWARD"
            :ccid="chapter.ccid"
            :pageIndex="getTotalPages()"
            @on-reward="onReward('chapter', $event)"
          /> -->
          <!-- 尾章推书 -->
          <BookRecommend
            v-if="bookInfo && item.isBookLast"
            :key="`${chapter.ccid}${item.id}_recommend`"
            pageMode="vertical"
            :hwbid="hwbid"
            :bookInfo="bookInfo"
            :showBookRecommend="showBookRecommend"
            @onLeave="onLeave"
          />
          <template v-else>
            <h2
              v-if="item.isTitle"
              :key="`${chapter.ccid}${item.id}_t`"
              :id="`p_${chapter.cid}_${item.pIndex}_${item.textIndex}`"
              class="title"
              :style="{ fontSize: titleFontSize + 'px' }"
            >{{item.text || ''}}</h2>
            <p
              v-else-if="!item.adIndex"
              :key="`${chapter.ccid}${item.id}`"
              :id="`p_${chapter.cid}_${item.pIndex}_${item.textIndex}`"
              :class="[item.pFirst && 'indent', item.center && 'center']"
              :style="{
                paddingTop: (item.pFirst ? fontSizeInitial : 0) + 'px'
              }"
            >{{ item.text }}</p>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import NativeAd from '@/components/NativeAd';
import { mapGetters } from 'vuex';

import { HWAD_TYPE } from '@/constants/index';
import { addLockAd, addDownAd, addInsertAd  } from '@/pages/read/read.js';
import Reader from '@/js/reader-layout.js'
import jsbridge from '@/utils/jsbridge';
import { getGap } from '@/utils/helpers';
import { logUserBehavior } from '@/service';

export default {
  name: 'ChapterContent',
  components: {
    NativeAd,
    DownAd: import('@/components/DownAd'),
    // RewardAd,
    BookRecommend: import('@/components/BookRecommend'),
  },
  props: {
    hwbid: {
      type: String,
      default: '',
    },
    bookInfo: {
      type: Object,
      default: null,
    },
    chapterIndex: {
      type: Number,
      default: 0,
    },
    chapter: {
      type: Object,
      default: null,
    },
    curChapter: {
      type: Object,
      default: null,
    },
    list: {
      type: Array,
      default: () => [],
    },
    scrollY: {
      type: Number,
      default: 0,
    },
    isFirstChapter: {
      type: Boolean,
      default: false,
    },
    originCid: {
      type: Number,
      default: 1,
    },
    clientWidth: {
      type: Number,
      default: 0,
    },
    clientHeight: {
      type: Number,
      default: 0,
    },
    bootmAdHeight: { // 固底广告高度
      type: Number,
      default: 0,
    },
    footerHeight: { // 电量高度
      type: Number,
      default: 0,
    },

    shouldLoadPpsbAd: { // 是否应该创建pps广告
      type: Boolean,
      default: false,
    },
    shouldLoadRewardAd: { // 是否应该创建激励视频广告
      type: Boolean,
      default: false,
    },
    shouldLoadChapterBottomAd: { // 是否应该加载章末激励视频
      type: Boolean,
      default: false,
    },
    shouldLoadLockAd: { // 是否应该插入锁章广告
      type: Boolean,
      default: false,
    },
    canLoadAd: { // 是否可预加载插页广告
      type: Boolean,
      default: false,
    },
    isShowAdHover: { // 是否滑动触发广告点击
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      offsetHeight: 0,
      offsetTop: 0,
      HWAD_TYPE,
    };
  },
  computed: {
    ...mapGetters([
      'theme',
      'fontSizeRatio',
      'fontSize',
      'fontSizeInitial',
      'titleFontSize',
      'fontLineHeight',
      'novelInsideAdConfig',
      'adStartPage',
      'controlLockAd',
      'topbarHeight',
      'freeAdConfig',
      'downAdConfig',
      'insertAdConfig',
    ]),
    // 只渲染上下各1章的内容，参数可配
    showChapter() {
      return this.chapter && Math.abs(this.chapter.cid - this.curChapter.cid) <= 1
    },
    paddingHorizontal() { // 内容边距
      return getGap(this.clientWidth)
    },
    bottomHeight() { // 底部位置高度
      return this.footerHeight + this.bootmAdHeight
    },
    innerWidth() { // 章节容器的宽度
      return this.clientWidth - this.paddingHorizontal * 2;
    },
    innerAdHeight() { // 广告容器的高度
      // 减去头部导航、底部高度、留4px间隙
      return this.clientHeight - this.topbarHeight - this.bottomHeight - 4
    },
    lineHeight() { // 行高
      return this.fontSizeInitial * this.fontLineHeight;
    },
    textFontSize() { // 章节文字字号大小
      // 系统设置小字号，横翻文字总高度超出一页
      const px = [18, 24, 36].includes(this.fontSizeInitial) ? 1 : 0
      return this.fontSizeRatio < 1 ? Math.floor(this.fontSize) - px : this.fontSize
    },
    clientTextLines() { // 一屏可展示多少行内容，字号 * 行高 = 一行高度
      return Math.floor(this.clientHeight / this.lineHeight);
    },
    rawTextList() {
      /*
        center: true // 是否居中
        isTitle: false // 是否标题
        pFirst: true // 是否段落首行
        pIndex: 1 // 章节段落位置
        lineIndex: 1 // 段落行位置
        textIndex: 2, // 文字在段落未分行的固定位置
        text: "柔和的光晕宛如母亲的手，" // 行文字内容
      */
      console.time('paint')
      const list = Reader(this.chapter.content, {
        type: 'line',
        width: this.innerWidth, // 容器宽度
        // height: this.innerHeight, // 容器高度
        fontSize: this.fontSizeInitial, // 段落字体大小
        lineHeight: this.fontLineHeight, // 段落文字行高
        pGap: this.fontSizeInitial, // 段落间距
        title: this.chapter.title, // 标题
        titleSize: this.fontSizeInitial * 1.3, // 标题字体大小
        titleHeight: 1.5, // 标题文字行高
        titleWeight: 500, // 标题文字字重
        titleGap: 0, // 标题距离段落的间距
      })
      console.timeEnd('paint')
      // console.log('v_rawTextList', list);
      return list;
    },
    contentList() {
      let result = [];
      const { cid, ccid, nextCcid } = this.chapter
      const freeAd = this.isFreeAd(cid)
      const hasAd = this.shouldLoadPpsbAd && !freeAd

      // 插入内容和广告
      if (this.rawTextList.length > 0) {
        const { showAdInterval } = this.novelInsideAdConfig || {};
        let adIndex = 0;
        this.rawTextList.forEach((p, index) => {
          result.push({ ...p, ad: false, id: `list${index}` });

          // 如果当前行数是N屏内容行数的倍数，插页广告
          if (hasAd && (index + 1) % (this.clientTextLines * showAdInterval) === 0) {
            // 调控广告下边距
            const next = this.rawTextList[index + 1]
            let pb = 0
            if (next && next.pFirst) { // 段头上广告减去段间距
              pb = -this.fontSizeInitial
            }
            if (!next) { // 章尾广告去掉下边距
              pb = -70
            }

            const { pIndex = 0, lineIndex = 0, textIndex = 0 } = p
            adIndex = adIndex + showAdInterval + 1;
            result.push({
              adIndex,
              pb,
              id: `ad${index}${pIndex}${lineIndex}${textIndex}`, // id 保持独立防止不更新
              ad: true,
              adType: 'nativeAd', // nativeAd-插页广告 downAd-激励下载广告
              lock: false, // 是否锁章广告
              insertAd: false, // 是否激励插页广告
              text: null,
            });
          }
        });
      }
      // 锁章广告
      if (this.shouldLoadLockAd && hasAd) {
        const intervel = Number(this.novelInsideAdConfig.lockChapterConfig.lockChapterInterval)
        result = addLockAd(result, cid, ccid, nextCcid, this.originCid, intervel)
      }
      // 激励下载广告
      if (this.downAdConfig && hasAd) {
        result = addDownAd(result, this.downAdConfig, cid, this.originCid)
      }
      // 激励插页广告
      if (this.insertAdConfig && hasAd) {
        result = addInsertAd(result, this.insertAdConfig, cid, this.originCid)
      }
      // 章末广告
      /* 暂时先关闭竖滑模式章末广告，待产品交互方案确认后再打开（2023-02-17号）
      if (this.shouldLoadChapterBottomAd && !freeAd) {
        result.push({
          text: null,
          chapterBottomAd: true
        });
      } */
      // 章尾插入推书页
      if (nextCcid === '-1') {
        result.push({ id: 'bookLast', isBookLast: true });
      }

      // console.log(333, 'v_contentList', result);
      return result;
    },
    adLength() { // 此章广告个数
      const arr = this.contentList.filter(v => v.ad)
      return arr.length
    },
    showBookRecommend() { // 最后一章内容展示出章尾推书
      return this.curChapter.nextCcid === '-1'
    },
  },
  watch: {
    // 切章行为，重新计算offsetTop和offsetHeight
    curChapter() {
      if (this.showChapter) {
        this.setOffset()
        if (!this.observer) {
          this.observeSection('refresh')
        }
      } else {
        this.observeSection('disconnect')
      }
    },
    list() {
      if (!this.showChapter) {
        return
      }
      this.setOffset();
      this.lockAd()
    },
    // 监听渲染章节滚动距离，执行切章逻辑
    scrollY(scrollY) {
      // if (!this.showChapter) {
      //   return
      // }
      this.switchChapter(scrollY)
    },

    // 内容发生变化，重新计算offsetTop和offsetHeight
    contentList() {
      if (!this.showChapter) {
        return
      }
      this.setOffset();
    },
    // 监听锁章结束节点恢复 block 后再获取下 offsetHeight
    'controlLockAd.lockVertical'(newVal) {
      if (!this.showChapter) {
        return
      }
      if (!newVal && this.chapter.cid > this.curChapter.cid) {
        this.setOffset()
      }
    },
  },

  mounted() {
    this.setOffsetInit()
    this.scrollToCurChapter()
    this.observeSection()
  },

  methods: {
    isCurChapter() { // 是否当前章节
      return this.chapter.ccid === this.curChapter.ccid
    },
    getTotalPages() { // 获取当前章被分成了多少页
      if (!this.$refs.vchapter) {
        return 0
      }
      const { offsetHeight } = this.$refs.vchapter;
      return Math.ceil(offsetHeight / this.clientHeight)
    },
    setOffset() {
      this.$nextTick(() => {
        this.setOffsetInit()
      });
    },
    setOffsetInit() {
      const { offsetTop, offsetHeight } = this.$refs.vchapter;
      this.offsetTop = offsetTop;
      this.offsetHeight = offsetHeight;
    },
    scrollToCurChapter() { // 滚动到当前章节
      // 前插章节保持滚动不变
      const prevState = window.$config.preloadPrevState
      const offsetHeight = this.offsetHeight
      const isPrev = this.curChapter.cid - this.chapter.cid === 1
      console.log(333, 'scrollToCurChapter', isPrev, prevState, offsetHeight, this.scrollY);
      if (prevState > 2 && isPrev) {
        if (offsetHeight) {
          const scrollH = window.$config.preloadPrevState === 31 ? offsetHeight + this.scrollY : offsetHeight
          this.scrollTo(scrollH)
        }
        window.$config.preloadPrevState = 0
        return
      }

      this.state === 'changing'
      if (this.isCurChapter()) {
        setTimeout(() => {
          // 滚动到指定位置
          const y = this.isFirstChapter ? 0 : this.offsetTop
          if (!this.hasProgressLine()) {
            return this.scrollTo(y)
          }

          // 滚动到指定元素
          const { ccid, cid } = this.chapter
          const { pIndex, textIndex } = window.$config.progressLine
          const { pIndexNew, textIndexNew } = this.findLineIndex(pIndex, textIndex)
          console.log(333, 2, `#p_${cid}_${pIndexNew}_${textIndexNew}`);
          const dom = document.querySelector(`#p_${cid}_${pIndexNew}_${textIndexNew}`)
          if (!dom) { // 匹配失败走滚动位置
            return this.scrollTo(y)
          }
          const block = cid <= 1 && pIndexNew === 0 ? 'start' : 'end' // 竖翻首章标题用 start
          dom.scrollIntoView({ block, behavior: 'auto' }) // 此处滚动大概需要 50ms
          window.$config.progressLine = { // 保存新的滚动行位置
            ...window.$config.progressLine,
            ccid,
            pCid: cid,
            pIndex: pIndexNew,
            textIndex: textIndexNew,
          }
          // 手动滚过底部高度
          const bottomH = this.getBottomH(cid)
          if (bottomH && block !== 'start') {
            setTimeout(() => {
              const scrollTop = this.getScrollTop()
              this.scrollTo(scrollTop + bottomH)
            }, 30)
          } else if (block === 'start') {
            setTimeout(() => {
              const scrollTop = this.getScrollTop()
              this.scrollTo(scrollTop - this.topbarHeight) // start 需要减去头部导航高度
            }, 30)
          } else {
            this.scrollTo(-1)
          }
          // console.log(333, 'scrollIntoView', `#p_${pIndex}_${textIndex}`, `#p_${cid}_${pIndexNew}_${textIndexNew}`);
        }, 0);
      }
    },
    scrollTo(y) { // 滚动到指定位置
      // console.log(333, 'scroll', y);
      if (y >= 0) {
        document.body.scrollTo({ left: 0, top: y, behavior: 'instant' });
      }
      this.waitScroll = false
      this.state === ''
      window.$config.progressLine.timeEnd = new Date() * 1
    },
    getScrollTop() {
      return document.body.scrollTop || document.documentElement.scrollTop;
    },
    switchChapter(scrollY) { // 切章
      if (scrollY && !this.isCurChapter()) {
        const min = this.offsetTop - this.clientHeight / 2 // 本章至少滚了半页以上
        const max = this.offsetHeight + min // 距离本章滚完还剩半页
        if (scrollY > min && scrollY <= max) {
          console.log('开始切章了：scrollY', scrollY, this.chapter.title);
          this.$emit('setCurrentChapter', this.chapter);
        }
      }
      if (scrollY && !this.controlLockAd.lockVertical) {
        this.lockAd()
      }
    },

    findLineIndex(pIndex, textIndex) { // 查找新位置
      const { cache } = window.$config.progressLine
      const lineIndex = this.contentList.findIndex((p, i) => {
        if (p.pIndex === pIndex) { // 同一段
          let nextP = this.contentList[i + 1]
          if (nextP && nextP.ad) { // 跳过广告
            nextP = this.contentList[i + 2]
          }
          if (p.textIndex === textIndex) { // 缓存需要全等
            return true
          }
          // 此行小 && 下行不存在或者下行大
          if (!cache && p.textIndex < textIndex && (!nextP || nextP.pIndex > pIndex || nextP.textIndex > textIndex)) {
            return true
          }
        }
      })
      const p = this.contentList[lineIndex]
      if (p) {
        return { pIndexNew: p.pIndex, textIndexNew: p.textIndex }
      }
      return {}
    },
    hasProgressLine() { // 获取当前章节是否有行进度
      const { ccid, textIndex } = window.$config.progressLine
      if (this.chapter.ccid === ccid && textIndex >= 0) {
        return true
      }
    },
    observeSection(type) { // 监听行节点曝光
      if (type === 'disconnect') { // 停止监听
        if (this.observer) {
          this.observer.disconnect()
          this.observer = null
        }
        return
      }
      if (this.hasProgressLine()) {
        this.waitScroll = true
      }
      if (type === 'refresh') {
        this.$nextTick(() => {
          this.createObserver()
        })
      } else {
        this.createObserver()
      }
    },
    getBottomH(cid) { // 按免广章节计算底部高度
      return this.isFreeAd(cid) ? this.footerHeight : this.bottomHeight
    },
    createObserver() { // 创建监听
      const { ccid, cid } = this.chapter
      const bottomH = this.getBottomH(cid)
      const dom = document.querySelectorAll(`[id^='p_${cid}']`)
      if (dom) {
        this.observer = new IntersectionObserver(
          (entries) => {
            const loadIng = window.$config.loadIng
            if (!this.waitScroll && loadIng !== 1 && loadIng !== 3) {  // 等待中、loading 中不响应
              entries.forEach((item) => {
                const { intersectionRatio, isIntersecting, boundingClientRect, target } = item
                if (intersectionRatio > 0 && boundingClientRect.bottom > 100) { // 初始化的不需要 && 只观察页面底部的
                  const next = target.previousSibling || {}
                  let id = isIntersecting ? target.id : next.id
                  if (id) {
                    // const text = isIntersecting ? target.innerHTML : next.innerHTML
                    // console.log(333, 'observeSection', text, id);
                    id = id.split('_')
                    window.$config.progressLine = { // 记录滚动行位置
                      ...window.$config.progressLine,
                      ccid,
                      pCid: Number(id[1]),
                      pIndex: Number(id[2]),
                      textIndex: Number(id[3]),
                    }
                  }
                }
              })
            }
          },
          {
            root: document.querySelector('#read_body'),
            rootMargin: `0px 0px -${bottomH}px 0px`,
            threshold: 0.6, // 元素出现的比例阈值
          },
        )
        dom.forEach(el => {
          this.observer.observe(el)
        })
      }
    },
    setTool() {
      if (this.isLock()) { // 锁章状态禁止菜单栏弹出-锁章
        return
      }
      this.$emit('setTool')
    },

    // 广告
    isFreeAd(cid) { // 按照各自章节计算免广状态-免广章节
      return this.freeAdConfig > 0 && cid <= this.freeAdConfig
    },
    isUpdateAd() { // 是否更新广告
      if (!this.isCurChapter()) { // 只监听本章节广告
        return false
      }
      if (this.state === 'changing') { // 重置中不更新广告
        return false
      }
      return true
    },
    shouldPreloadAd(index) { // 判断何时进行预加载广告
      if (!this.isUpdateAd()) {
        return false
      }
      if (this.scrollY <= 0 && this.chapterIndex > 0) {
        return false
      }
      if (!this.canLoadAd) { // 不预加载插页广告
        return
      }
      const scrollHeight = this.scrollY - this.offsetTop
      const interval = Math.abs((index + 1) * this.lineHeight - scrollHeight)
      const client = this.clientHeight
      return interval <= client * this.adStartPage && interval > client
    },
    shouldCancelAd(index) { // 判断何时应该移除广告
      if (!this.isUpdateAd()) {
        return false
      }
      const scrollHeight = this.scrollY - this.offsetTop
      const interval = Math.abs((index + 1) * this.lineHeight - scrollHeight)
      return interval <= this.clientHeight
    },
    isLock() { // 是否锁章状态-锁章
      return this.controlLockAd.lockIng
    },
    lockAd() { // 锁章状态隐藏下一章节-锁章
      const { ccid } = this.chapter
      if (this.isLock() && ccid && ccid === window.$config.lockIngCcid) {
        this.$nextTick(() => {
          const cpIndex = this.list.findIndex(val => val.ccid === ccid)
          const nodeList = document.querySelectorAll('.vchapter_index')
          // console.log(333, 'lockAd', cpIndex, nodeList.length);
          nodeList.forEach((node, index) => {
            if (index > cpIndex) {
              nodeList[index].style.display = 'none'
            }
          })
          this.$store.commit('adConfig/setControlLockAd', { lockVertical: true })
        })
      }
    },
    toggleAdType(ccid, index) { // 切换广告类型：激励下载失败用插页替换回来
      this.updateAd(index, {
        adType: 'nativeAd'
      })
    },
    onAdClose(index) {
      this.updateAd(index, {
        text: null,
        ad: false,
      })
    },
    onAdError(index) {
      this.updateAd(index, {
        text: null,
        ad: false,
      })
    },
    updateAd(index, param) { // 更新数据
      this.$set(this.contentList, index, {
        ...this.contentList[index],
        ...param
      });
      this.$forceUpdate();
    },
    // 激励视频开启免广告权益
    onReward(type, detail) {
      const { rewardTime, adData, reason, blockType } = detail
      this.$store.dispatch('adConfig/setRewardTime', { rewardTime, adData, reason });

      // 锁章或者章末激励视频
      const isNextChapter = blockType === HWAD_TYPE.LOCK || blockType === HWAD_TYPE.REWARD;
      this.$emit('reward', {
        type,
        isNextChapter,
        nextCcid: this.chapter.nextCcid
      });
    },

    // 弹窗-激励下载广告
    setDownDialog(option) { // 打开弹窗
      this.$emit('setDownDialog', option)
    },
    closeDownDialog(option) { // 关闭弹窗
      this.$emit('closeDownDialog', option)
    },

    // 章尾推书
    onLeave() {
      this.$emit('onLeave')
    },

    // 数据上报-插页、激励下载广告
    reportHw(detail) { // 华为广告数据上报
      const { eventType, event } = detail
      jsbridge.commitAdEvent(eventType, event)
    },
    reportYw(event) { // 阅文广告数据上报
      logUserBehavior(event)
    }
  },
};
</script>

<style lang="scss" scoped>
.vchapter_index{
  padding: 16px 24px;
  min-height: calc(100vh + 50px);
}
.chapter {
  position: relative;
  width: 100%;
  text-align: justify;

  .ad_box{
    position: relative;
    padding: 82px 0;
  }

  .title {
    display: block;
    line-height: 1.5;
    font-weight: 500;
    white-space: nowrap;
  }
  .indent{
    text-indent: 2em;
  }
  .center::after{
    content: '';
    display: inline-block;
    width: 100%;
    height: 0;
  }
}
</style>