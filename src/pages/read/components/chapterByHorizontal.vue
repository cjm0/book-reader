<template>
  <div
    id="hchapter"
    class="chapter_index"
    @click="setTool"
    @touchstart="touchStart"
    @touchmove.passive="touchMove"
    @touchend="touchEnd"
    @touchcancel="touchEnd"
  >
    <!-- 阅读页内顶部导航 -->
    <BreadCrumb :bookName="title" v-if="isShowBreadCrumb" />
    <div
      ref="chapterWrap"
      :class="['chapter_wrap animation', showAllChapter && 'show']"
      :style="getTransX"
    >
      <div
        v-for="cp of lists"
        :key="cp.ccid"
        :id="'hchapter-' + cp.cid"
        class="chapter"
        :style="{ width: cp.showCp ? 'fit-content': cp.cont.length * clientWidth }"
      >
        <template v-if="cp.showCp">
          <div
            v-for="(item, index) in cp.cont"
            :key="item.id"
            :class="['chapter_item', item.ad && 'ad_box']"
          >
            <template v-if="item.isBookInfo">
              <slot name="bookDetailInfo"></slot>
            </template>
            <NativeAd
              v-else-if="item.ad && item.adType === 'nativeAd'"
              :ref="`nativeAd_${cp.cid}_${index}`"
              :key="`${cp.ccid}${item.id}`"
              :ccid="cp.ccid"
              :cid="cp.cid"
              :pageIndex="index"
              :isInAd="isInAd"
              :clientResize="clientResize"
              :clientWidth="clientWidth"
              :innerWidth="innerWidth"
              :innerHeight="innerAdHeight"
              :style="{padding:`${topbarHeight}px 0 ${footerHeight}px`, height:'100%'}"

              :adConfig="novelInsideAdConfig"
              :preloadAd="item.preloadAd"
              :thresholdCancelAd='item.cancelAd'
              :shouldLoadRewardAd="shouldLoadRewardAd"
              :isShowAdHover="isShowAdHover"
              :isLockAd="item.lock"
              :insertAd="item.insertAd"
              :adLength="cp.adLength"
              turnPagesMode="horizontal"
              @touchstartRender="touchstartRender"
              @touchmoveRender="touchmoveRender"
              @touchendRender="touchendRender"
              @touchcancelRender="touchcancelRender"
              @reportHw="reportHw"
              @reportYw="reportYw"
              @on-close="onAdClose(index)"
              @on-error="onAdError(index)"
              @on-skip="onAdSkip(index)"
              @on-reward="onReward('nativeAd', $event)"
              @on-reward2="onReward('insertAd', $event)"
            />
            <DownAd
              v-else-if="item.ad && item.adType === 'downAd'"
              :ref="`downAd_${cp.cid}_${index}`"
              :key="`${cp.ccid}${item.id}_down`"
              :ccid="cp.ccid"
              :cid="cp.cid"
              :adIndex="index"
              :pageIndex="index"
              :clientWidth="clientWidth"
              :innerWidth="innerWidth"
              :innerHeight="downAdHeight"
              :style="{padding:`${topbarHeight}px 0 ${downFootHeight}px`, height:'100%'}"

              :adConfig="novelInsideAdConfig"
              :preloadAd="item.preloadAd"
              :thresholdCancelAd='item.cancelAd'
              pageMode="horizontal"
              @reportHw="reportHw"
              @reportYw="reportYw"
              @setDownDialog="setDownDialog"
              @closeDownDialog="closeDownDialog"
              @toggleAdType="toggleAdType"
              @on-close="onAdClose(index)"
              @on-error="onAdError(index)"
              @on-skip="onAdSkip(index)"
              @on-reward="onReward('downAd', $event)"
            />
            <div
              v-else-if="item.list && (index === 0 || index === cp.cont.length - 1 || (index <= curPage && index >= curPage - 2))"
              class="page"
              :style="{
                fontSize: textFontSize + 'px',
                lineHeight: fontLineHeight,
                color: theme.color,
                padding:`${topbarHeight}px ${paddingHorizontal}px ${footerHeight + cp.bootmAdH + navigationHeight}px`,
              }"
            >
              <template v-for="(p, idx) in item.list">
                <h2
                  v-if="p.isTitle"
                  :key="`${index}${idx}_t`"
                  class="title"
                  :style="{ fontSize: titleFontSize + 'px' }"
                >{{p.text || ''}}</h2>
                <p
                  v-else
                  :key="`${index}${idx}`"
                  :class="[p.pFirst && 'indent', p.center && 'center']"
                  :style="{
                    paddingTop: (p.pFirst && idx !== 0 ? fontSizeInitial : 0) + 'px'
                  }"
                >{{ p.text }}</p>
              </template>
              <RewardAd
                v-if="item.cpBottomAd"
                :posType="4"
                :ccid="cp.ccid"
                :pageIndex="index"
                :blockType="HWAD_TYPE.REWARD"
                @on-reward="onReward('chapter', $event)"
              />
            </div>
            <!-- <Footer
              ref="footer"
              :cid="chapter.cid"
              :bookInfo="bookInfo"
              :maxChapterIndex="maxChapterIndex"
              :theme="theme"
              :bootmAdHeight="item.ad ? 0 : cp.bootmAdH"
              :controlBottomAd="controlBottomAd"
              :downAdConfig="downAdConfig"
              :downAdBar="downAdBar"
              :style="{
                'opacity': isShowFoot ? 1 : 0,
                'height': footerHeight + 'px'
              }"
              @setDownDialog="setDownDialog"
            /> -->
            <!-- 尾章推书 -->
            <BookRecommend
              v-if="item.isBookLast"
              :key="`${cp.ccid}${item.id}_recommend`"
              pageMode="horizontal"
              :hwbid="hwbid"
              :bookInfo="bookInfo"
              :showBookRecommend="showBookRecommend"
              :moveXIng="moveXIng"
              :style="{ 'padding': `${topbarHeight + 16}px 16px 16px` }"
              @onMoveYIng="onMoveYIng"
              @onLeave="onLeave"
            />
          </div>
        </template>
      </div>
    </div>
    <Footer
      ref="footer"
      :cid="chapter.cid"
      :bookInfo="bookInfo"
      :maxChapterIndex="maxChapterIndex"
      :theme="theme"
      :bootmAdHeight="bootmAdHeight"
      :controlBottomAd="controlBottomAd"
      :downAdConfig="downAdConfig"
      :downAdBar="downAdBar"
      :style="{
        'opacity': isShowFoot ? 1 : 0,
        'height': footerHeight + 'px',
        'display': isLastPage ? 'none' : 'block',
      }"
      @setDownDialog="setDownDialog"
    />
  </div>
</template>

<script>
import BreadCrumb from './breadcrumb.vue';
import NativeAd from '@/components/NativeAd';
import Footer from './footer.vue';

import { mapGetters } from 'vuex';
import { HWAD_TYPE } from '@/constants/index';
import { getClient, toast, getGap } from '@/utils/helpers';

import { addLockAd, addDownAd, addInsertAd } from '@/pages/read/read.js';
import Reader from '@/js/reader-layout.js';
import jsbridge from '@/utils/jsbridge';
import { logUserBehavior } from '@/service';

// 不需要动画的场景
const NONE_DURATION = ['outMaxPage', 'clientResize', 'prevNext', 'switchChapter-2', 'outChapter', 'outChapter2', 'setChapterOffset', 'onAdError', 'onAdCloseChapter', 'switchChapter1onAdClose', 'onAdClosePage', 'switchChapter1onReward', 'onReward'];
export default {
  name: 'ChapterContent',
  components: {
    BreadCrumb,
    NativeAd,
    Footer,
    DownAd: import('@/components/DownAd'),
    RewardAd: import('@/components/RewardAd'),
    BookRecommend: import('@/components/BookRecommend'),
  },
  props: {
    outHcpList: {
      type: Array, // 外部传入的章节数组
      default: () => {
        return []
      },
    },
    chapterNow: { // 当前章节
      type: Object,
      default: null,
    },
    hwbid: {
      type: String,
      default: '',
    },
    ccid: { // 当前章节 id
      type: String,
      default: '',
    },
    bookInfo: {
      type: Object,
      default: null,
    },
    hpIndex: { // 页面布局变化前所在行数
      type: [Number, String],
      default: 0,
    },
    pageNum: {
      type: Number,
      default: 1,
    },
    showTool: {
      type: Boolean,
      default: false,
    },
    firstEnter: {
      type: Boolean,
      default: true,
    },
    originCid: {
      type: Number,
      default: 1,
    },
    maxChapterIndex: {
      type: Number,
      default: 1,
    },
    loadPrevChapter: { // 前章加载状态
      type: String,
      default: '',
    },
    loadNextChapter: { // 后章加载状态
      type: String,
      default: '',
    },
    clientResize: { // 屏幕宽高发生变化
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

    // 广告
    shouldAd: { // 监听会引起页面变化的广告变量
      type: Boolean,
      default: false,
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
    shouldLoadBannerAd: { // 是否有公告广告
      type: Boolean,
      default: false,
    },
    isShowAdHover: { // 是否滑动触发广告点击
      type: Boolean,
      default: false,
    },
  },
  data() {
    const { clientWidth, clientHeight } = getClient()
    return {
      clientWidth,
      clientHeight,
      HWAD_TYPE,

      lists: [ // 循环数据
        {
          cont: [ // 扉页先于内容出
            {
              id: 'bookInfo',
              isBookInfo: true,
            }
          ],
          ccid: -1,
          cid: 1,
          showCp: true, // 删除过长章节
          bootmAdH: 0
        }
      ],
      contentList: [], // 当前章节排版数据
      contentLen: 0, // 当前章节排版数据数组长度
      chapter: { ccid: '' }, // 当前章节原始数据
      curIndex: 0, // 当前章节索引
      curPage: 1, // 当前页码
      swiperState: 0, // 切章状态：1有数据下一章 2无数据下一章 -1有数据上一章  -2无数据上一章
      isFirstChapter: true, // 是否是首章
      isInFeiye: true, // 当前页是否扉页
      // timerClick: 0, // 限制快速点击

      originX: 0, // 切章前位移
      disPoint: 0, // 手势移动的x轴距离
      screenXGap: 0, // 广告 iframe 距离屏幕左边的距离
      // xDown: 0, // 触摸开始的x坐标
      // yDown: 0,
      // sliderDirection: '',
      duration: 250, // 位移动效时间
      translateX: 0, // 位移距离
      showAllChapter: true,
      // switchTimer: null, // 切章延迟上报计时器

      moveXIng: false, // X方向是否移动中
      // moveYIng: false, // Y方向是否移动中
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
      'isShowBanner',
      'freeAdConfig',
      'controlBottomAd',
      'downAdConfig',
      'downAdLock',
      'downAdBar',
      'insertAdConfig',
      'insertAdLock',
      'navigationHeight'
    ]),
    paddingHorizontal() {
      return getGap(this.clientWidth)
    },
    innerWidth() { // 章节容器的宽度
      return this.clientWidth - this.paddingHorizontal * 2;
    },
    innerHeight() { // 章节容器的高度
      return this.clientHeight - this.topbarHeight - this.footerHeight
    },
    innerAdHeight() { // 广告容器的高度
      // 减去头部导航 底部电量 留4px间隙
      return this.clientHeight - this.topbarHeight - this.footerHeight - 4
    },
    downFootHeight() { // 底部预留高度-激励下载广告
      // 底部间隙 + 点击继续高度
      const lockH = this.downAdLock ? 48 : 0
      return this.footerHeight + 22 + lockH
    },
    downAdHeight() { // 广告容器的高度-激励下载广告
      // 减去头部导航 底部电量 留5px间隙
      return this.clientHeight - this.topbarHeight - this.downFootHeight
    },
    lineHeight() { // 行高
      return this.fontSizeInitial * this.fontLineHeight;
    },
    textFontSize() { // 章节文字字号大小
      // 系统设置小字号，横翻文字总高度超出一页
      const px = [18, 24, 36].includes(this.fontSizeInitial) ? 1 : 0
      return this.fontSizeRatio < 1 ? Math.floor(this.fontSize) - px : this.fontSize
    },

    isLastChapter() { // 是否是最后1章
      return this.chapter.nextCcid === '-1';
    },
    isLastPage() { // 是否是最后1章最后1页
      return this.isLastChapter && (this.curPage === this.contentLen)
    },
    showBookRecommend() { // 提前3页出章尾推书
      return this.isLastChapter && this.contentLen > 0 && (this.curPage >= this.contentLen - 3)
    },
    getTransX() { // 渲染广告位移-广告组件
      return {
        transitionDuration: `${this.duration}ms`,
        transform: `translate3d(${this.translateX}px, 0, 0)`,
      }
    },
    isInAd() { // 当前页是否是广告
      if (this.curPage > 0 && this.curPage <= this.contentLen) {
        return this.contentList[this.curPage - 1].ad;
      }
      return false;
    },
    title() {
      if (!this.bookInfo) {
        return '';
      }
      if (this.isFirstChapter) {
        return this.curPage === 2 ? this.bookInfo.title : this.chapter.title;
      }
      return this.curPage === 1 ? this.bookInfo.title : this.chapter.title;
    },
    isShowBreadCrumb() {
      return !this.isInFeiye && this.isShowBanner
    },
    isShowFoot() {
      return !this.isInFeiye && !this.shouldLoadBannerAd
    },
  },
  watch: {
    chapterNow() { // 监听传出数据后处理
      this.getLists(this.chapterNow)
    },

    shouldAd(val) { // 监听会引起页面变化的广告变量
      if (val) { // 出现广告
        let gType = 'shouldAdNew' // 新人进来章节内容出来了，但是还没拿到 sdk 广告配置，过一会才拿到广告配置
        if (this.curPageType && (this.curPageType.includes('switchChapter') || this.curPageType.includes('touchEnd'))) {
          gType = 'shouldAd' // 切章后激励视频免广到期需重新出广告
        }
        this.setChapterResize(gType)
      }
    },
    pageNum(page) { // 初始进度-自动定位到进度页
      if (page > 1) { // 扉页不算进度
        this.setChapterOffset(page)
      }
    },
    fontSize() { // 字号大小变化-重新排版计算
      this.setChapterResize('fontSize')
    },
    fontLineHeight() { // 行距变化-重新排版计算
      this.setChapterResize('lineHeight')
    },
    clientResize() { // 屏幕宽高发生变化-重新排版计算
      const { clientHeight, clientWidth } = getClient()
      this.clientWidth = clientWidth;
      this.clientHeight = clientHeight;
      this.setTranslateX(0, 0, 'clientResize')
      this.setChapterResize('cache')
    },
  },

  created() {
    this.setLists(this.outHcpList) // 外部直接塞入的数据
  },

  methods: {
    isAable() { // 系统 loading 是否已关闭页面可操作
      return window.$config.loadIng > 1 && !this.moveYIng
    },
    onMoveYIng(bool) { // 获取竖向是否滑动-章尾推荐书籍
      this.moveYIng = bool
    },
    // 数据处理
    getFirstChapter(cp) { // 当前是否在首章
      return this.bookInfo && cp.cid === 1
    },
    getLastChapter(cp) { // 当前是否在尾章
      return cp.nextCcid === '-1'
    },
    getLists(cp, type) { // 设置章节数据
      if (!cp) {
        return
      }
      // 清空默认扉页数据
      if (this.lists.length > 0 && this.lists[0].ccid === -1) {
        this.lists = []
      }
      console.log('横翻设置章节数据', cp, this.swiperState, type);

      // 是否已有数据
      let theCP = null
      let theIndex = 0
      this.lists.some((val, i) => {
        if (val.ccid === cp.ccid) {
          theCP = val
          theIndex = i
          return true
        }
      })

      // 恢复被销毁的节点数据
      if (theCP && !theCP.showCp) {
        this.lists.splice(theIndex, 1, { ...theCP, showCp: true })
      }

      // 往前翻页上一章无数据：先空白后出现，防闪
      if (this.swiperState === -2) {
        this.showAllChapter = false
        if (this.curIndex < 0) {
          this.curIndex = 0
        }
      }

      // 设置当前章节
      if (!this.chapter.ccid || this.swiperState) {
        let nowChapter
        if (this.lists.length <= 0 || Math.abs(this.swiperState) === 2) { // 首次或者无数据切章
          nowChapter = cp
        } else { // 有数据切章
          nowChapter = this.lists[this.curIndex].chapter
        }
        this.setChapter(nowChapter)
      }

      // 设置章节数据
      if (!theCP) {
        const textList = this.getTextList(cp)
        const cont = this.getContentList(textList, cp)
        const ads = cont.filter(v => v.ad)
        const ocp = {
          cont,
          ccid: cp.ccid,
          cid: cp.cid,
          adLength: ads.length, // 此章广告个数
          showCp: true,
          bootmAdH: this.isFreeAd(cp.cid) ? 0 : this.bootmAdHeight, // 按免广动态计算底部高度
          chapter: {
            ccid: cp.ccid,
            cid: cp.cid,
            nextCcid: cp.nextCcid,
            title: cp.title,
          }
        }
        if (this.swiperState < 0) {
          this.lists.unshift(ocp)
        } else {
          this.lists.push(ocp)
        }
      }

      // 首次进 && 非外部直接塞的数据-广告处理，需在 setContentList 前面
      if (this.lists.length === 1 && type !== 'out') {
        this.setAdState()
      }

      // 首次或者有数据章节切章-设置当前内容
      if (this.contentList.length <= 0 || this.swiperState) {
        this.setContentList(this.lists[this.curIndex > 0 ? this.curIndex : 0].cont)
      }

      // 翻页位移归位
      if (this.swiperState) {
        const typeStr = `switchChapter${this.swiperState}${type ? type : ''}`
        if (this.swiperState > 0) {
          this.toNext(typeStr)
        } else {
          this.toPrev(typeStr)
        }
        this.swiperState = 0 // 需要放后面执行
      } else {
        // 首章+非第1次-初始数据进页面
        if (this.isFirstChapter && !this.firstEnter) {
          this.setCurPage(2, 'prevNext') // 跳过扉页-目录进度修改
        }
      }
    },
    setChapter(cp) { // 设置当前章节
      this.chapter = cp
      this.isFirstChapter = this.getFirstChapter(cp)
      this.isFeiye()
    },
    isFeiye() { // 判断是否扉页
      const feiye = this.isFirstChapter && this.curPage === 1
      this.isInFeiye = feiye
      this.$emit('setFeiyeH', feiye)
    },
    setContentList(cont) { // 设置当前内容
      this.contentList = cont
      this.contentLen = cont.length
    },
    getLastIndex() { // 获取章节最后纯内容页位置
      let len = this.contentLen - 1
      if (this.contentLen) {
        if (this.contentList[len].ad || this.isLastChapter) { // 最后1页是广告 || 最后1页是章尾推荐
          len -= 1
        }
        // 最后1页是章尾推荐 && 倒数第2页是广告
        if (this.isLastChapter && this.contentList[len] && this.contentList[len].ad) {
          len -= 1
        }
      }
      return len > 0 ? len : 0
    },
    // 处理章节内容
    getH(cid) { // 按免广章节计算高度
      return this.isFreeAd(cid) ? this.innerHeight : (this.innerHeight - this.bootmAdHeight)
    },
    getTextList(cp) { // 返回处理好的文字
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
      const list = Reader(cp.content, {
        width: this.innerWidth, // 容器宽度
        height: this.getH(cp.cid), // 容器高度
        fontSize: this.fontSizeInitial, // 段落字体大小
        lineHeight: this.fontLineHeight, // 段落文字行高
        pGap: this.fontSizeInitial, // 段落间距
        title: cp.title, // 标题
        titleSize: this.fontSizeInitial * 1.3, // 标题字体大小
        titleHeight: 1.5, // 标题文字行高
        titleWeight: 500, // 标题文字字重
        titleGap: 0, // 标题距离段落的间距
      })
      console.timeEnd('paint')
      // console.log(333, 'h_textList', this.fontSizeInitial, list);
      return list
    },
    getContentList(rawTextList, cp) { // 插入分页
      let result = []
      const hasAd = this.shouldLoadPpsbAd && !this.isFreeAd(cp.cid)

      // 插入扉页
      if (this.getFirstChapter(cp)) {
        result.push({ id: 'bookInfo', isBookInfo: true });
      }
      // 插入每页内容
      const rawLen = rawTextList.length
      rawTextList.forEach((item, index) => {
        result.push({ id: `list${index}`, list: item, cpBottomAd: false })
        // 添加插页广告
        if (hasAd) {
          const ad = this.addAd(index, item, rawLen)
          if (ad) {
            result.push(ad)
          }
        }
      });
      // 锁章广告
      if (hasAd) {
        result = this.addLockAdFn(result, cp.cid, cp.ccid, cp.nextCcid)
      }
      // 激励下载广告
      if (hasAd) {
        result = this.addDownAdFn(result, cp.cid)
      }
      // 激励插页广告
      if (hasAd) {
        result = this.addInsertAdFn(result, cp.cid)
      }
      // 章尾插入推书页
      if (this.getLastChapter(cp)) {
        result.push({ id: 'bookLast', isBookLast: true });
      }
      return result;
    },
    addAd(index, item, rawLen) { // 添加插页广告
      // 如果当前行数是N屏内容行数的倍数
      if (this.shouldLoadPpsbAd && (index + 1) % this.novelInsideAdConfig.showAdInterval === 0) {
        // 前插新章节最后1页不放广告
        if (!(this.swiperState === -2 && index === rawLen - 1)) {
          const { pIndex = 0, lineIndex = 0, textIndex = 0 } = item
          return {
            id: `ad${index}${pIndex}${lineIndex}${textIndex}`, // id 保持独立防止不更新
            ad: true,
            adType: 'nativeAd', // nativeAd-插页广告 downAd-激励下载广告
            lock: false, // 是否锁章广告
            insertAd: false, // 是否激励插页广告
            preloadAd: false,
            cancelAd: false,
            list: null,
          }
        }
      }
    },
    addLockAdFn(result, cid, ccid, nextCcid) { // 用锁章广告替换插页广告-锁章广告
      // 锁章广告 && 前插新章节不锁章
      if (this.shouldLoadLockAd && this.swiperState !== -2) {
        const intervel = Number(this.novelInsideAdConfig.lockChapterConfig.lockChapterInterval)
        return addLockAd(result, cid, ccid, nextCcid, this.originCid, intervel)
      }
      return result
    },
    addDownAdFn(result, cid) { // 用激励下载广告替换插页广告-激励下载广告
      return addDownAd(result, this.downAdConfig, cid, this.originCid)
    },
    addInsertAdFn(result, cid) { // 用激励插页替换插页广告-激励插页广告
      return addInsertAd(result, this.insertAdConfig, cid, this.originCid)
    },
    // 传入已准备好的数据：翻页模式改变、屏幕尺寸变化、字号大小变化、激励视频获得免广
    setLists(lists) {
      const cplen = lists.length
      if (cplen > 0) {
        this.showAllChapter = false
        lists.forEach(val => {
          this.getLists(val, 'out')
        })

        // 有三章数据
        const theHpIndex = this.hpIndex
        let toNext = false
        if (cplen === 3) {
          toNext = true
        }
        // 两章数据
        if (cplen === 2) {
          // 最后章节、要切章的数据
          if (lists[1].nextCcid <= 0 || theHpIndex === 'swiperChapter') {
            toNext = true
          }
          // 缺少了第三章
          if (!toNext && lists[1].ccid === this.ccid) {
            toNext = true
          }
        }

        // 数据更新到当前章节
        if (toNext) {
          const theCurIndex = 1
          this.curIndex = theCurIndex
          this.setChapter(this.lists[theCurIndex].chapter)
          this.setContentList(this.lists[theCurIndex].cont)
        }

        // 进度处理
        let page = 0
        if (theHpIndex && String(theHpIndex).includes('progress')) { // 是否重新排版计算进来
          // 有过计算走相等判断：行距变化、新人进章节内容出来，过一会才拿到广告配置、竖翻切横翻
          const theCache = ['lineHeight', 'shouldAdNew', 'pagemode'].some(val => theHpIndex.includes(val))
          const isCache = theCache ? 'cache' : ''
          page = Math.min(this.contentLen - 1, this.getProgressIndex(isCache))
          page = page > 0 ? page : 0
        }
        console.log(333, 'setLists', theHpIndex, page);

        // 自动切换到当前章节
        if (toNext) {
          this.toNext('outChapter', page)
        } else {
          if (page > 0) { // 有进度偏移需要定位过去
            page = page + 1
          } else { // 没有进度偏移
            // 首章非扉页
            if (this.isFirstChapter && theHpIndex !== -1) {
              page = 2
            }
          }
          if (page > 1) {
            this.setCurPage(page, 'outChapter2')
          } else {
            this.setAdState() // 广告处理
          }
        }
        this.showAllChapter = true
      }
    },

    // 手势触摸
    touchStart(ev) { // 手势触摸开始
      if (!this.isAable()) {
        return
      }
      const touch = ev.clientX ? ev : ev.touches[0]
      this.xDown = touch.clientX
      this.yDown = touch.clientY
      this.disPoint = 0
      this.$emit('touchRead')
    },
    touchMove(ev) { // 手势移动
      if (!this.isAable()) {
        return
      }
      if (!this.xDown) {
        return;
      }

      const touch = (ev.clientX || ev.clientX === 0) ? ev : ev.touches[0]
      const xDiff = this.xDown - touch.clientX;
      const yDiff = this.yDown - touch.clientY;
      const absX = Math.abs(xDiff)
      const absY = Math.abs(yDiff)
      if (!this.sliderDirection) {
        this.sliderDirection = this.getDirectionAll(absX, absY, 1)
      }
      // 判断手势是横滑，则执行翻页操作
      if (this.sliderDirection === 'horizontal') {
        // 横翻最后1页 && 竖向滑动中-横向不可滑动
        if (this.isLastPage && this.moveYIng) {
          return
        }

        if (this.showTool) {
          this.$emit('setTool', false);
        }
        this.moveXIng = true // 横向滑动中
        this.setTranslateX(xDiff, yDiff, 'move')
      }
    },
    touchEnd() { // 手势停止移动
      if (!this.isAable()) {
        return
      }
      if (Math.abs(this.disPoint) >= 10) { // 10px 翻页
        this.swiperPage(this.disPoint > 0 ? 1 : -1, 'touchEnd')
        this.touchOver('swiper')
      } else {
        this.touchOver()
      }
    },
    touchOver(type) { // 清除移动数据
      if (!this.isAable()) {
        return
      }
      this.setTranslateX(0, 0, type)
      this.xDown = 0
      this.yDown = 0
      this.sliderDirection = ''
      this.moveXIng = false // 横向滑动结束
    },
    getDirectionAll(x, y, minDis) { // 判断手势滑动方向是横向还是纵向
      if (this.chapter.cid <= 1 && this.curPage === 1) { // 扉页特殊处理：x > y 才算滑动
        if (x > y && x > minDis) {
          return 'horizontal';
        }
      } else {
        if (x > minDis) {
          return 'horizontal';
        }
      }
      if (y > x && y > minDis) {
        return 'vertical';
      }
      return '';
    },
    // 广告自渲染传出的触摸事件
    touchstartRender(ev) {
      const screenX = ev.screenX
      let clientX = ev.clientX
      this.screenXGap = 0

      // 取 screenX，iframe 的 clientX 在页面移动后会发生变化导致不准抖动
      if (screenX >= 0) {
        this.getScreenXGap(screenX, clientX)
        clientX = screenX - this.screenXGap
      }
      this.touchStart({ ...ev, clientX })
    },
    touchmoveRender(ev) {
      let screenX = ev.screenX
      let clientX = ev.clientX
      if (screenX < 0) {
        screenX = 0
      }

      // 取 screenX，iframe 的 clientX 在页面移动后会发生变化导致不准抖动
      if (screenX >= 0) {
        if (!this.screenXGap) {
          this.getScreenXGap(screenX, clientX)
        }
        clientX = screenX - this.screenXGap
      }
      this.touchMove({ ...ev, clientX })
    },
    getScreenXGap(screenX, clientX) {
      let screenXGap = screenX - clientX
      screenXGap = screenXGap > 0 ? screenXGap : 0
      this.screenXGap = screenXGap
    },
    touchendRender() {
      this.touchEnd()
    },
    touchcancelRender() {
      this.touchOver()
    },
    getPrevX() { // 偏移距离
      return -this.clientWidth * (this.curPage - 1) + this.originX
    },
    setTranslateX(x, y, type) { // 偏移距离
      // 无数据回翻会先执行 touchOver 导致 x 先变成 0
      if (x === 0 && type === 'swiper' && this.swiperState === -2) {
        return
      }

      // 锁章状态禁止往后移动-锁章
      let disX = x
      if (disX > 0 && this.lockPage()) {
        disX = 0
      }
      this.disPoint = disX

      const isStart = this.curPage === 1 && this.isFirstChapter && disX < 0;
      const translateX = -this.clientWidth * (this.curPage - 1) - disX + this.originX;
      this.setTransform(isStart ? 0 : translateX, y, type)
    },
    setTransform(x, y, type) {
      // 取整：小数点位移会闪
      x = Math.floor(x)

      // 拦截相同值
      if (x === this.transX) {
        return
      }
      this.transX = x

      if (this.frame) {
        window.cancelAnimationFrame(this.frame)
      }
      if (type === 'move') { // 移动过程每帧执行一次
        this.frame = window.requestAnimationFrame(() => {
          this.duration = 0
          this.translateX = x
        })
      } else {
        let duration = NONE_DURATION.includes(type) ? 0 : 250
        duration = type === 'setTool' ? 200 : duration // 点击控制在 200ms
        this.duration = duration
        this.translateX = x
        // console.log(333, 'translateX', x, duration, type)
      }
    },
    setTool(e) { // 点击屏幕触发事件
      if (!this.isAable()) {
        return
      }
      if (!this.timerClick) {
        // 防止过快点击
        this.timerClick = 1
        setTimeout(() => {
          this.timerClick = 0
        }, 250)

        // 如果菜单栏展示，点击任何区域都收起菜单栏
        // 锁章状态禁止菜单栏弹出-锁章
        if (this.showTool && !this.lockPage('tool')) {
          this.$emit('setTool', false);
          return;
        }

        const { clientX } = e;
        // 最后1页右侧点击出菜单栏
        if (clientX > (this.clientWidth / 8) * 5 && !this.isLastPage) {
          this.swiperPage(1, 'setTool')
        } else if (clientX < (this.clientWidth / 8) * 3) {
          this.swiperPage(-1, 'setTool');
        } else {
          // 锁章状态禁止菜单栏弹出-锁章
          if (!this.lockPage('tool')) {
            this.$emit('setTool')
          }
        }
      }
    },

    // 切换页码
    swiperPage(page, type) { // 判断是否展示广告还是翻页
      const nextPage = this.curPage + page;
      // console.log('swiperPage', nextPage, this.contentLen, type);
      if (nextPage === 0 && this.isFirstChapter) { // 首章第一页左滑无效
        return
      }

      // 扉页加载首章
      if (this.lists.length > 0 && this.lists[0].ccid === -1) {
        return this.$emit('setHcpList', {})
      }

      // 锁章状态禁止往后翻页-锁章
      if (page > 0 && this.lockPage()) {
        return
      }

      // 手动操作固底有动效
      if (['setTool', 'touchEnd', 'onAdSkip', 'onAdSkip'].includes(type)) {
        this.bootomAnima = true
      }

      if (nextPage > this.contentLen) { // 如果下一页大于最大页且不是末章，则跳转下一章
        if (this.isLastChapter) {
          toast('已经是最后一页了')
        } else {
          this.swiperChapter(page, type)
        }
      } else if (nextPage === 0) { // 如果上一页是第一页且不是首章，则跳转上一章
        if (!this.isFirstChapter) {
          this.swiperChapter(page, type);
        }
      } else {
        this.setCurPage(nextPage, type)
        clearTimeout(this.switchTimer) // 清除切章的计时器
        this.setProgressLine('swiperPage') // 记录所在行数
        this.$emit('changePage', this.getContentPage(nextPage), this.isInAd) // 上报翻页进度
      }
    },
    setCurPage(page, type) {
      console.log('curPage', page, type)

      // 控制页数不超出内容长度
      if (page > this.contentLen) {
        page = this.contentLen
        type = 'outMaxPage'
      }
      this.curPageType = type // 翻页类型
      this.curPage = page
      this.isFeiye()
      this.setTranslateX(0, 0, type)
      this.$emit('setHPageCur', { type, page, lastPage: this.isLastPage })

      // 当前页是空白广告页则需要被删除
      this.deleteEmptyAd(page - 1)

      // 翻页切章的时候-上报翻页进度
      if ((type.includes('switchChapter') || type === 'prevNext') && page > 0) {
        clearTimeout(this.switchTimer)
        this.switchTimer = setTimeout(() => { // 延迟执行等待首页 chapter 更新
          this.setProgressLine()
          this.$emit('changePage', this.getContentPage(page), this.isInAd)
        }, 50)
      }

      // 重新排版计算的、初始进页面自动定位到进度页，这2种情况需要获取下所在行数
      if (type.includes('outChapter') || type.includes('setChapterOffset')) {
        clearTimeout(this.timerProgress)
        this.timerProgress = setTimeout(() => {
          this.setProgressLine()
          if (this.hpIndex === 'progress_pagemode') { // 竖翻切横翻-上报翻页进度
            this.$emit('changePage', this.getContentPage(page), this.isInAd)
          }
        }, 50)
      }

      if (type !== 'onAdCloseChapter' && type !== 'onReward') {
        // 横翻下切换页面判断是否显示固底广告-固底
        if (!this.shouldLoadBannerAd) {
          const objControl = {
            show: !this.isInAd && !this.isLastPage, // 非插页广告 && 最后1章最后1页-无固底广告
            anima: this.bootomAnima // 手动操作固底才有动效-固底动效控制
          }
          // console.log(333, 'touchEnd', objControl);
          this.bootomAnima = false
          this.$store.commit('adConfig/setBottomAdOpen', objControl)
        }
        // 管理栏-激励下载广告
        if (this.downAdConfig) {
          const typeBar = this.isInAd ? '' : 'all'
          this.$store.commit('adConfig/setDownAdBar', { type: typeBar })
        }
        // 广告处理
        this.setAdState()
      }
    },
    deleteEmptyAd(page) { // 删除空白广告
      const thePage = this.contentList[page]
      if (thePage && thePage.ad) {
        const adRef = this.$refs[`${thePage.adType}_${this.chapter.cid}_${page}`];
        if (adRef && adRef.length > 0 && adRef[0].originData) {
          if (!adRef[0].adData || !adRef[0].nativeAd) {
            this.onAdError(page, '激励下载广告')
          }
        }
      }
    },
    getContentPage(curPage) { // 内容第几页
      let page = curPage;
      for (let i = 0; i < this.curPage; i++) {
        if (this.contentList[i] && this.contentList[i].ad) {
          page = page - 1;
        }
      }
      return page > 0 ? page : 1
    },
    swiperChapter(direction, type) { // 切换章节
      let theCurIndex = this.curIndex
      if (direction > 0) { // 下一章
        theCurIndex += 1
      } else {
        theCurIndex -= 1
      }

      const theChapter = this.lists[theCurIndex] || null
      let hasNext = false
      let theSwiperState = 0
      if (theChapter) { // 有数据直接切换上下章数据，同时加载更多章数据
        this.curIndex = theCurIndex
        theSwiperState = direction > 0 ? 1 : -1
        this.swiperState = theSwiperState

        // 先切换到位
        this.getLists(theChapter, type)

        // 下下章已存在或者上上章已存在-不做预请求
        if (this.lists[theCurIndex + theSwiperState]) {
          hasNext = true
        }
      } else { // 无数据加载上下章，注意出错误提示
        theSwiperState = direction > 0 ? 2 : -2
        this.swiperState = theSwiperState

        if (Math.abs(theSwiperState) === 2) {
          let loadState = theSwiperState === 2 ? this.loadNextChapter : this.loadPrevChapter
          if (theSwiperState === 2) {
            loadState = loadState ? loadState : 'err' // 下一章未加载过按加载失败算
          }
          if (loadState === 'req') { // 加载中
            this.swiperState = 0
            this.touchOver()
            toast('正在拼命加载章节')
            return
          }
          if (loadState === 'err') { // 重新加载失败数据-不切章,先恢复位移
            this.touchOver()
            toast('正在拼命加载章节')
          }
          if (loadState === 'suc') { // 请求成功切章
            this.curIndex = theCurIndex
          }
          hasNext = loadState
        }
      }

      // 通知外部加载新的章节进来
      this.$emit('setHchapter', theChapter && theChapter.ccid, theSwiperState, hasNext)

      // 删除首尾多的数据
      if (hasNext !== 'err') {
        this.deletLists(theSwiperState)
      }
    },
    toNext(type, page = 0) { // 切下一章
      // 下一章若是首章则回到第二页，反之回到第一页
      if (type === 'outChapter') {
        this.originX = -this.clientWidth * (this.lists[0].cont.length)
      } else {
        const prevX = this.getPrevX()
        this.originX = prevX  + (-this.clientWidth)
      }

      this.setCurPage(page + 1, type)
    },
    toPrev(type) { // 切上一章
      // 回到上1章，页码为上1章的最后1页
      const curPage = this.contentLen
      if (this.swiperState === -1) { // 有数据切章
        const prevX = this.getPrevX()
        this.originX = prevX + this.clientWidth * curPage
      } else { // 无数据切章
        this.showAllChapter = true
      }

      this.setCurPage(curPage, type)
    },
    deletLists(swiperState) { // 删除首尾多的数据，控制内存
      if (swiperState > 0) { // 切下一章清空前面的章节节点，保留数据
        this.lists = this.lists.map((val, index) => {
          if (val.showCp && index <= this.curIndex - 3) {
            return { ...val, showCp: false }
          }
          return val
        })
      } else { // 切上一章删除后面的章节数据
        const theCurIndex = this.curIndex > 0 ? this.curIndex : 0
        this.lists.splice(theCurIndex + 3)
      }
    },

    // 重新排版计算
    setChapterResize(type) {
      console.log(333, 'setChapterResize', type);

      // 页面内容未出
      if (this.lists && this.lists[0] && this.lists[0].ccid === -1) {
        return
      }

      // 记录变化前所在行数
      let thePIndex = 0;
      if (!this.isInFeiye) {
        if (this.setProgressLine(type)) {
          thePIndex = `progress_${type}`
        }
      }

      // 第一章扉页
      if (this.isFirstChapter && this.curPage === 1) {
        thePIndex = -1
      }

      // 切章后的重置
      if (type === 'swiperChapter') {
        thePIndex = 'swiperChapter'
      }

      // 触发外部重新传数据进来
      this.$emit('setHcpList', {
        type,
        hccid: this.chapter.ccid,
        pIndex: thePIndex,
      })
    },
    setProgressLine(type) { // 记录所在行数
      clearTimeout(this.timerProgress)
      let theCur = this.isInAd ? this.curPage - 2 : this.curPage - 1
      if (this.isLastPage) { // 最后1章最后1页
        theCur = this.getLastIndex()
      }
      const list = this.contentList[theCur].list
      if (list && list[0]) {
        const { cache, pIndex, textIndex } = window.$config.progressLine
        // 不需要变更记录：resize 屏幕宽高发生变化、新人进章节内容出来，过一会才拿到广告配置
        const hasCache = (cache && type === 'cache') || type === 'shouldAdNew'
        window.$config.progressLine = { // 记录行位置
          ...window.$config.progressLine,
          ccid: this.chapter.ccid,
          pCid: this.chapter.cid,
          pIndex: hasCache ? pIndex : Number(list[0].pIndex),
          textIndex: hasCache ? textIndex : Number(list[0].textIndex),
        }
        return true
      }
    },
    // 自动定位到进度页
    setChapterOffset(page) {
      const { ccid, textIndex } = window.$config.progressLine
      const hasProgressLine = this.chapter.ccid === ccid && textIndex >= 0
      let thePage = 1
      if (hasProgressLine) {
        thePage = this.getProgressIndex('cache')
        if (thePage >= 0) { // 找到了对应页
          thePage += 1
          thePage = Math.min(this.contentLen, thePage)
        } else {
          thePage = this.getProgressOffset(page)
        }
      } else {
        thePage = this.getProgressOffset(page)
      }
      console.log('处理带进度偏移量', thePage)
      // 定位需要回退一页-最后1章最后1页
      if (this.isLastChapter && thePage === this.contentLen) {
        thePage -= 1
      }
      this.setCurPage(thePage, 'setChapterOffset')
    },
    getProgressOffset(page) { // 获取非字符进度位置
      let thePage = page // 获取带广告的真实页数
      let index = 0 // 纯内容页数
      this.contentList.some(val => {
        if (val.ad) {
          thePage += 1
        } else {
          index += 1
        }
        if (index > page) {
          return true
        }
      })
      return Math.min(this.contentLen, thePage)
    },
    getProgressIndex(type) { // 获取字符进度位置
      // 获取旧位置
      const { pIndex, textIndex, cache } = window.$config.progressLine
      const isCache = type === 'cache' || cache // 已经拿到进度的、缓存需要全等

      // 查找新位置
      const findPageIndex = this.contentList.findIndex(item => {
        if (item.list) {
          return item.list.some((p, i) => {
            const nextP = item.list[i + 1]
            if (p.pIndex === pIndex) { // 同一段
              if (p.textIndex === textIndex) {
                return true
              }
              // 此行小 && 下行不存在或者下行大
              if (!isCache && p.textIndex < textIndex && (!nextP || nextP.pIndex > pIndex || nextP.textIndex > textIndex)) {
                return true
              }
            }
          })
        }
        return false
      })
      return findPageIndex
    },

    // 广告
    isFreeAd(cid) { // 按照各自章节计算免广状态-免广章节
      return this.freeAdConfig > 0 && cid <= this.freeAdConfig
    },
    setAdState() {
      this.lists = this.lists.map(cp => {
        if (cp.ccid === this.chapter.ccid) {
          const cont = cp.cont.map((val, index) => {
            // 判断广告出现或者删除
            if (val.ad) {
              return {
                ...val,
                preloadAd: this.shouldPreloadAd(index),
                cancelAd: this.shouldCancelAd(index),
              }
            }
            // 判断章末广告是否出现
            if (index >= this.curPage - 1 && index <= this.curPage) {
              return {
                ...val,
                cpBottomAd: this.shouldCpBottomAd(val, index, cp),
              }
            }
            return val
          })
          return { ...cp, cont }
        }
        return cp
      })
    },
    toggleAdType(ccid, pageIndex) { // 切换广告类型：激励下载失败用插页替换回来
      this.lists = this.lists.map(cp => {
        if (cp.ccid === ccid) {
          const cont = cp.cont.map((val, index) => {
            if (val.adType === 'downAd' && index === pageIndex) {
              return { ...val, adType: 'nativeAd' }
            }
            return val
          })
          return { ...cp, cont }
        }
        return cp
      })
    },
    shouldPreloadAd(index) { // 判断何时预加载广告
      const interval = Math.abs(this.curPage - index - 1);
      return interval <= this.adStartPage && interval > 1;
    },
    shouldCancelAd(index) { // 判断何时应该移除广告
      return Math.abs(this.curPage - index - 1) <= 1;
    },
    shouldCpBottomAd(item, index, cp) { // 是否插入章末广告
      // 免广章节
      if (this.isFreeAd(cp.cid)) {
        return
      }
      // 1 页内容不出
      const lastIndex = this.getLastIndex()
      if (!this.shouldLoadChapterBottomAd || lastIndex < 1) {
        return false;
      }
      // 最后1页有标题的不出
      if (this.contentList[lastIndex]?.list?.[0].isTitle) {
        return false
      }

      const theLastPage = this.contentList.slice(index + 1).filter(({ list }) => list).length === 0;
      if (theLastPage) {
        let contentHeight = 0
        if (item.list) {
          contentHeight = item.list.reduce((prev, cur, idx) => {
            const marginTop = (cur.pFirst && idx !== 0) ? this.fontSizeInitial : 0
            return prev + this.lineHeight + marginTop
          }, 0)
        }
        // 64=>按钮height，25=>按钮距离内容上边距，16=>按钮下边距
        const h = this.getH(cp.cid)
        return (h - contentHeight) > (64 + 25 + 16);
      }
      return false;
    },
    isLock() { // 是否锁定状态
      const { lockIng, lockDownIng, lockInsertIng } = this.controlLockAd
      return lockIng || lockDownIng || lockInsertIng
    },
    isLockPage() { // 是否是锁定章节的锁定页
      const isPage = this.curPage > 0 && this.curPage <= this.contentLen
      if (isPage) {
        // 锁章广告
        if (this.chapter.ccid === window.$config.lockIngCcid) {
          if (this.contentList[this.curPage - 1].lock) {
            return true
          }
        }
        // 激励下载广告
        if (this.chapter.ccid === window.$config.downLockCcid) {
          if (this.contentList[this.curPage - 1].adType === 'downAd' && this.downAdLock) { // 打开了锁定开关
            return true
          }
        }
        // 激励插页广告
        if (this.chapter.ccid === window.$config.insertLockCcid) {
          if (this.contentList[this.curPage - 1].insertAd && this.insertAdLock) { // 打开了锁定开关
            return true
          }
        }
      }
      return false
    },
    lockPage(type = 'page') { // 锁住当前页
      if (type === 'page') {
        return this.isLock() && this.isLockPage()
      }
      if (type === 'tool') {
        const { lockIng, lockDownIng, lockInsertIng } = this.controlLockAd
        if (lockIng) { // 锁章广告全部锁菜单栏
          return this.isLock()
        }
        if (lockDownIng || lockInsertIng) { // 激励下载广告、激励插页广告只当前页锁菜单栏
          return this.isLock() && this.isLockPage()
        }
      }
      return false
    },
    onAdClose(index) { // 关闭广告跳到下一页
      if (this.curPage >= this.contentLen) { // 章末广告先删除 => 修正curPage => 切章
        this.deleteAd(index)
        this.setCurPage(this.curPage - 1, 'onAdCloseChapter')
        this.swiperPage(1, 'onAdClose')
      } else {
        this.deleteAd(index)
        this.setCurPage(this.curPage, 'onAdClosePage')
      }
    },
    onAdError(index, adName = '广告') { // 删除广告跳到下一页
      const item = this.contentList[index]
      if (!item || !item.ad) {
        return;
      }

      console.log(`${adName}移除`, index);
      if (this.curPage > index) { // 当前以及前面页被删除
        this.deleteAd(index)

        let page = this.curPage - 1
        if (this.curPage === index + 1) { // 当前页
          page = this.curPage
        }
        if (this.curPage >= this.contentLen) { // 章节尾页
          page = this.curPage - 1
        }
        this.setCurPage(page, 'onAdError')
      } else {
        this.deleteAd(index)
      }
    },
    onAdSkip() { // 自动翻页
      this.swiperPage(1, 'onAdSkip')
    },
    deleteAd(index) { // 删除广告数据
      this.lists = this.lists.map((cp, i) => {
        if (i === this.curIndex) {
          const cont = JSON.parse(JSON.stringify(cp.cont))
          cont.splice(index, 1)
          const ads = cont.filter(v => v.ad)
          this.setContentList(cont) // contentLen 发生变化
          return {
            ...cp,
            cont,
            adLength: ads.length
          }
        }
        return cp
      })
    },
    // 激励视频开启免广告权益
    onReward(type, detail) {
      const { rewardTime, adData, reason } = detail
      this.$store.dispatch('adConfig/setRewardTime', { rewardTime, adData, reason })

      // 先执行完切换，章首激励视频广告不需要跳页
      let theType = ''
      if (!['rewardDialog', 'rewardBottom'].includes(type)) {
        const lastIndex = this.getLastIndex() // 最后1章最后1页不做处理
        if (!(this.isLastChapter && this.curPage >= lastIndex + 1)) {
          if (this.curPage >= this.contentLen) {
            this.swiperChapter(1, 'onReward')
            theType = 'swiperChapter'
          } else {
            this.setCurPage(this.curPage + 1, 'onReward')
          }
        }
      }

      // 执行完切换后重新计算
      this.setChapterResize(theType)

      this.$emit('reward', { type })
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
@import './horizontal.scss';
</style>
