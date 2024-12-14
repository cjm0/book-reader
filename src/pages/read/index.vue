<template>
  <div :style="{ backgroundColor: theme.paper }">
    <!-- 竖翻章节内容 -->
    <div
      v-if="pageMode.isVertical && showVchapter"
      class="chapter_vertical"
      :style="{paddingBottom:`${bootmAdHeight2 + footerHeight}px`}"
      @touchstart="vTouchStart"
      @touchmove="vTouchMove"
      @touchend="vTouchEnd"
    >
      <!-- 阅读页内顶部导航 -->
      <BreadCrumb :bookName="vchapterName" v-show="!isVFeiye" />
      <BookInfo
        v-if="isFirstChapter"
        ref="bookDetailInfo"
        key="book_info_v"
        :cbid="cbid"
        :book="bookInfo"
        :pageChangeMode="pageChangeMode"
        :clientHeight="clientHeight"
        @setTool="setTool"
      />
      <chapter-by-vertical
        v-for="(cp, index) of chapterList"
        :key="cp.ccid"
        :ref="'vChapter-' + cp.ccid"
        :hwbid="hwbid"
        :bookInfo="bookInfo"
        :chapterIndex="index"
        :chapter="cp"
        :curChapter="chapter"
        :list="chapterList"
        :scrollY="scrollY"
        :isFirstChapter="isFirstChapter"
        :originCid="originCid"
        :clientWidth="clientWidth"
        :clientHeight="clientHeight"
        :bootmAdHeight="bootmAdHeight"
        :footerHeight="footerHeight"

        :shouldLoadPpsbAd="shouldLoadPpsbAd"
        :shouldLoadRewardAd="shouldLoadRewardAd"
        :shouldLoadChapterBottomAd="shouldLoadChapterBottomAd"
        :shouldLoadLockAd="shouldLoadLockAd"
        :canLoadAd="canLoadAd"
        :isShowAdHover="functionSwitch.isShowAdHover"
        @setCurrentChapter="sliderChapterChange"
        @setTool="setTool"
        @reward="onReward"
        @setDownDialog="setDownDialog"
        @closeDownDialog="closeDownDialog"
        @onLeave="onLeaveBook"
      >
      </chapter-by-vertical>
    </div>

    <!-- 横翻章节内容 -->
    <chapter-by-horizontal
      v-if="pageMode.isHorizontal && showHchapter"
      ref="hChapter"
      :outHcpList="outHcpList"
      :chapterNow="chapterNow"
      :ccid="ccid"
      :hwbid="hwbid"
      :bookInfo="bookInfo"
      :hpIndex="hpIndex"
      :pageNum='pageNum'
      :showTool="isShowTool"
      :firstEnter="firstEnter"
      :originCid="originCid"
      :maxChapterIndex="maxChapterIndex"
      :loadPrevChapter="loadPrevChapter"
      :loadNextChapter="loadNextChapter"
      :clientResize="clientResize"
      :bootmAdHeight="bootmAdHeight"
      :footerHeight="footerHeight"

      :shouldAd="shouldAd"
      :shouldLoadPpsbAd="shouldLoadPpsbAd"
      :shouldLoadRewardAd="shouldLoadRewardAd"
      :shouldLoadChapterBottomAd="shouldLoadChapterBottomAd"
      :shouldLoadLockAd="shouldLoadLockAd"
      :shouldLoadBannerAd="shouldLoadBannerAd"
      :isShowAdHover="functionSwitch.isShowAdHover"
      @setLoading="setLoading"
      @changePage="changePage"
      @logChangePage="logChangePage"
      @setTool="setTool"
      @setHchapter="hchapterChange"
      @setHcpList="setHcpList"
      @touchRead="touchRead"
      @setFeiyeH="setFeiyeH"
      @reward="onReward"
      @setDownDialog="setDownDialog"
      @closeDownDialog="closeDownDialog"
      @setHPageCur="setHPageCur"
      @onLeave="onLeaveBook"
    >
      <template v-slot:bookDetailInfo>
        <!-- 作品详情 -->
        <BookInfo
          key="book_info_h"
          :cbid="cbid"
          :book="bookInfo"
          :pageChangeMode="pageChangeMode"
          :clientHeight="clientHeight"
        />
      </template>
    </chapter-by-horizontal>

    <!-- 书籍详情 10001 -->
    <BookDetail
      v-if="renderBookDetail"
      :show="showBookDetail"
      :book="bookInfo"
      @onClose="closeBookDetail"
    />
    <!-- 目录 10000 -->
    <Catalog
      v-if="renderCatalog"
      :showPop="isShowCatalog"
      :hidePop="isHideCatalog"
      :book="bookInfo"
      :cbid="cbid"
      :chapter="chapter"
      :chapterIndex="chapterIndex"
      @onClose="closeCatalog(true)"
      @toOne="toOne"
      @openBookDetail="openBookDetail"
    />
    <!-- Loading 1200 -->
    <Loading :show="loading"/>
    <!-- 激励下载广告交互弹窗 1100-->
    <DownAdDialog
      v-if="renderDialog"
      :show="showDialog"
      :type="dialogType"
      :adData="downAdData"
      :adReportType="adReportType"
      :ccid="ccid"
      :pageIndex="curPage"
      :clientWidth="clientWidth"
      @closeDownDialog="closeDownDialog"
      @getReward="getReward"
      @getCurPage="getCurPage"
    ></DownAdDialog>
    <!-- 加书架二次确认 1100-->
    <AddBookShelf
      v-if="renderAddShelf"
      :show="showAddShelf"
      :cover="bookCover"
      :theme="theme"
      @onClose="setBookShelf(false)"
      @onCancel="cancelAddBookShelf"
      @onConfirm="confirmAddBookShelf"
    />
    <!-- 退出推书弹窗-浅度 1100-->
    <BookDialog
      v-if="functionSwitch.isShowBookDialog"
      :show="showBookDialog"
      :hwbid="hwbid"
      :ccid="ccid"
      @onClose="showBookDialog = false"
      @onCancel="onCancelBookDialog"
      @onLeave="onLeaveBook"
    />
    <!-- 退出推书弹窗-深度 1100-->
    <DeepBookDialog
      v-if="functionSwitch.isShowBookDialog"
      :show="showDeepBookDialog"
      :hwbid="hwbid"
      :ccid="ccid"
      :shouldGetDeepBook="shouldGetDeepBook"
      @onClose="showDeepBookDialog = false"
      @onCancel="onCancelBookDialog"
      @onLeave="onLeaveBook"
    />
    <!-- 展示新手引导图 310-->
    <Onboarding
      v-if="renderOnboarding"
      :show="showOnboarding"
      :pageChangeMode="pageChangeMode"
      @onClose="setOnboarding(false)"
    />
    <!-- 公告广告 300-->
    <BannerAd
      v-if="shouldLoadBannerAd || shouldLoadHotAd"
      :show="showBannerAd"
      :isHotAd="shouldLoadHotAd"
      :isFeiyebanner="isFeiyebanner"
      :adConfig="novelInsideAdConfig"
      :ccid="ccid"
      :pageIndex="curPage"
      :pageMode="pageMode"
      :clientResize="clientResize"
      :clientWidth="clientWidth"
      :clientHeight="clientHeight"
      :isShowAdHover="functionSwitch.isShowAdHover"
      :isTouchRead="isTouchRead"
      :isFreeAd="isFreeAd"
      @closeBanner="closeBanner"
      @closeHotAd="closeHotAd"
      @bannerAdError="bannerAdError"
      @getCurPage="getCurPage"
    />
    <!-- 章首弹窗激励视频广告 290-->
    <RewardDialogAd
      v-if="renderRewardAdDialog"
      :show="rewardAdDialog"
      key="rewardDialogAd"
      :ccid="ccid"
      :pageIndex="curPage"
      :clientWidth="clientWidth"
      @closeRewardDialog="closeRewardDialog"
      @handleReward="handleReward('rewardDialog', $event)"
      @getCurPage="getCurPage"
    />
    <!-- 顶部导航栏 200-->
    <Topbar
      :show="isShowTool"
      :needAnim="readToolNeedAnim"
      :isInBookShelf="isInBookShelf"
      @addBookShelf="goAddBookShelf"
      @goBack="goBackCallback(1)"
    />
    <!-- 底部工具栏 200-->
    <ReadTool
      ref="readTool"
      :show="isShowTool"
      :needAnim="readToolNeedAnim"
      :cbid="cbid"
      :hwbid="hwbid"
      :chapter="chapter"
      :book="bookInfo"
      :inBookFeiye="inBookFeiye"
      :clientWidth="clientWidth"
      :clientResize="clientResize"
      @toPrev="toPrev"
      @toNext="toNext"
      @toOne="toOne"
      @showCatalog="showCatalog"
      @setPageMode="setPageMode"
    />
    <!-- 底部加书架条 4-->
    <AddBookBar
      v-if="showAddBookBarNum > 0"
      :showAddBookBarState="showAddBookBarState"
      :bookCover="bookCover"
      @hideAddBookBar="hideAddBookBar"
      @cancelAddBook="cancelAddBook"
    />
    <!-- 章首固底激励视频广告 3-->
    <RewardBottomAd
      v-if="rewardAdBottom"
      key="rewardBottomAd"
      :ccid="ccid"
      :pageIndex="curPage"
      @closeRewardBottom="setRewardBottom(false)"
      @handleReward="handleReward('rewardBottom', $event)"
      @getCurPage="getCurPage"
    />
    <!-- 时间进度-竖翻 2-->
    <Footer
      v-if="pageMode.isVertical"
      :cid="chapter && chapter.cid"
      :bookInfo="bookInfo"
      :maxChapterIndex="maxChapterIndex"
      :theme="theme"
      :bootmAdHeight="bootmAdHeight"
      :controlBottomAd="controlBottomAd"
      :downAdConfig="downAdConfig"
      :downAdBar="downAdBar"
      :style="{
        'position': 'fixed',
        'opacity': isVFeiye ? 0 : 1,
        'height': footerHeight + 'px',
        'backgroundColor': theme.paper
      }"
      @setDownDialog="setDownDialog"
    />
    <!-- 固底广告 2-->
    <FixBottomAd
      v-if="shouldLoadBottomAd && showNewBottomAd1"
      key="1"
      :adType="1"
      :ccid="ccid"
      :pageIndex="curPage"
      :pageMode="pageMode"
      :adConfig="novelBottomAdConfig"
      :reportShowVertical="reportShowBootmAd"
      :reportShowHorizontal="reportShowBootmAdH"
      :shouldLoadBannerAd="shouldLoadBannerAd"
      :newBottomAdType="newBottomAdType"
      :isFreeAd="ccid && isFreeAd"
      :isReqBottomAd="isReqBottomAd"
      :rewardAdBottom="rewardAdBottom"
      :clientResize="clientResize"
      :clientWidth="clientWidth"
      @getCurPage="getCurPage"
      @changeBootomAd="changeBootomAd"
      @changeBootomAdType="changeBootomAdType"
    />
    <FixBottomAd
      v-if="shouldLoadBottomAd && showNewBottomAd2"
      key="2"
      :adType="2"
      :ccid="ccid"
      :pageIndex="curPage"
      :pageMode="pageMode"
      :adConfig="novelBottomAdConfig"
      :reportShowVertical="reportShowBootmAd"
      :reportShowHorizontal="reportShowBootmAdH"
      :shouldLoadBannerAd="shouldLoadBannerAd"
      :newBottomAdType="newBottomAdType"
      :isFreeAd="ccid && isFreeAd"
      :isReqBottomAd="isReqBottomAd"
      :rewardAdBottom="rewardAdBottom"
      :clientResize="clientResize"
      :clientWidth="clientWidth"
      @getCurPage="getCurPage"
      @changeBootomAd="changeBootomAd"
      @changeBootomAdType="changeBootomAdType"
    />
    <!-- 空白页 1 -->
    <BlankPage
      v-if="blankPage.show"
      :show='blankPage.show'
      :type="blankPage.type"
      :message="blankPage.message"
      :showTool="blankPage.showTool"
      @setTool="setTool"
      @setReload="setReload"
    ></BlankPage>

    <!-- 登录Dialog弹窗, loginPopwinReadpage通过世界树接口获取，大于等于0才触发逻辑登录，设置为0则是功能关闭 -->
    <LoginDialog v-if="isHmArk" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { PAGE_CHANGE_MODE, READ_PROGRESS_CAUSE, ERROR_CODE, APP_STATUS, HWAD_TYPE, AD_TYPE, BOOTM_BAR_HEIGHT } from '@/constants';
import { getChapter, getBookInfo } from '@/api/read';
import jsbridge from '@/utils/jsbridge';
import crypto from '@/utils/crypto';
import {
  read as readCacheData,
  setGuid, getGuid,
  setReadCacheData, getReadCacheData,
  getBookCacheData, setBookCacheData,
  getChapterByCbid
} from '@/utils/cacheData';
import {
  getClient,
  throttle,
  isValidCcid,
  debounce,
  formatBookInfo,
  toast,
  hideToast,
  getTheme,
  getUserInfo,
  getMidnight,
  setStatusBarInfo,
} from '@/utils/helpers';
import {
  isSwitchOpen,
  getVisibility,
  // setResizeObserver,
  isReadPZero,
  isFeiYe,
  skeletonFn,
  getDBData,
  getMemData,
  setCacheChapter,
  setBannerCache,
  canShowBanner,
  inRewardAd,
  getRewardAdCP,
  getBookDialogShow,
  isDeepBookDialogShow,
  getDeepBookDialogShow,
  getBookReadCache,
  report,
  logReader,
} from '@/pages/read/read.js'
import {
  BookInfo,
  Topbar,
  ReadTool,
  FixBottomAd,
  Loading,
  Onboarding,
} from '@/components';
import BreadCrumb from './components/breadcrumb.vue';
import ChapterByVertical from './components/chapterByVertical.vue';
import ChapterByHorizontal from './components/chapterByHorizontal.vue';
import Footer from './components/footer.vue';

let popBfWinPage = 0; // 记录阅读页数-底部加书架提示条
let resizeTag = false // resize 标记
let resizeTimer = null // resize 延迟执行

let totalChapterIds = [];
let totalPagesH = 0; // 用户翻页的个数-横翻
let contentPage = 0; // 内容页数-横翻

// 竖翻
let startScrollY = 0; // 用户上次滑动停止的距离
let slideDistance = 0; // 用户在竖翻模式下，滑动的距离总计
let scrollEnd = 0; // 滚动结束的距离
let loadReqTimer = null // 竖翻加载提示计时器

// 激励下载广告
let downTimer = null // 出提示气泡
let downDelay = false // 延迟出弹框

// 缓存记录-机器阅读数据：按手机维度存的相关数据
let readTimer = null // 计时器
let readTimes = 1 // 阅读累积计时s（加缓存）
let readPages = 1 // 阅读累积页数（加缓存）
let readEndTime = 0 // 时间戳

// 缓存记录-书籍阅读数据：按书籍维度存的相关数据
let readTimerBook = null // 计时器
let readTimesBook = 1 // 当前书籍阅读累积计时s（加缓存）
let readEndTimeBook = 0 // 时间戳

export default {
  name: 'Read',
  components: {
    BookInfo,
    Topbar,
    ReadTool,
    FixBottomAd,
    Loading,
    Onboarding,

    BreadCrumb,
    ChapterByVertical,
    ChapterByHorizontal,
    Footer,

    // 异步加载组件
    AddBookBar: import('@/components/AddBookBar'),
    AddBookShelf: import('@/components/AddBookShelf'),
    BannerAd: import('@/components/BlankPage'),
    BlankPage: import('@/components/BlankPage'),
    BookDetail: import('@/components/BookDetail'),
    BookDialog: import('@/components/BookDialog'),
    DeepBookDialog: import('@/components/DeepBookDialog'),
    Catalog: import('@/components/Catalog'),
    DownAdDialog: () => import('@/components/DownAdDialog'),
    RewardDialogAd: () => import('@/components/RewardDialogAd'),
    RewardBottomAd: () => import('@/components/RewardBottomAd'),
    LoginDialog: () => import('@/components/LoginDialog'),
  },
  data() {
    const { cbid } = this.$route.params; // 书籍 id-阅文
    const { hwbid } = this.$route.query; // 书籍 id-华为
    const { clientWidth, clientHeight } = getClient()
    // 初始化 获取 主题信息
    const pageChangeMode = readCacheData.getPageChangeMode();
    return {
      clientWidth,
      clientHeight,
      pageChangeMode,
      cbid,
      hwbid,
      footerHeight: 36, // 电量高度
      clientResize: 0,
      isOffline: false, // 书籍下架
      loading: false,
      bookInfo: null,
      isInBookShelf: 0, // 是否在书架：0-不在书架，1-在书架
      initChapter: 0, // 获取初始章节成功：0-默认，1-成功，-1-失败
      chapterList: [],
      chapter: null, // 保存当前章节内容
      chapterIndex: 0, // 章节索引
      originCid: 1, // 第1次进来的章节索引
      // cpReqStatus: 0, // 章节请求失败状态码
      // reqCpIndex: 0, // 新的章节索引-下架章节处理
      // reqCpType: '', // 重试状态类型-下架章节处理
      // feiyeCpErr: false, // 无进度有书籍信息，扉页章节失败处理
      swiperCpNum: 0, // 章节切换次数

      isShowTool: false, // 是否展示菜单栏&顶部导航栏
      renderCatalog: false, // 是否渲染目录
      isShowCatalog: false, // 是否展示目录
      isHideCatalog: false, // 是否关闭目录
      renderAddShelf: false, // 渲染加书架弹窗-加书架弹窗
      showAddShelf: false, // 显示加书架弹窗-加书架弹窗
      renderOnboarding: false, // 渲染新手引导-新手引导
      showOnboarding: false, // 显示新手引导-新手引导
      readToolNeedAnim: true,

      // 横翻预渲染
      showHchapter: true, // 是否出横翻，用于销毁再渲染横翻
      outHcpList: [], // 外部传入的章节数组
      hpIndex: 0, // 页面布局变化前所在位置（行数）
      chapterNow: null,
      loadNowChapter: '', // 当前章加载状态
      loadPrevChapter: '', // 前章加载状态
      loadNextChapter: '', // 后章加载状态
      pageNum: 1, // 进度偏移量
      isHFeiye: true, // 是否扉页-横翻

      // 竖翻
      showVchapter: true, // 是否出竖翻，用于销毁再渲染竖翻
      scrollY: 0,
      // yDiff: 0, // 手移动距离
      // yDirection: '', // 手移动方向
      canLoadAd: false, // 是否可预加载插页广告

      // 空白页
      blankPage: {
        show: false,
        showTool: false,
        type: '',
        message: '',
      },
      firstEnter: true,

      // 固底广告
      bootmAdH: BOOTM_BAR_HEIGHT, // 高度
      curPage: 1, // 当前页码
      // 固底-多广告位新请求
      showNewBottomAd1: true, // 固底广告1
      showNewBottomAd2: false, // 固底广告2
      newBottomAdType: 0, // 广告类型 0、1、2

      // 公告广告
      showBannerAd: false, // 是否显示
      closeBannerAd: false, // 是否关闭此广告
      isReqBottomAd: false, // 是否触发固底广告请求
      isFeiyebanner: true, // 是否从扉页过来的
      isTouchRead: false, // 是否触摸内容页
      // bannerAdFail: false, // 是否请求失败

      // 热启广告
      shouldLoadHotAd: false,

      // 激励下载广告-交互弹窗
      renderDialog: false, // 渲染弹窗
      showDialog: false, // 显示弹窗
      dialogType: '', // 弹窗类型
      downAdData: null, // 广告数据
      adReportType: '', // 广告类型

      // 章首激励视频广告
      renderRewardAdDialog: false, // 渲染-弹窗激励视频
      rewardAdDialog: false, // 显隐-弹窗激励视频
      rewardAdBottom: false, // 显隐-固底激励视频

      // 底部加书架提示条
      showAddBookBarNum: 0, // 打开次数
      showAddBookBarState: 0, // 控制显隐
      // isCancelAddBookBar: false, // 是否点击撤销加书架

      // 退出阅读器弹窗
      showBookDialog: false, // 推书弹窗-浅度推书弹窗
      showBookDialogCount: 0, // 弹窗已弹出次数-浅度推书弹窗
      showDeepBookDialog: false, // 推书弹窗-深度推书弹窗
      showDeepBookDialogCount: 0, // 弹窗已弹出次数-深度推书弹窗
      shouldGetDeepBook: false, // 是否开始获取书籍-深度推书弹窗

      // 书籍详情页
      renderBookDetail: false, // 是否渲染
      showBookDetail: false, // 是否显示

      // 章尾推书
      // isLastPage: false, // 是否是最后一章最后一页
    };
  },
  computed: {
    ...mapGetters([
      'theme',
      'fontSizeRatio',
      'fontSize',
      'fontLineHeight',
      'feedDisplayMode',
      'catalogLoading',
      'catalogList',
      'globalData',
      'autoAddBook',

      'freeAdConfig',
      'rewardInfo',
      'rewardFree',
      'rewardTimeGap',
      'novelInsideAdConfig',
      'novelBottomAdConfig',
      'controlBottomAd',
      'bannerAdConfig',
      'chapterBottomAdConfig',
      'controlLockAd',
      'downAdConfig',
      'downAdBar',
      'downAdDatas',
      'downAdDataApps',
      'rewardAdCpConfig',
      'bookUserConfig',
      'deepBooksConfig',
      'hasDeepBooks',
      'isHmArk'
    ]),
    functionSwitch() { // url 开关，1-打开 0-关闭
      /*
        functionswitch 目前控制开关：functionswitch=11110010NNNN
        1 跳过扉页 0-跳过扉页，其他不跳过扉页
        1 插页广告 0-关闭，其他默认打开
        1 固底广告 0-关闭，其他默认打开
        1 激励和章末广告 0-关闭，其他默认打开
        0 锁章广告 0-关闭，其他默认打开

        0 滑动触发广告点击 1-打开，其他默认关闭
        1 推荐书弹窗 1-打开，其他默认关闭
        0 公告开关 1-打开，其他默认关闭
        1 不同步阅读进度 1-打开，其他默认关闭
      */
      return {
        // 是否跳过扉页（在没有阅读进度时是否跳过扉页）
        isSkipFeiye: isSwitchOpen(this.globalData?.functionswitch?.[0], 0),
        // 是否关闭插页（包括插页的原生和插页的激励）
        isCloseInsertAd: isSwitchOpen(this.globalData?.functionswitch?.[1], 0),
        // 是否关闭底通
        isCloseBottomAd: isSwitchOpen(this.globalData?.functionswitch?.[2], 0),
        // 是否关闭激励（包括插页的激励和章末的激励）
        isCloseExcitationAd: isSwitchOpen(this.globalData?.functionswitch?.[3], 0),
        // 是否关闭锁章（拦截式插页广告）
        isCloseLockAd: isSwitchOpen(this.globalData?.functionswitch?.[4], 0),
        // 是否滑动触发广告点击
        isShowAdHover: isSwitchOpen(this.globalData?.functionswitch?.[5], 1),
        // 是否弹出推荐书弹窗（退出阅读器）
        isShowBookDialog: isSwitchOpen(this.globalData?.functionswitch?.[6], 1),
        // 公告广告开关
        isShowBannerAd: isSwitchOpen(this.globalData?.functionswitch?.[7], 1),
        // 是否不同步阅读进度
        isOutProgress: isSwitchOpen(this.globalData?.functionswitch?.[8], 1),
      }
    },
    pageMode() { // 翻页模式
      // 竖翻
      if (this.pageChangeMode === PAGE_CHANGE_MODE.VERTICAL) {
        // 竖翻扉页、插页广告页都出固底广告-固底广告
        this.$store.commit('adConfig/setBottomAdOpen', { show: true })
        this.toggleClass(true, 'body_scroll')
      } else {
        this.toggleClass(false, 'body_scroll')
      }
      return {
        isVertical: this.pageChangeMode === PAGE_CHANGE_MODE.VERTICAL,
        isHorizontal: this.pageChangeMode === PAGE_CHANGE_MODE.HORIZONTAL,
      };
    },
    outCcid() { // 外部传入的章节 id-跳指定章节
      return this.globalData?.chapterId || '' // url 传入章节 id
    },
    ccid() { // 当前章节 id
      return this.chapter ? this.chapter.ccid : '';
    },
    isFirstChapter() { // 是否首章
      if (this.bookInfo && this.chapterIndex <= 1) {
        return true
      }
      return false
    },
    isLastChapter() { // 是否最后1章
      if (this.chapter && this.chapter.nextCcid === '-1') {
        return true
      }
      return false
    },
    maxChapterIndex() { // 最大章节索引
      return this.catalogList.length || (this.bookInfo && this.bookInfo.lastChapter) || 1
    },
    isVFeiye() { // 是否在扉页-竖翻
      if (!this.isFirstChapter) {
        return false;
      }
      if (this.pageMode.isVertical) {
        // clientHeight 取整防止目录切第一章还按照扉页算 752.2 < 752.3
        return this.scrollY < Math.floor(this.clientHeight) && !this.isShowCatalog;
      }
      return false;
    },
    inBookFeiye() { // 判断是否在扉页
      return this.pageMode.isVertical ? this.isVFeiye : this.isHFeiye
    },
    reportPdid() { // pdid 上报
      return this.inBookFeiye ? 1 : 2
    },

    vchapterName() { // 顶部导航章节名-竖翻
      const bookName = this.bookInfo ? this.bookInfo.title : ''
      const chapterName = this.chapter ? this.chapter.title : ''
      return chapterName || bookName
    },
    bookCover() {
      return this.bookInfo ? this.bookInfo.coverHttps : '';
    },
    isDeepBookDialog() { // 配置是否打开-深度推书弹窗
      return this.functionSwitch.isShowBookDialog && this.deepBooksConfig
    },

    // 广告
    isFreeAd() { // 是否阅文配置按章节免广
      if (this.freeAdConfig > 0 && this.chapter && this.chapter.cid <= this.freeAdConfig) {
        // TODO: 测试公告页广告，上线改为 => return true
        return true;
      }
      return false
    },
    inRewardDuration() { // 是否在免广告时区间
      let tag = false
      if (this.rewardFree) {
        tag = true
        this.clearDownBubble() // 免广权益消失后可再出提示弹框
      } else if (this.rewardInfo) {
        tag = inRewardAd(this.rewardInfo, this.rewardTimeGap)
      }
      if (tag) {
        this.$store.commit('adConfig/setDownAdBar', { type: 'reward' }) // 出管理栏
      }
      window.$config.isReward = tag
      return tag
    },
    shouldLoadPpsbAd() { // 是否应该加载插页广告-插页广告
      // 章节内容加载完毕，免广判断放到组件里去
      if (!this.chapter || this.inRewardDuration || this.functionSwitch.isCloseInsertAd) {
        return false
      }
      return this.novelInsideAdConfig && this.chapter.cid >= this.novelInsideAdConfig.startChapter;
    },
    shouldLoadLockAd() { // 是否插入锁章广告-插页锁章广告
      return Boolean(this.shouldLoadPpsbAd && this.novelInsideAdConfig.lockChapterConfig && !this.functionSwitch.isCloseLockAd)
    },
    shouldLoadRewardAd() { // 是否应该加载激励视频广告-插页激励视频广告
      return Boolean(this.shouldLoadPpsbAd && this.novelInsideAdConfig.rewardAdConfig && !this.functionSwitch.isCloseExcitationAd)
    },
    shouldLoadChapterBottomAd() { // 是否应该加载-章末激励视频广告
      // 章节内容加载完毕，免广判断放到组件里去
      if (!this.chapter || this.inRewardDuration || this.functionSwitch.isCloseExcitationAd) {
        return false
      }
      return Boolean(this.chapterBottomAdConfig && this.chapterBottomAdConfig.rewardAdConfig);
    },
    shouldLoadBannerAd() { // 是否渲染公告广告-公告广告
      // initChapter-免广章节不需要发请求
      if (this.initChapter <= 0 || this.inRewardDuration || !this.functionSwitch.isShowBannerAd) {
        return false
      }
      if (this.closeBannerAd) {
        return false
      }
      // 每天最大展示次数、最小展示间隙控制
      if (!canShowBanner(this.bannerAdConfig)) {
        return false
      }
      return Boolean(this.novelInsideAdConfig && this.bannerAdConfig)
    },
    shouldLoadBottomAd() { // 开关-固底广告
      // initChapter-免广章节不需要发请求
      if (this.initChapter <= 0 || this.inRewardDuration || this.functionSwitch.isCloseBottomAd) {
        return false
      }
      return Boolean(this.novelBottomAdConfig)
    },
    shouldAd() { // 监听会引起页面变化的广告变量
      /*
        1. 默认要是 true，防止一进入就先 false 后 true 引发横翻重算
        2. 固底被 url 参数关闭了就监听插页广告
        3. 新人进来章节内容出来了，但是还没拿到 sdk 广告配置，过一会才拿到广告配置
        4. 切章后激励视频免广到期需重新出广告
      */
      if (this.initChapter === 0) {
        return true
      }
      let hasAd = this.shouldLoadBottomAd
      if (this.functionSwitch.isCloseBottomAd) {
        hasAd = this.shouldLoadPpsbAd
      }
      return hasAd && !this.inRewardDuration
    },
    reportShowBootmAd() { // 是否扉页曝光竖翻-固底广告
      // 扉页+菜单栏、固底激励视频
      if ((this.isVFeiye && this.isShowTool) || this.rewardAdBottom) {
        return false
      }
      return true
    },
    reportShowBootmAdH() { // 是否扉页曝光横翻-固底广告
      // 扉页、公告、固底激励视频
      if (this.isHFeiye || this.shouldLoadBannerAd || this.rewardAdBottom) {
        return false
      }
      return true
    },

    bootmAdHeight() { // 传到组件里的固定高度-固底广告
      return this.shouldLoadBottomAd ? this.bootmAdH : 0
    },
    bootmAdHeight2() { // 动态高度-固底广告
      return (this.shouldLoadBottomAd && this.controlBottomAd.isFree !== 'true') ? this.bootmAdH : 0
    },
  },
  watch: {
    inBookFeiye() { // 扉页变化
      if (window.$config.loadIng >= 2) {
        this.isAutoBookBar() // 出内容后翻到非扉页出-进页面自动加书架
      }
    },
    fontSize() { // 字号大小变化重置组件-竖翻
      if (this.chapter && this.pageMode.isVertical) {
        this.resetAllChapter('fontSize', true, true)
      }
    },
    fontLineHeight() { // 行距大小变化重置组件-竖翻
      if (this.chapter && this.pageMode.isVertical) {
        this.resetVchapter(true)
      }
    },
    catalogLoading(val) { // 监听目录请求的返回结果
      if (this.reqCpType === 'catalog') {
        const len = this.catalogList.length
        if (val === 2 && len > 0) { // 用新的章节 id 重试
          if (this.reloadChapter(len, this.reqCpIndex)) {
            return
          }
        }
        // 失败处理
        this.cpReqStatus = 0
        this.setBlank({ show: true, type: 'error' })
      }
    },
    downAdDataApps() { // 广告弹窗数据被清空-激励下载广告
      // 广告清空需要主动关闭弹窗
      if (this.showDialog && this.dialogType === 'list' && this.downAdDataApps.length <= 0) {
        this.closeDownDialog('list')
      }
      // 广告清空需要重置提示弹框
      if (this.downAdDataApps.length <= 0) {
        this.clearDownBubble()
      }
    },
    inRewardDuration(val) { // 免广时间内
      if (val) {
        // 关闭-章首弹窗、固底激励视频
        this.closeRewardAll()
      }
    },
  },

  created() {
    this.initData()
    this.initBookInfo()
    this.getTheme()
    this.commitPerformanceEvent()
    this.judgeCacheDBDate(this.cbid) // 判断是否走DB逻辑
    report(null, null, 'all') // 进入页面第1时间上报遗留数据
    window.$config.guid = getGuid() || -1 // 获取缓存的 guid
  },
  mounted() {
    const { clientWidth, clientHeight } = getClient()
    this.clientWidth = clientWidth
    this.clientHeight = clientHeight

    document.body.addEventListener('scroll', this.onScrollThrottleFn, { passive: true });
    document.body.addEventListener('scroll', this.onScrollDebounceFn, { passive: true });
    window.addEventListener('visibilitychange', this.onVisibilityChange,  { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });
    // window.addEventListener('beforeunload', this.beforeUnload);

    // 监听页面大小变化 ResizeObserver
    /* if (window.ResizeObserver) {
      setResizeObserver(() => {
        if (this.resizeNum > 0) {
          this.onResize()
        }
        this.resizeNum = 1
      })
    } else {
      window.addEventListener('resize', this.onResize, { passive: true });
    } */

    this.handleOnbroading();
  },
  beforeDestroy() {
    // window.removeEventListener('beforeunload', this.beforeUnload);
    clearTimeout(downTimer)
    clearInterval(readTimer) // 清除计时器-机器阅读数据
    clearInterval(readTimerBook) // 清除计时器-书籍阅读数据
    report(null) // 销毁前-上报全部数据
  },

  methods: {
    // 兼容indexedDB逻辑
    judgeCacheDBDate(cbid) {
      this.canGetCache = true
      this.chapterCacheType = getChapterByCbid(this.cbid);
      if (!this.chapterCacheType) { // localStorage 里没找到章节内容就走 indexdeDB
        getDBData(cbid)
      }
    },
    setReload(outProgress) { // 刷新组件
      window.$config.pageTime = new Date() * 1
      this.clearReload(false)
      this.initBookInfo(outProgress)
      this.getTheme()
    },
    setLoading(loading) { // 变更 loading 值
      this.loading = loading
      if (window.$config.loadIng >= 2) { // 已关闭骨架屏
        window.$config.loadIng = loading ? 3 : 4
      }
    },
    getScrollTop() {
      return document.body.scrollTop || document.documentElement.scrollTop;
    },
    onScrollThrottle() { // 首次进入阅读页监听滚动，展示上滑阅读提示-竖翻
      // 横翻、没数据、加载中不需要监听滚动
      const loadIng = window.$config.loadIng
      if (this.pageMode.isHorizontal || this.chapterList.length <= 0 || loadIng === 1 || loadIng === 3) {
        return
      }
      const scrollTop = this.getScrollTop()
      if (scrollTop === this.prevStartScroll) { // 拦截相同的值
        return
      }
      this.prevStartScroll = scrollTop
      this.setScrollY(scrollTop)

      // 如果是在扉页、滑动即开始计时-阅读时长计时
      if (scrollTop > 0 && this.isSlideFirst && this.isVFeiye) {
        this.reportStayTime(0) // 竖翻滑动开始就算阅读
        this.isSlideFirst = false
      }

      // console.log(444, '滚动中', this.prevStartScroll, scrollTop);

      // 每次阅读翻页触发-数据上报
      if (scrollTop > 0) {
        if (!this.thePages) { // 第1页不上报
          this.thePages = this.isVFeiye ? -1 : 1
          return
        }
        const thePages = this.getCurentPageNum()
        if (thePages > 0 && thePages !== this.thePages) {
          this.thePages = thePages
          this.setRewardAdCP('onScrollThrottle', 0) // 竖翻滚动翻页-出激励视频广告
          this.logChangePage(this.thePages)
        }
      }
    },
    onScrollDebounce(type) { // 滚动停止后，向浏览器同步阅读进度-竖翻
      const loadIng = window.$config.loadIng
      if (this.pageMode.isHorizontal || this.chapterList.length <= 0 || loadIng === 1 || loadIng === 3) {
        return
      }
      const { scrollTop, scrollHeight } = document.body;
      if (scrollTop === this.prevEndScroll && type !== 'touchEnd') { // 拦截相同的值
        return
      }
      this.prevEndScroll = scrollTop

      // 计算滑动的距离
      if (this.isSliding) {
        slideDistance = slideDistance +  Math.abs(this.scrollY - startScrollY);
        this.isSliding = false;
      }
      startScrollY = this.scrollY;
      scrollEnd = scrollTop
      this.setScrollY(scrollTop);

      console.log(444, '滚动停止后', scrollTop);
      this.loadChapter(scrollTop, scrollHeight, type)
    },
    setScrollY(y) {
      this.scrollY = y
    },
    loadChapter(scrollTop, scrollHeight, type) { // 滑动结束加载上下章-竖翻
      const client3 = this.clientHeight * 3 // 3页
      const client6 = this.clientHeight * 6 // 6页
      let status = ''
      if (scrollTop > scrollHeight - client3) { // 滚动距离还剩3页加载下一章
        status = 'next'
      }
      if (scrollTop < client6) { // 滚动距离小于6页加载上一章
        const foundNextChapter = this.getNextChapter(this.chapter.nextCcid)
        // 如果不是预加载下一章 || 存在下一章 || 最后一章
        if (status !== 'next' || foundNextChapter || this.isLastChapter) {
          status = 'prev'
        }
      }

      // 第一章扉页
      if (this.isFirstChapter && status === 'prev' && scrollTop <= 1) {
        return
      }
      // 最后一章最后一页加载提示
      if (this.isLastChapter && status === 'next' && Math.floor(scrollHeight - scrollTop) - 1 <= Math.ceil(this.clientHeight)) {
        if (this.yDiff > 1) {
          toast('已经是最后一页了')
        }
        return
      }
      // 更新进度
      this.addReadProgress({ type: 'vertical', caseType: READ_PROGRESS_CAUSE.SLIDER });
      if (!status) {
        return
      }

      // 加载上下章
      const loadStatus = status === 'next' ? this.loadNextChapter : this.loadPrevChapter
      if (loadStatus !== 'req') {
        if (status === 'next') {
          this.preloadNextChapter()
        } else {
          this.preloadPrevChapter()
        }
      }

      // 加载提示：第一章和最后一章不出提示
      if (type === 'touchEnd' && !this.isFirstChapter && !this.isLastChapter) {
        if (loadStatus === 'err') { // 失败重新请求出提示
          toast('正在拼命加载章节')
        }
        if (loadStatus === 'req') { // 加载中出提示
          clearTimeout(loadReqTimer)
          loadReqTimer = setTimeout(() => {
            if (status === 'next' && this.loadNextChapter === 'req') {
              toast('正在拼命加载章节')
            }
            if (status === 'prev' && this.loadPrevChapter === 'req') {
              toast('正在拼命加载章节')
            }
          }, 200)
        }
      }
    },
    onResize() { // 监听页面尺寸发生变化
      if (!resizeTag) {
        resizeTag = this.setAutoLoading(() => { // 间隔 300ms 触发一次
          resizeTag = false
          // 宽高变化再触发一次
          const { clientWidth, clientHeight } = getClient(true)
          if (clientWidth !== this.clientWidth || clientHeight !== this.clientHeight) {
            this.onResize()
          }
        }, 300)

        // 延迟 50ms 拿页面宽高数据，否则可能不准确
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          this.resizeFn()
        }, 50)
      }
    },
    resizeFn() {
      const { clientWidth, clientHeight } = getClient(true)
      // 拦截掉宽高未发生变化的场景
      if (this.clientWidth === clientWidth && this.clientHeight === clientHeight) {
        return
      }

      // 重置 yDiff，屏蔽屏幕大小变化导致的自动切章
      this.yDiff = 0

      if (this.chapter) {
        // 按照字符位置定当前章节-竖翻
        const { pCid } = window.$config.progressLine
        if (this.pageMode.isVertical && pCid !== this.chapter.cid) {
          const theChapter = this.chapterList.find(({ cid }) => cid === pCid);
          if (theChapter) {
            this.sliderChapterChange(theChapter, 'resize')
          }
        }

        // 扉页重置字符进度-竖翻
        if (this.isVFeiye) {
          this.setProgressLine(false)
        }

        // 同一章节前后两次宽高一致则保持进度不变
        if (this.cacheProgress) {
          const { pIndex, textIndex, cacheWidth, cacheHeight, ccid } = this.cacheProgress
          if (clientWidth === cacheWidth && clientHeight === cacheHeight && this.chapter.ccid === ccid) {
            this.setProgressLine({
              pIndex,
              textIndex,
              cache: true,
            })
          } else {
            this.setCacheProgress(this.clientWidth, this.clientHeight)
          }
        } else {
          this.setCacheProgress(this.clientWidth, this.clientHeight)
        }
      }

      // 在重新复制之前上报变化
      report('reader_screen_size_changed', {
        chap_no: this.ccid,
        ext1: Number(this.clientWidth).toFixed(2),
        ext2: Number(this.clientHeight).toFixed(2),
        ext3: Number(clientWidth).toFixed(2),
        ext4: Number(clientHeight).toFixed(2),
      })
      this.clientWidth = clientWidth
      this.clientHeight = clientHeight
      if (this.showHchapter) {
        this.clientResize = this.clientResize + 1
      }
      console.log('resizeFn', '触发 reszie', JSON.stringify(window.$config.progressLine), JSON.stringify(this.cacheProgress));

      // 屏幕宽高变化重置组件-竖翻
      if (this.chapter && this.pageMode.isVertical) {
        this.resetAllChapter('resize', true)
      }
    },
    onVisibilityChange() { // 监听页面是否进入后台
      const status = getVisibility()
      const isFeiye = this.inBookFeiye
      this.$store.commit('global/setPageStatus', status)

      // 热启广告
      this.renderHotAd(status, isFeiye)

      if (status === 'visible') { // 页面显示
        // 回退到阅读器重设外部导航栏背景色
        const cacheBarTheme = readCacheData.getCacheBarTheme()
        if (this.theme.theme !== 'dark' && cacheBarTheme) {
          jsbridge.call('setBackground', this.theme.theme)
        }
        readCacheData.setCacheBarTheme('')
      }
      if (status === 'hide') { // 页面隐藏
        setTimeout(() => { // 上报全部数据
          report(null)
        }, 0)
      }

      if (isFeiye && this.stayTime.totalDuration === 0) {
        return;
      }
      if (status === 'visible') { // 页面显示
        this.reportStayTime(0) // 重置计时器
      }
      if (status === 'hide') { // 页面隐藏
        // 有计时器在跑，则上报阅读时长
        if (this.stayTime.objInterval) {
          this.logExitChapter(2);
        }
      }
    },
    toggleClass(bool, tClass, dom = '') {
      const body = dom || document.querySelector('#read_body')
      if (bool) {
        body.classList.add(tClass)
      } else {
        body.classList.remove(tClass)
      }
    },

    // 初始化
    initData() { // 初始化非响应式数据
      // 阅读停留时长
      this.stayTime = {
        lastTime: new Date().getTime(), // 最近一次上报的时间戳
        duration: 0, // 单章的阅读时长
        totalDuration: 0, // 书籍的阅读总时长
        pages: 0, // 单章的阅读页数
        totalPages: 0, // 书籍的总阅读页数
        intervalTime: 30 * 1000, // 自动上报的间隔时间（30秒）
        objInterval: null, // interval对象
      };
      this.isSlideFirst = true; // 用户上划操作是否上报
      this.isSliding = false; // 标识当前是否正在滑动
      this.isGetFeedMode = false; // 是否已获得日夜间模式和背景色
      this.isGetBookInfo = false; // 是否已获取扉页信息
      this.onScrollThrottleFn = throttle(this.onScrollThrottle, 50);
      this.onScrollDebounceFn = debounce(this.onScrollDebounce, 50);
      // this.onVisibilityChangeFn = debounce(this.onVisibilityChange, 50);
      // this.onResizeFn = debounce(this.onResize, 50);
      this.reportEventFn = debounce(this.reportLcp, 1000);
      this.onBackCallbackFn = this.goBackCallback.bind(this);
    },
    async initBookInfo(outProgress) {  // 获取书籍详情数据-初始化首次加载信息
      if (!this.cbid) {
        this.closeBanner()
        toast('无效的书籍ID')
      }
      console.log(`耗时统计1：进入页面->阅读页初始化开始耗时 ${new Date() * 1 - window.$config.pageTime}`)
      try {
        // 获取进度、书籍信息、激励免广信息
        const grogressRes = jsbridge.call('getReadProgress', this.hwbid)
        const bookInfoRes = jsbridge.call('getBookInfo', this.hwbid)
        const freeAdInfoRes = jsbridge.call('getAdFreeInfo')

        // 进度错误特殊处理
        let readProgress = null
        let subscribeInfo = null
        try {
          const grogressRes2 = await grogressRes
          readProgress = grogressRes2.readProgress
          subscribeInfo = grogressRes2.subscribeInfo
        } catch (error) { // 进度失败出错误页
          this.clearReload()
          if (error.errorCode === ERROR_CODE.KIT_INIT) {
            return this.setBlank({ show: true, message: '请在华为浏览器中小说频道体验' })
          }
          return this.setBlank({ show: true, type: 'loading' })
        }
        // 书籍信息
        const bookInfo = await bookInfoRes
        // 获取激励免广信息
        try {
          const freeAdInfo = await freeAdInfoRes
          this.$store.dispatch('adConfig/getAdFreeInfo', freeAdInfo);
        } catch (error) {
          console.log('获取激励免广信息', error);
        }

        console.log('kit 进度', JSON.stringify(readProgress));
        console.log(`耗时统计2：进入页面->获取简介、阅读进度、激励免广信息耗时 ${new Date() * 1 - window.$config.pageTime}`)

        if (outProgress) { // 错误章节重试
          this.readProgress = null
          this.setProgressLine(false) // 重置字符进度
          readProgress = outProgress
          console.log(333, '章节错误重置进度', JSON.stringify(outProgress));
        } else if (this.outCcid) { // 跳指定章节
          readProgress = {
            ...readProgress,
            chapterId: this.outCcid,
            horizontalOffset: 0,
            verticalOffset: 0,
          }
          console.log(333, '跳指定章节', JSON.stringify(readProgress));
        }

        // 进度处理
        let theReadProgress = null
        if (readProgress) {
          theReadProgress = readProgress
          const { horizontalOffset, verticalOffset, chapterId, chapterIndex } = theReadProgress
          if (horizontalOffset) { // 初始进度页数
            contentPage = Number(horizontalOffset)
          }
          let verticalR = verticalOffset
          if (verticalR && verticalR.includes('_')) {
            verticalR = verticalR.split('_')
            const pIndex = Number(verticalR[1])
            const textIndex = Number(verticalR[2])
            if (chapterIndex >= 1) { // 非扉页
              // 有进度需要赋值给 verticalOffset
              theReadProgress.verticalOffset = (verticalR[0] === '0' && textIndex >= 0) ? 1 : verticalR[0]
              this.setProgressLine({ // 保存新的滚动行位置
                pIndex,
                textIndex,
                ccid: chapterId,
                cid: chapterIndex,
              })
            } else {
              theReadProgress.verticalOffset = 0 // 扉页进度是 0
            }
            console.log(333, '阅读字符进度：', window.$config.progressLine);
          }
        } else {
          this.canLoadAd = true // 可预加载插页广告
        }

        // 首章有进度且进度为 0
        const readp0 = isReadPZero(theReadProgress, this.pageMode)
        // 跳过扉页
        if (!this.outCcid && this.functionSwitch.isSkipFeiye) {
          if (!theReadProgress) { // 无进度
            this.readProgress = { verticalOffset: 1, horizontalOffset: 2 }
          }
          if (readp0) { // 进度为 0
            this.readProgress = theReadProgress
            this.readProgress.verticalOffset = 1
            this.readProgress.horizontalOffset = 2
            this.canLoadAd = true // 可预加载插页广告
          }
        }
        // 未赋值过需要在此赋值
        if (!this.readProgress) {
          this.readProgress = theReadProgress
        }

        // 进度索引
        if (!this.outCcid && theReadProgress && theReadProgress.chapterIndex > 0) {
          this.setOriginCid(theReadProgress.chapterIndex)
        }
        this.isInBookShelf = subscribeInfo.subscribeStatus;

        if (bookInfo) { // 如果客户端有缓存书详情
          this.bookInfo = formatBookInfo(bookInfo);

          // 判断是否扉页
          const theFeiYe = isFeiYe(theReadProgress, this.pageMode)
          if (!this.outCcid && theFeiYe) {
            // 已获取背景色和日夜间模式后，关闭骨架屏
            this.isGetBookInfo = true
            if (this.isGetFeedMode) {
              // 出菜单栏
              this.readToolNeedAnim = false
              this.setTool(true)
              this.closeSkeletonFn('isGetFeedMode')
            }

            this.getCurrentChapter('', false, 'feiye')
            this.chapterIndex = 1
          } else {
            // 不在扉页，请求完章节信息后：跳阅读进度、出公告页、关闭骨架屏
            await this.getCurrentChapter(theReadProgress?.chapterId, false);
            this.toProgress();
          }
        } else {
          await this.getBookAndChapter() // 客户端无缓存
        }
      } catch (err) {
        console.log('获取书封和进度失败', err);
        // 如果kit init失败，表示不在华为浏览器内
        if (err.errorCode === ERROR_CODE.KIT_INIT && process.env.NODE_ENV !== 'development') {
          this.setBlank({ show: true, message: '请在华为浏览器中小说频道体验' })
        } else {
          // 跳过扉页
          if (this.functionSwitch.isSkipFeiye) {
            this.readProgress = { verticalOffset: 1, horizontalOffset: 2 }
          }
          // 跳指定章节
          if (this.outCcid) {
            this.readProgress.chapterId = this.outCcid
          }
          await this.getBookAndChapter();
        }
      }

      if (this.blankPage.show) {
        return
      }
      // 如果是竖翻模式，需要将isReqBottomAd（是否触发固底广告请求）设为true
      if (this.pageMode.isVertical) {
        this.isReqBottomAd = true;
      }
      document.title = this.bookInfo.title
      jsbridge.call('onBack', this.onBackCallbackFn) // 监听系统返回事件

      // 上报阅读器曝光事件
      setTimeout(() => {
        const hasShowAddBookBar = this.globalData.popBfWin && this.autoAddBook > 0
        report('reader_wholePage_shown', {
          pdid: this.reportPdid,
          ext1: this.fontSize,
          ext2: this.theme.theme,
          ext3: this.pageChangeMode,
          ext4: hasShowAddBookBar ? 1 : 0,
          ext5: this.originCid, // 初始章节索引
          ext6: this.fontSizeRatio, // 系统字号
          ext7: this.fontLineHeight, // 行距
          ext9: this.globalData?.functionswitch, // 阅读功能开关
          win_width: this.clientWidth,
          win_height: this.clientHeight
        });
      }, 50);
    },
    async getBookAndChapter() { // 并发请求书详情和章节内容，关闭骨架屏
      try {
        const [bookInfo] = await Promise.all([
          getBookInfo({ cbid: this.cbid }),
          this.getCurrentChapter(this.readProgress?.chapterId, false),
        ]);
        this.bookInfo = bookInfo.book;

        // 需满足 bookInfo 和章节都拿到才行-横翻首章数据
        if (this.bookInfo && this.hchapter) {
          this.chapterNow = this.hchapter
        }

        // 非扉页：跳阅读进度（出公告页、关闭骨架屏）
        const theFeiYe = isFeiYe(this.readProgress, this.pageMode)
        if (!theFeiYe) {
          return this.toProgress()
        }

        // 出菜单栏
        this.readToolNeedAnim = false
        if (!this.blankPage.show) {
          this.setTool(true)
        }
      } catch (err) {
        console.error('getBookAndChapter', err);
      }

      this.closeSkeletonFn('getBookAndChapter', 30) // 保障固底广告有充足计算时间
    },
    async getTheme() { // 获取主题及背景色
      try {
        const { feedMode, colorOption } = await getTheme();
        this.$store.dispatch('theme/init', { feedMode, colorOption });

        // 已获取书封信息后，关闭骨架屏
        this.isGetFeedMode = true;
        if (this.isGetBookInfo) {
          // 出菜单栏
          this.readToolNeedAnim = false
          this.setTool(true)
          this.closeSkeletonFn('isGetBookInfo')
        }
      } catch (err) {
        console.log(err);
      }
    },
    closeSkeletonFn(type, time = 40) { // 关闭骨架屏
      // 跳转进度的、非首章的，在关闭前展示公告页-公告广告
      if (type === 'isHorizontal2' || type === 'isVertical' || !this.isFirstChapter) {
        this.setTimer(() => {
          this.showBanner(false)
        }, time - 20)
      }
      console.log('关闭骨架屏：', type, time)
      console.log(`耗时统计3：进入页面->骨架屏关闭前 ${new Date() * 1 - window.$config.pageTime}`)

      skeletonFn(time, () => {
        // 获取缓存-机器阅读数据
        this.getReadData()
        // 获取缓存-书籍阅读数据
        this.getReadData(true)

        // 初始化进页面-出激励视频广告
        this.setRewardAdCP('skeletonFn', 1)

        // 横翻扉页、公告页不显示固底广告-公告广告
        const isHide = this.isHFeiye || this.shouldLoadBannerAd
        if (this.pageMode.isHorizontal && isHide) {
          this.setBottomAd(false, true, 1)
        }

        // 初始出-进页面自动加书架
        this.isAutoBookBar()

        if (this.reqCpType !== 'catalog') {
          this.clearReload()
        }
        // 非紧急数据延迟 200ms-请求目录数据
        setTimeout(() => {
          if (this.reqCpType !== 'catalog') { // 重试调用中不再重复调
            this.$store.dispatch('catalogList/getCatalogList', this.cbid)
          }
        }, 200)
      })
    },
    setTimer(cb, time) { // 动态时间延迟执行
      if (time > 0) {
        setTimeout(() => {
          cb && cb()
        }, time)
      } else {
        cb && cb()
      }
    },
    clearReload(bool = true) {
      if (bool) { // 清除 reload_app 标记
        if (this.reloadApp) {
          this.reloadApp = false
          this.setLoading(false)
        }
      } else { // reload 刷新页面出 loading
        this.reloadApp = true
        this.setLoading(true)
      }
    },
    setBlank(blank) { // 出错误页
      this.feiyeCpErr = false
      if (this.cpReqStatus === 1012) { // 章节请求失败-下架章节处理
        this.readToolNeedAnim = false
        const theProgress = this.readProgress
        if (theProgress && theProgress.chapterIndex) {
          this.chapterIndex = Number(theProgress.chapterIndex)
          if (this.getCatalogListCp(this.chapterIndex)) {
            return
          }
        }
        this.setLoading(false)
        this.setTool(true)
        blank.showTool = true
        blank.message = '当前章节内容已下架，请重新选择目录章节'
      } else if (blank.show) {
        this.setLoading(false)
        this.setTool(false)
        blank.showTool = false
      }
      this.blankPage = {
        ...this.blankPage,
        ...blank,
      }
    },
    getCatalogListCp(cpIndex) { // 获取目录数据-下架章节处理
      // 重试过的不再重试
      if (this.reqCpType === 'suc') {
        return false
      }
      // 已有目录数据
      const len = this.catalogList.length
      if (len > 0) {
        if (this.reloadChapter(len, cpIndex)) {
          return true
        }
      }
      // 请求目录数据
      this.reqCpType = 'catalog'
      this.reqCpIndex = cpIndex
      this.$store.dispatch('catalogList/getCatalogList', this.cbid)
      return true
    },
    reloadChapter(len, cpIndex) { // 重新加载章节-下架章节处理
      // 超过目录最大章节数就定位到最后一章
      const last = this.catalogList[len - 1]
      const cp = this.catalogList[cpIndex - 1 > 0 ? cpIndex - 1 : 0]
      if (cp && cp.ccid) {
        const outProgress = this.getResetProgress(len, cp, cpIndex, last)
        this.reqCpType = 'suc'
        this.setReload(outProgress) // 用新的章节 id 重试
        return true
      }
      return false
    },
    getResetProgress(len, cp, cpIndex, last) { // 设置重刷新进度-下架章节处理
      return {
        chapterId: cp.ccid,
        chapterIndex: cpIndex,
        chapterName: cp.title,
        maxChapterId: last.ccid,
        maxChapterIndex: len,
        horizontalOffset: '0',
        verticalOffset: '0',
      }
    },

    // 章节加载
    async getCurrentChapter(ccid, showLoading = true, type) { // 获取当前章节且 && 预加载下一章内容
      if (!this.cbid) {
        return;
      }

      const time = (this.pageMode.isVertical && type === 'toPrevNext') ? 100 : 0
      let foundChapter = this.chapterList.find(chapter => chapter.ccid === ccid);
      if (!foundChapter) {
        if (this.loadNowChapter === 'req') {
          return
        }
        this.loadNowChapter = 'req'
        try {
          if (showLoading) {
            this.setLoading(true)
          }
          const startTime  = new Date().getTime();
          foundChapter = await this.getChapter(ccid);
          const endTime = new Date().getTime();
          jsbridge.commitPerformanceEvent({
            cause: 'chapter',
            startTime,
            endTime,
            cost: endTime - startTime,
          });
          this.chapterList.push(foundChapter);
          this.loadNowChapter = 'suc'
          this.setBlank({ show: false })
          if (!time) { // 切换目录延迟关闭 loading-竖翻
            this.setLoading(false)
          }
        } catch (err) {
          this.loadNowChapter = 'err'
          // 无进度+有书籍信息+章节内容报错，先出扉页
          if (type === 'feiye' || this.feiyeCpErr) {
            this.feiyeCpErr = true
            return
          }
          this.initChapter = -1
          this.setBlank({ show: true, message: err })
        }
      }
      if (!foundChapter) {
        return;
      }

      this.initChapter = 1
      this.setChapter(foundChapter)

      // 需满足 bookInfo 和章节都拿到才行-横翻首章数据
      if (this.bookInfo) {
        this.chapterNow = foundChapter
      } else {
        this.hchapter = foundChapter
      }

      // 若已有进度则处理进度问题，无进度向浏览器同步阅读进度
      const theProgress = this.readProgress
      if (!theProgress) {
        this.addReadProgress();
      }

      this.chapterReportEvent() // 章节加载后上报事件处理
      this.removeRewardInfo(); // 判断免广告时间是否到期

      // 从目录切到第一章跳过扉页-竖翻
      if (time && this.isFirstChapter) {
        setTimeout(() => {
          document.body.scrollTop = this.clientHeight;
        }, time)
      }

      // 有进度进来不预加载前面章节，先滚动到位-竖翻
      const verticalOffset = theProgress && theProgress.verticalOffset
      if (this.pageMode.isVertical && verticalOffset && verticalOffset > 0) {
        window.$config.preloadPrevState = 1
        this.preloadNextChapter()
        return
      }

      // 初始化预加载预渲染前1章-竖翻
      if (this.pageMode.isVertical) {
        window.$config.preloadPrevState = 2
      }

      // 预加载上下章节
      this.preloadPrevChapter(null, time)
      this.preloadNextChapter()
    },
    setOriginCid(cid) { // 设置初始章节索引
      window.$config.downAdCpIndex = 1
      window.$config.insertAdCpIndex = 1
      this.originCid = Number(cid)
    },
    setChapter(foundChapter) {
      const theCid = Number(foundChapter.cid)
      // 更新进度索引和页数-跳指定章节
      if (this.outCcid) {
        if (this.originCid <= 1 && theCid > 0) { // 进度索引
          this.setOriginCid(theCid)
        }
        const theProgress = this.readProgress
        if (theProgress) { // 跳章节首页
          this.readProgress = {
            ...theProgress,
            chapterIndex: theCid,
            verticalOffset: 1,
            horizontalOffset: theCid > 1 ? 1 : 2,
          }
        }
      }

      this.chapter = foundChapter
      this.chapterIndex = theCid
      totalChapterIds.push(foundChapter.ccid)

      // 每本书存1章，最多存50本
      // 刚进页面以及每次切章的时候更新缓存
      // 下次进来的时候可以直接读缓存拿到本章内容以加速
      setCacheChapter(this.cbid, foundChapter)
    },
    getNextChapter(nextCcid) { // 获取下一章
      return this.chapterList.find(chapter => chapter.ccid === nextCcid);
    },
    async preloadPrevChapter(type, time) { // 预加载上一章
      const { prevCcid } = this.chapter;
      const foundPrevChapter = this.chapterList.find(chapter => chapter.ccid === prevCcid);

      // 是否可渲染：非初始数据 && 非有数据加载上一章 && 非失败重试-横翻
      const renderH = type && type !== -1 && type !== 'err'
      if (foundPrevChapter && renderH) {
        this.chapterNow = foundPrevChapter
        this.loadPrevChapter = 'suc'
      }

      if (isValidCcid(prevCcid) && !foundPrevChapter && this.loadPrevChapter !== 'req') {
        this.loadPrevChapter = 'req'
        try {
          const prevChapter = await this.getChapter(prevCcid);
          if (prevChapter) {
            if (renderH) {
              this.chapterNow = prevChapter
            }
            this.chapterList.unshift(prevChapter)

            // 竖翻预加载预渲染处理
            if (this.pageMode.isVertical) {
              if (window.$config.preloadPrevState === 2) { // 初始无偏移量-前插章节跳回本章
                window.$config.preloadPrevState = 32
              } else {
                const scrollTop = this.getScrollTop()
                if (!scrollTop) { // 无滚动-前插章节跳回本章
                  window.$config.preloadPrevState = 30
                } else { // 初始有偏移量-前插章节跳回本章
                  if (window.$config.preloadPrevState === 1) {
                    window.$config.preloadPrevState = 31
                  }
                }
              }
            }
          }
          this.loadPrevChapter = prevChapter ? 'suc' : 'err'

          // 请求结束后去掉竖翻上下章节加载的 toast 提示-竖翻
          if (loadReqTimer) {
            clearTimeout(loadReqTimer)
            hideToast()
          }
        } catch (err) {
          this.reqChapterErr(err, type, 'prev')
        }
      }

      // 切换目录延迟关闭 loading-竖翻
      if (time) {
        this.setTimer(() => {
          this.setLoading(false)
        }, time)
      }
    },
    async preloadNextChapter(type) { // 预加载下一章
      const { nextCcid  } = this.chapter;
      const foundNextChapter = this.getNextChapter(nextCcid)

      // 是否可渲染：首章加载出来后下一章才可以要 && 非失败重试-横翻
      const renderH = this.chapterNow && type !== 'err'
      if (foundNextChapter && renderH) {
        this.chapterNow = foundNextChapter
        this.loadNextChapter = 'suc'
      }

      if (isValidCcid(nextCcid) && !foundNextChapter && this.loadNextChapter !== 'req') {
        this.loadNextChapter = 'req'
        try {
          const nextChapter = await this.getChapter(nextCcid);
          if (nextChapter) {
            // 刚进页面往前翻章加载前一章的时候刚好此时下一章请求完毕，这个时候只预请求不渲染-横翻
            if (!(this.swiperOver === 1 && this.loadPrevChapter === 'req') && renderH) {
              this.chapterNow = nextChapter
            }
            this.swiperOver = 0
            this.chapterList.push(nextChapter)
          }
          this.loadNextChapter = nextChapter ? 'suc' : 'err'

          // 请求结束后去掉竖翻上下章节加载的 toast 提示-竖翻
          if (loadReqTimer) {
            clearTimeout(loadReqTimer)
            hideToast()
          }
        } catch (err) {
          this.reqChapterErr(err, type, 'next')
        }
      }
    },
    reqChapterErr(err, type, tag) { // 竖翻、横翻：无数据加载新章节失败 || 失败重试只请求
      const { isVertical, isHorizontal } = this.pageMode
      let showToast = type === 2
      if (tag === 'next') {
        this.loadNextChapter = 'err'
      } else {
        this.loadPrevChapter = 'err'
        showToast = type === -2
      }
      if (isVertical || (isHorizontal && (showToast || type === 'err'))) {
        toast(err)
      }
    },
    toOne(ccid, cid, from) { // 目录、进度条跳章节
      // 切目录、手动切章重新计算初始章节-锁章
      if ((from === 'catalog' || from === 'progress') && cid > 0) {
        this.setOriginCid(cid)
      }

      // 目录跳转指定章节
      if (from === 'catalog') {
        this.setTool(false);
      }

      this.toPrevNext(ccid, from)
    },
    toPrev(ccid, from) { // 返回上一章-进度条
      const theCcid = this.chapter && this.chapter.prevCcid
      this.toPrevNext(ccid || theCcid, from)
    },
    toNext(ccid, from) { // 跳转下一章-进度条
      const theCcid = this.chapter && this.chapter.nextCcid
      this.toPrevNext(ccid || theCcid, from)
    },
    async toPrevNext(ccid, from) { // 章节切换
      if (from === 'readTool' || from === 'rewardNext') {
        totalPagesH += 1; // 进度上下切章、激励免广切章，阅读页数按照加 1 算
      }
      this.logExitChapter(3)
      this.closeBanner() // 进度条切换章节关闭公告-公告广告
      this.chapterList = []
      this.chapter = null;
      this.firstEnter = false; // 跳过扉页-目录进度修改
      this.resetChapter() // 重置横竖翻组件

      if (ccid) {
        this.readProgress = null // 确保切章上报进度
        await this.getCurrentChapter(ccid, true, 'toPrevNext')
      }

      this.firstEnter = true; // 跳过扉页-目录进度修改
      this.setRewardAdCP('toPrevNext', 1) // 手动切章-出激励视频广告
      this.isShowAddBookBar() // 切章时判断是否显示-加书架提示条
    },
    resetChapter() { // 组件重置-横竖翻
      this.resetAllChapter('prevNext') // 章节切换
      this.clearProgress() // 目录等手动切换章节不需要记进度
      if (this.pageMode.isHorizontal) {
        this.outHcpList = []
        this.swiperOver = 0
        this.showHchapter = false
        this.$nextTick(() => {
          this.showHchapter = true
        })
      }
      if (this.pageMode.isVertical) {
        this.showVchapter = false
        this.$nextTick(() => {
          this.showVchapter = true
        })
      }
    },
    resetAllChapter(type, reset, loading) { // 重置数据-横竖翻
      // 屏幕大小变化、字号变化、横竖翻切换、切目录、广告加载等引起页面重新渲染
      // if (['resize', 'fontSize', 'pageMode', 'prevNext', 'cache', 'shouldAd'].includes(type)) {

      // }
      // 屏幕尺寸变化 loading、字号变化 loading、横竖翻切换 loading、激励视频获得免广 loading-竖翻重置数据
      if (['resize', 'fontSize', 'pageMode', 'reward'].includes(type) && reset) {
        this.resetVchapter(loading)
      }
    },
    async hchapterChange(ccid, type, hasNext) { // 切换章节-横翻
      console.log('横翻切章：', ccid, type, hasNext);

      if (hasNext === 'err') {
        return this.getNewChapter(type)
      }

      this.logExitChapter(2)

      this.swiperOver = 1
      if (ccid) { // 有数据章节
        // 找到对应章节
        let chapter = null
        this.chapterList.some((val) => {
          if (val.ccid === ccid) {
            chapter = val
            return true
          }
        })
        this.setChapter(chapter)
        if (type === 1 && !hasNext) { // 加载渲染下一章
          this.preloadNextChapter(type);
        }
        if (type === -1 && !hasNext) { // 加载上一章不渲染
          this.preloadPrevChapter(type);
        }
      } else { // 无数据新章节
        if (type === 2) {
          await this.preloadNextChapter(type)
          if (this.loadNextChapter === 'suc') {
            this.setChapter(this.chapterNow)
            this.preloadNextChapter(1) // 继续加载下一章
          }
        }
        if (type === -2) {
          await this.preloadPrevChapter(type);
          if (this.loadPrevChapter === 'suc') {
            this.setChapter(this.chapterNow)
            this.preloadPrevChapter(-1) // 继续加载上一章不渲染
          }
        }
      }

      this.chapterReportEvent() // 章节加载后上报事件处理
      this.removeRewardInfo() // 切章删除免广告配置
      this.setRewardAdCP('hchapterChange', 1) // 横翻切章-出激励视频广告
      this.isShowAddBookBar() // 切章时判断是否显示-加书架提示条
    },
    getNewChapter(type) { // 重新加载失败数据，只请求不切章-横翻
      if (type === 2) {
        this.preloadNextChapter('err')
      }
      if (type === -2) {
        this.preloadPrevChapter('err');
      }
    },
    setHcpList(detail) { // 重置数据-横翻
      const { type, hccid, pIndex = 0 } = detail
      // 扉页加载首章，首章数据为空重试请求
      if (!hccid && !this.chapter) {
        // loading 关闭+扉页章节失败非错误页，出提示
        if ([2, 4].includes(window.$config.loadIng) && this.feiyeCpErr) {
          toast('正在拼命加载章节')
        }
        this.getCurrentChapter('', false)
        return
      }

      // 屏幕大小变化、字号变化
      this.resetAllChapter(type)

      // 直接传三章新数据进去：屏幕尺寸变化、字号大小变化、激励视频获得免广
      this.showHchapter = false
      this.hpIndex = pIndex
      this.outHcpList = this.getResetChapter(hccid || this.ccid)
      this.$nextTick(() => {
        this.showHchapter = true
      })
    },
    sliderChapterChange(foundChapter, type) { // 切换章节-竖翻
      if (type !== 'resize') {
        if (!this.yDiff || this.yDiff <= 1) { // 手移动1px以上才切章，屏蔽带进度进来自动切章
          return
        }
        this.logExitChapter(2)
        // 切章后更新 prevEndScroll 确保快速滑动时章节预加载不被拦截
        this.prevEndScroll = this.scrollY
      }

      // await this.getCurrentChapter(ccid);
      this.setChapter(foundChapter)
      this.chapterReportEvent() // 章节加载后上报事件处理
      this.removeRewardInfo() // 切章删除免广告配置
      this.setRewardAdCP('sliderChapterChange', 1) // 竖翻切章-出激励视频广告
      this.isShowAddBookBar() // 切章时判断是否显示-加书架提示条
    },
    resetVchapter(loading = false) { // 重置数据-竖翻
      // 直接传三章新数据进去：横竖翻切换、屏幕尺寸变化、字号大小变化、激励视频获得免广
      this.canLoadAd = false // 重置 canLoadAd
      this.showVchapter = false
      this.chapterList = this.getResetChapter(this.ccid, loading)
      this.$nextTick(() => {
        this.setProgressTime(new Date() * 1, 0)
        this.showVchapter = true
      })
    },
    setProgressTime(time1 = 0, time2 = 0) { // 设置进度时间-竖翻
      window.$config.progressLine.timeStart = time1
      window.$config.progressLine.timeEnd = time2
    },
    getDelay(delay, cb) { // 耗时超过 delay 加延时处理-竖翻
      let time = 0
      const { timeEnd, timeStart } = window.$config.progressLine
      if (timeStart > 0 && this.chapter) { // 确保有章节内容
        if (timeEnd) { // 滚动已走完
          const disTime = timeEnd - timeStart
          const delayTime = delay - 50
          if (timeStart > 0 && disTime > delayTime) {
            time = disTime - delayTime // 延迟 50ms 给滚动停止用
          }
        } else { // 滚动还没走完
          time = 'next'
        }
      }
      if (time === 'next') {
        setTimeout(() => {
          this.getDelay(delay, cb)
        }, 100)
      } else {
        cb && cb(time)
      }
    },
    setAutoLoading(cb, delay) { // 设置自动关闭 loading
      this.setLoading(true)
      setTimeout(() => {
        this.getDelay(delay, (time) => {
          this.setTimer(() => {
            this.setLoading(false)
            this.setProgressTime()
            cb && cb()
          }, time)
        })
      }, delay)
      return true
    },
    getResetChapter(theCcid, loading = false) { // 获取当前以及前后三章数据
      if (loading) { // 是否需要 loading 过渡
        this.setAutoLoading(null, 250) // 200ms太短一闪而过，250ms刚好
      }

      const foundIndex = this.chapterList.findIndex(({ ccid }) => ccid === theCcid);
      let start = foundIndex - 1 >= 0 ? foundIndex - 1 : 0
      if (!this.chapterList[start]) {
        start = foundIndex
      }
      return this.chapterList.slice(start, foundIndex + 2)
    },
    async getChapter(ccid) { // 获取指定章节内容
      let chapter = null;
      // 如果有进度，并且进度的章节是本次请求的章节，从本地缓存取数据
      if (this.readProgress && this.readProgress.chapterId === ccid && this.canGetCache) {
        try {
          if (this.chapterCacheType) {
            chapter = { ...this.chapterCacheType };
            this.chapterCacheType = null;
          } else {
            console.time('indexedDBData')
            chapter = await getMemData()
            console.timeEnd('indexedDBData');
            window.$config.indexedDBData = null // 取完数据就清空
          }
          this.canGetCache = false
          if (chapter && chapter.ccid === ccid) {
            return chapter;
          }
        } catch (err) {
          this.canGetCache = false
          this.chapterCacheType = null
          window.$config.indexedDBData = null // 失败就清空
          console.log(333, 'getChapter', err);
        }
      }
      try {
        const userInfo = await getUserInfo()
        chapter = await getChapter({
          ccid,
          cbid: this.cbid,
          uin: userInfo?.userId, // 新增用户字段，防盗版用
          guid: window.$config.guid,
        });
        this.cpReqStatus = 0
      } catch (err) {
        const errMsg = err.msg || String(err)
        report('reader_Abnormal_shown', {
          chap_no: ccid,
          ext1: 1,
          ext2: '/browser/huawei/chapter/content',
          ext3: err.code,
          ext4: errMsg,
        })
        if (err.code) {
          this.cpReqStatus = err.code
          if (err.code === ERROR_CODE.YW_OFFLINE) { // 书籍已下架
            this.isOffline = true
          }
        }
        throw errMsg
      }
      if (chapter) {
        chapter.content = crypto.decrypt(chapter.content);

        if (chapter.guid) { // 缓存 guid
          window.$config.guid = chapter.guid
          setGuid(chapter.guid)
        }
        if (chapter.nowTime) { // 客户端和服务端时间差
          let gap = chapter.nowTime - parseInt(new Date().getTime() / 1000, 10)
          gap = Math.abs(gap) > 300 ? gap * 1000 : 0
          this.$store.commit('adConfig/setRewardGap', gap)
          console.log(`客户端和服务端时间差：${gap / 1000}s`)
        }
      }
      return chapter;
    },
    onReward({ type, isNextChapter, nextCcid }) { // 免广权益
      // 激励视频奖励-竖翻
      if (this.pageMode.isVertical) {
        if (isNextChapter && nextCcid && isValidCcid(nextCcid)) { // 直接跳转下一章
          this.toOne(nextCcid, 'rewardNext')
        } else { // 广告变化重置组件
          this.resetAllChapter('reward', true, true)
        }
      }

      // 激励下载广告
      if (this.downAdConfig) {
        if (type === 'downAd') {
          this.setDownDialog({
            showDialog: true, // 弹窗弹出
            dialogType: 'start', // 权益已开启弹窗
          })
        } else {
          // 非激励下载广告需要关闭管理栏
          this.$store.commit('adConfig/setDownAdBar', { type: '' })
        }
      }

      // 激励插页广告
      if (type === 'insertAd') {
        this.setDownDialog({
          showDialog: true, // 弹窗弹出
          dialogType: 'start', // 权益已开启弹窗
          adReportType: AD_TYPE.INSERTREWARD,
        })
      }
    },
    removeRewardInfo() { // 判断免广告时间是否到期，到期清除权益
      if (!this.rewardInfo) {
        return;
      }
      const inReward = inRewardAd(this.rewardInfo, this.rewardTimeGap)
      if (!inReward) { // 免广到期有广告
        this.$store.commit('adConfig/removeReward')
        // 清除管理栏-激励下载广告
        if (this.downAdBar.type === 'reward') {
          this.$store.commit('adConfig/setDownAdBar', { type: '' })
        }
      }
    },
    chapterReportEvent() { // 新章节加载渲染后上报事件处理
      // bookinfo 先加载结束，若非首章直接上报阅读时长
      setTimeout(() => {
        if (!this.inBookFeiye) {
          this.reportStayTime(0);
        }
      }, 200);

      // 尾页曝光上报
      if (!isValidCcid(this.chapter.nextCcid)) {
        report('reader_AfterReading_shown');
      }
    },

    // 进度
    toProgress() { // 处理阅读进度偏移量
      const theProgress = this.readProgress
      if (!theProgress || !this.chapter) {
        return
      }

      const { verticalOffset, horizontalOffset } = theProgress
      if (this.pageMode.isVertical) {
        const { ccid, textIndex } = window.$config.progressLine
        const hasProgressLine = this.ccid === ccid && textIndex >= 0
        // 获取偏移量
        let offset = 0;
        if (verticalOffset) {
          offset = Number(verticalOffset)
          if (this.isFirstChapter && offset) { // 首章有滑动就跳过扉页
            offset = offset + this.clientHeight
          }
          if (hasProgressLine) {
            this.setScrollY(offset) // 有字符进度更新下 scroolY 确保竖翻扉页计算正确
          }
        }
        if (!hasProgressLine && !offset) {
          this.closeSkeletonFn('isVertical')
        } else {
          setTimeout(() => { // 渲染好页面后滚动
            if (!hasProgressLine && offset) {
              document.body.scrollTop = offset // 无字符进度滚动到对应位置
            }
            this.closeSkeletonFn('isVertical')
          }, 100)
        }
      } else {
        if (horizontalOffset) { // 跳阅读进度
          this.pageNum = Number(horizontalOffset)
        }
        const type = this.pageNum > 1 ? 'isHorizontal2' : 'isHorizontal1'
        this.closeSkeletonFn(type)
      }
      this.setTool(false) // 有进度的需要关闭状态栏信息
      setTimeout(() => {
        this.readProgress = null;
      }, 0);
    },
    setCacheProgress(width, height) { // 缓存 resize 前的进度数据
      if (width && height) {
        const { pIndex, textIndex } = window.$config.progressLine
        this.cacheProgress = {
          pIndex,
          textIndex,
          cacheWidth: width,
          cacheHeight: height,
          ccid: this.ccid,
        }
      } else {
        this.cacheProgress = null
      }
      window.$config.progressLine.cache = false
    },
    setProgressLine(param) { // 更新字符进度 progressLine
      if (!param) { // 重置进度
        param = {
          pIndex: 0,
          textIndex: -1,
          cache: false,
        }
      }
      window.$config.progressLine = {
        ...window.$config.progressLine,
        ...param
      }
    },
    clearProgress() { // 清除记录的 progressLine 进度
      contentPage = 0
      window.$config.progressLine = {
        timeStart: 0, // 加载滚动等开始时间
        timeEnd: 0, // 加载滚动等结束时间
        ccid: '',
        pCid: 0,
        pIndex: 0,
        textIndex: -1,
        cache: false,
      }
    },
    async addReadProgress(params = {}) { // 向浏览器同步阅读进度
      if (!this.ccid || !this.bookInfo) {
        return;
      }
      // url 配置，不同步阅读进度
      if (this.functionSwitch.isOutProgress) {
        return
      }
      try {
        const { pCid, pIndex, textIndex } = window.$config.progressLine
        const { lastChapterId } = this.bookInfo;
        const catalogLen = this.catalogList.length;
        let lastId = lastChapterId
        if (this.catalogList[catalogLen - 1]) { // 优先用目录 id
          lastId = this.catalogList[catalogLen - 1].ccid
        }

        // 按照字符位置定当前章节-竖翻
        let theChapter = null
        if (params.type === 'vertical' && pCid !== this.chapter.cid) {
          theChapter = this.chapterList.find(({ cid }) => cid === pCid);
        }
        const {  ccid, cid, title } = theChapter || this.chapter

        // 按照页数、滚动距离-计算进度
        let verticalOffset = 0 // 上下滑动偏移量
        let horizontalOffset = 0 // 左右滑动页码
        if (params.type === 'horizontal') {
          horizontalOffset = params.page || contentPage
        }
        if (params.type === 'vertical') {
          verticalOffset = Math.floor(this.getCurrentOffsetY())
        }
        // 按照初始字符位置计算进度
        if (textIndex >= 0) {
          if (!(params.type === 'vertical' && this.isVFeiye)) { // 竖翻扉页重置进度
            verticalOffset = `${verticalOffset}_${pIndex}_${textIndex}`
          }
        }

        await jsbridge.call('updateReadProgress', {
          ccid,
          title,
          horizontalOffset,
          verticalOffset,
          hwbid: this.hwbid,
          caseType: params.caseType || READ_PROGRESS_CAUSE.CHANGE_CHAPTER,
          cid: (cid <= 1 && this.inBookFeiye) ? 0 : cid,
          maxChapterIndex: this.maxChapterIndex,
          maxChapterId: lastId,
        });
      } catch (err) {
        console.log(err);
      }
    },

    // 菜单栏
    setTool(isShow) { // 唤起设置导航栏
      const theShowTool = isShow === undefined ? !this.isShowTool : isShow
      setStatusBarInfo(this.feedDisplayMode, theShowTool) // 设置状态栏信息
      this.closeCatalog(false) // 目录收起关闭动效
      this.isShowTool = theShowTool

      if (theShowTool) {
        report('reader_menu_shown')
      }
      setTimeout(() => {  // 延迟 20ms，等菜单栏渲染后再执行动效，否则无打开动效
        this.readToolNeedAnim = true
      }, 20)
    },
    vTouchStart(ev) { // 触摸开始-竖翻
      const touch = ev.clientY ? ev : ev.touches[0]
      this.yDown = touch.clientY
      this.yDiff = 0
      this.touchStart = this.scrollY
    },
    vTouchMove(ev) { // 移动中-竖翻
      const touch = ev.clientY ? ev : ev.touches[0]
      const yDiff = this.yDown - touch.clientY
      this.yDirection = yDiff > 0 ? 'up' : 'down' // 手势移动方向
      this.yDiff = Math.abs(yDiff) // 手势移动距离

      if (this.yDiff >= 1) { // 竖向滑动后可预加载插页广告
        this.canLoadAd = true;
        !this.closeBannerAd && this.showBanner(true);
      }

      // 上下模式滑动操作关闭菜单栏
      this.isSliding = true;
      if (this.isShowTool) {
        this.setTool(false);
      }
    },
    vTouchEnd() { // 触摸结束-竖翻
      // 滑动超过10px && 上滑 && loading 关闭 && 扉页章节失败非错误页，触摸再次加载
      if (this.yDiff >= 10 && this.yDirection === 'up' && [2, 4].includes(window.$config.loadIng) && this.feiyeCpErr) {
        toast('正在拼命加载章节')
        this.getCurrentChapter('', false)
        return
      }

      // 滑动结束无数据再次发起请求
      const scrollTop = this.getScrollTop()
      if (scrollEnd === this.scrollY && scrollTop === this.scrollY) {
        this.onScrollDebounce('touchEnd')
      }

      // 手动滑动超过 1px 后清空 resize 缓存的进度数据
      if (Math.abs(this.scrollY - this.touchStart) > 1) {
        this.setCacheProgress()
      }
    },
    setPageMode(mode) { // 设置翻页模式
      if (mode === this.pageChangeMode) { // 翻页模式不变就不往下执行
        return
      }
      const isBookFeiye = this.inBookFeiye
      if (isBookFeiye) {
        this.clearProgress() // 扉页切换需要清空进度
      }
      this.firstEnter = true

      // 切竖翻
      if (mode === PAGE_CHANGE_MODE.VERTICAL) {
        this.resetAllChapter('pageMode', true, true) // 切竖翻重置组件
        this.pageChangeMode = mode;
        this.closeBanner() // 销毁公告广告
        this.setBottomAd(true, true, 3) // 竖翻扉页、插页广告页都出固底广告-固底广告

        setTimeout(() => {
          // 切竖翻章节首页-出激励视频广告
          const vPage = this.getCurentPageNum()
          if (vPage === 1) {
            this.setRewardAdCP('vPageMode', 0)
          }
        }, 300)
      }

      // 切横翻
      if (mode === PAGE_CHANGE_MODE.HORIZONTAL) {
        this.setScrollY(0) // 重置 scrollY
        this.resetAllChapter('pageMode') // 切横翻

        // 重置组件，传三章数据去渲染
        this.hpIndex = isBookFeiye ? -1 : 'progress_pagemode' // 切到扉页传 -1
        this.outHcpList = this.getResetChapter(this.ccid, true)
        this.pageChangeMode = mode;
        this.setProgressTime() // 横翻 loading 不需要加延时

        if (!this.inRewardDuration) {
          if (this.isFirstChapter) { // 切横翻，扉页，需要隐藏固底广告
            this.setBottomAd(false, false, 4)
          } else {
            this.isHFeiye = false // 非扉页
            this.closeBanner() // 切横翻，非扉页，关闭公告广告
          }
        }
      }

      this.handleOnbroading()
    },
    showCatalog() { // 打开目录
      this.isShowTool = false
      this.renderCatalog = true
      this.$nextTick(() => {
        this.isShowCatalog = true
      })
    },
    closeCatalog(admin = true) { // 关闭目录
      this.isShowCatalog = false
      this.isHideCatalog = admin // 目录收起动效
      this.setTimer(() => {
        this.renderCatalog = false
      }, admin ? 250 : 0)
    },
    openBookDetail() { // 打开-书籍详情页
      this.renderBookDetail = true
      this.showBookDetail = true
      this.$nextTick(() => {
        this.closeCatalog()
      })
    },
    closeBookDetail() { // 关闭-书籍详情页
      this.showBookDetail = false
      setTimeout(() => { // 关闭动效完成后销毁
        this.renderBookDetail = false
      }, 200)
    },

    // 页数
    changePage(page, isInAd) { // 左右模式有翻页操作（不包括进入页面的第1页）-横翻
      totalPagesH += 1; // 翻页数+1
      contentPage = page // 内容页数
      this.isAdPage = isInAd // 判断当前页是否是插页广告
      this.setCacheProgress() // 清空 resize 缓存的进度数据
      // console.log(333, 'changePage', this.chapter.title, page);

      // 第1章扉页切换
      if (this.chapterIndex <= 1) {
        if (page === 1) { // 翻到扉页隐藏固底-固底广告
          this.setBottomAd(false, true, 2)
        } else if (page === 2) { // 从扉页翻到第2页打开公告页-公告广告
          this.showBanner(true)
        }
      }
      // 触发了两次翻页，关闭异常公告，兜底措施-公告广告
      if (this.shouldLoadBannerAd) {
        if ((this.chapterIndex <= 1 && totalPagesH > 1) || (this.chapterIndex > 1 && totalPagesH > 0)) {
          console.log('关闭异常公告')
          this.closeBanner()
        }
      }

      // 翻了1页开始-阅读时长计时
      if (!this.stayTime.objInterval) {
        this.reportStayTime(0);
      }

      // 每次翻页就触发-数据上报
      this.logChangePage(page)

      // 同步阅读进度
      this.addReadProgress({ page, type: 'horizontal', caseType: READ_PROGRESS_CAUSE.SWIPER });
    },
    logChangePage(page) { // 翻页数据上报
      // console.log('logChangePage', page);
      if (page > 0) {
        report('reader_Flip_clicked', {
          pdid: this.reportPdid,
          chap_no: this.ccid,
          pages: page // 每章内容的第几页
        })

        // 激励下载广告
        if (this.downAdConfig) {
          // 竖翻出管理栏
          if (this.pageMode.isVertical) {
            this.$store.commit('adConfig/setDownAdBar', { type: 'all' })
          }
          // 超过5分钟弹出气泡提醒
          if (this.downAdBar.type === 'open') {
            if (downDelay) {
              downDelay = false
              this.showDownBubble()
            }
            if (!downTimer) { // 提示只出一次
              downTimer = setTimeout(() => {
                if (this.downAdBar.type === 'open') {
                  this.showDownBubble()
                } else {
                  downDelay = true // 插页广告页延迟出提示弹框
                }
              }, 5 * 60 * 1000)
            }
          }
        }
      }
    },
    setFeiyeH(bool) { // 设置是否扉页-横翻
      this.isHFeiye = this.pageMode.isHorizontal && bool
    },
    getCurPage() { // 获取当前页是在章节的第几页
      this.curPage = this.getCurentPageNum()
    },
    getCurentPageNum() { // 获取当前章节的页数
      if (!this.chapter) {
        return 0
      }
      if (this.pageMode.isVertical) {
        const chapterRef = this.$refs[`vChapter-${this.ccid}`];
        if (chapterRef && chapterRef.length) {
          let scrollY = this.scrollY
          if (scrollY <= 0) {
            scrollY = this.getScrollTop()
            this.scrollY = scrollY // 更新 scrollY
          }
          const offsetY = scrollY - chapterRef[0].$el.offsetTop;
          return Math.floor(offsetY / this.clientHeight) + 1;
        }
      } else if (this.$refs.hChapter) {
        return this.$refs.hChapter.curPage
      }
      return 0
    },
    getCurrentOffsetY() { // 获取当前章滚动的距离-竖翻
      if (!this.chapter) {
        return 0;
      }
      const chapterRef = this.$refs[`vChapter-${this.ccid}`]
      if (chapterRef && chapterRef.length) {
        const scrollTop = this.getScrollTop()
        return Math.max(scrollTop - chapterRef[0].$el.offsetTop, 0) // 扉页未切章则记录为 0
      }
      return 0;
    },
    getTotalReadPage() { // 获取书籍总的阅读页数
      const sliderPage = Math.floor(slideDistance / this.clientHeight)
      return totalPagesH + sliderPage
    },

    // 公告广告
    showBanner(bool) { // 打开
      console.log('公告广告-展示')
      if (!this.shouldLoadBannerAd) {
        console.log('公告广告-无公告直接关闭')
        return this.closeBanner()
      }
      if (this.bannerAdFail) { // 广告请求失败
        console.log('公告广告-广告请求失败直接关闭')
        this.bannerAdFail = false
        return this.closeBanner()
      }
      if (this.showBannerAd) {
        console.log('公告广告-公告已是展示状态')
        return
      }

      this.showBannerAd = true
      this.isReqBottomAd = true
      this.isFeiyebanner = bool
      setTimeout(() => {
        this.$store.commit('adConfig/setShowBanner', true)
        setBannerCache(this.bannerAdConfig) // 延迟设置缓存
      }, 100)
      report('reader_announcement_page_shown', { ext1: 1 })
    },
    closeBanner() { // 关闭
      const hasShow = this.showBannerAd
      this.showBannerAd = false
      this.closeBannerAd = true

      // 关闭公告出-进页面自动加书架
      if (hasShow) {
        this.isAutoBookBar()
      }

      // 关闭前展示固底
      this.setBottomAd(true, true, 5)
      this.$nextTick(() => {
        this.isReqBottomAd = true
        this.$store.commit('adConfig/setShowBanner', true)
      })
    },
    bannerAdError() { // 请求失败
      this.bannerAdFail = true
    },
    touchRead() { // 内容页面被触摸，关闭公告页。解决手势脱离屏幕后公告页不复位问题。
      if (this.showBannerAd) {
        this.isTouchRead = false
        setTimeout(() => {
          this.isTouchRead = true
        }, 50)
      }
    },
    // 热启广告
    renderHotAd(status, isFeiye) {
      if (status === 'hide') {
        // 热启广告、公告页、插页广告页等场景不出热启广告
        if (!this.shouldLoadHotAd && !this.shouldLoadBannerAd && !this.isAdPage) {
          this.hotAdtime = new Date() * 1
        }
        return
      }

      if (status === 'visible' && this.hotAdtime) {
        const dif = new Date() * 1 - this.hotAdtime
        this.hotAdtime = 0

        // 章节免广、激励免广、无插页广告配置、无阅文配置、url 开关未开-不出热启广告
        if (this.isFreeAd || this.inRewardDuration || !this.novelInsideAdConfig || !this.bannerAdConfig || !this.functionSwitch.isShowBannerAd) {
          return false
        }
        // 无书籍、扉页、竖翻-不出热启广告
        if (!this.chapter || isFeiye) {
          return false
        }
        // 目录、书籍弹窗、浅度推书弹窗、深度推书弹窗、加书架弹窗、激励下载弹窗-不出热启广告
        if (this.isShowCatalog || this.showBookDetail || this.showBookDialog || this.showDeepBookDialog || this.showAddShelf || this.showDialog) {
          return false
        }
        // 切后台超过 30s 才能出
        console.log(`热启广告出现时间差：${dif / 1000}`)
        if (dif / 1000 <= 30) {
          return false
        }
        // 每天最大展示次数、最小展示间隙控制
        if (!canShowBanner(this.bannerAdConfig)) {
          return false
        }
        this.showHotAd()
      }
    },
    showHotAd() {
      this.isFeiyebanner = false
      this.shouldLoadHotAd = true
      this.$nextTick(() => {
        this.showBannerAd = true
      })
      this.setBottomAd(false, false, 6)
      setBannerCache(this.bannerAdConfig)
      report('reader_announcement_page_shown', { ext1: 2 })
    },
    closeHotAd() { // 关闭
      this.shouldLoadHotAd = false
      this.showBannerAd = false
      this.setBottomAd(true, false, 7)
    },

    // 固底广告控制
    setBottomAd(show, anima, t) {
      let objControl = { show }
      if (!anima) {
        objControl = { ...objControl, anima }
      }
      // 横翻最后（5 关闭公告，7 关闭热启动）一页不出固底
      if (this.pageMode.isHorizontal && this.isLastPage && [5, 7].includes(t)) {
        objControl = { ...objControl, show: false }
      }

      console.log('固底广告控制', objControl, t)
      this.$store.commit('adConfig/setBottomAdOpen', objControl)
    },
    // 固底广告-多广告位新请求
    changeBootomAd() { // 渲染切换
      if (!this.showNewBottomAd1) { // 广告1渲染后隐藏
        this.newBottomAdType = 2
        this.showNewBottomAd1 = true
        console.log(`固底多广告位请求-新广告1渲染后隐藏`)
        return
      }
      if (!this.showNewBottomAd2) { // 广告2渲染后隐藏
        this.newBottomAdType = 1
        this.showNewBottomAd2 = true
        console.log(`固底多广告位请求-新广告2渲染后隐藏`)
      }
    },
    changeBootomAdType(bool) { // 显示切换
      if (this.showNewBottomAd1 && this.showNewBottomAd2) {
        // 免广章节处理、隐藏状态处理-显示的时候
        let objControl = { extra: true, anima: false }
        if (bool && this.isFreeAd) { // 防止广告中突然冒出来
          objControl = { ...objControl, show: false }
        }
        // console.log(333, 'changeBootomAdType', objControl)
        this.$store.commit('adConfig/setBottomAdOpen', objControl)

        // 广告显隐
        if (this.newBottomAdType === 1) {
          if (bool) { // 成功则显示广告2，销毁广告1
            this.newBottomAdType = 2
            this.$nextTick(() => {
              this.showNewBottomAd1 = false
              console.log(`固底多广告位请求-成功显示新广告2，销毁旧广告1`)
            })
          } else { // 失败销毁广告2
            this.showNewBottomAd2 = false
            console.log(`固底多广告位请求-失败销毁新广告2`)
          }
        } else if (this.newBottomAdType === 2) {
          if (bool) { // 成功则显示广告1，销毁广告2
            this.newBottomAdType = 1
            this.$nextTick(() => {
              this.showNewBottomAd2 = false
              console.log(`固底多广告位请求-成功显示新广告1，销毁旧广告2`)
            })
          } else { // 失败销毁广告1
            this.showNewBottomAd1 = false
            console.log(`固底多广告位请求-失败销毁新广告1`)
          }
        }
      }
    },

    // 激励下载广告
    setDownDialog(option) { // 打开弹窗
      console.log(999, 111, this.renderRewardAdDialog, this.rewardDialogIng, option)
      // 如果章首激励弹窗先出，此时源头广告被销毁的权益领取弹窗不再出-章首激励弹窗和权益领取弹窗互斥
      if (option && option.destroy) {
        if (this.renderRewardAdDialog || this.rewardDialogIng) {
          this.destroyDownDialog = false
          return
        }
      }
      if (option && option.showDialog) {
        this.renderDialog = true
        this.dialogType = option.dialogType // 放外面立马生效
        this.adReportType = option.adReportType || ''
        if (option.destroy) {
          this.destroyDownDialog = true
        }
        this.$nextTick(() => {
          this.downAdData = option.adData
          this.showDialog = true
          // 获取权益后处理
          if (option.dialogType === 'start') {
            this.$store.commit('adConfig/setDownAdBar', { type: 'reward' }) // 出管理栏
          }
        })
      }
    },
    getReward(adData) { // 权益发放
      const adFreeInfo = {
        adData,
        blockType: HWAD_TYPE.DOWNAD,
        rewardTime: this.downAdConfig.time,
        reason: 2,
      }
      this.handleReward('downAd', adFreeInfo)
    },
    handleReward(type, adFreeInfo) { // 触发横竖翻组件获取激励
      if (this.pageMode.isHorizontal) { // 横翻
        this.$refs.hChapter.onReward(type, adFreeInfo)
      } else { // 竖翻
        const chapterRef = this.$refs[`vChapter-${this.ccid}`];
        if (chapterRef && chapterRef.length) {
          chapterRef[0].onReward(type, adFreeInfo)
        }
      }
    },
    getDownAdOpen() { // 是否有已下载完的广告
      if (this.downAdDatas.length > 0) {
        const downAdDatas = this.downAdDatas.filter(val => val.button.status === APP_STATUS.INSTALLED)
        if (downAdDatas.length > 0) {
          return downAdDatas
        }
      }
    },
    closeDownDialog(type, adData) { // 关闭弹窗
      switch (type) {
        case 'skip': // 跳过翻页-无需关闭、解锁、跳过
          this.closeDownAdDialog(false, true, true)
          break;
        case 'open': // 权益领取弹窗-关闭、解锁、跳过
          this.closeDownAdDialog(true, true, true)
          break;
        case 'start': // 权益已开启弹窗-关闭、解锁
          this.closeDownAdDialog(true, true)
          break;
        case 'auto': // 权益自动领取弹窗-关闭
        case 'active': // 权益生效中弹窗-关闭
        case 'list': // 应用提示弹窗-关闭
          this.closeDownAdDialog(true)
          break;
        case 'out': // 退出拦截弹窗-退出
          this.goBack()
          break;
        case 'reward': { // 获取免广权益
          this.closeDownAdDialog(false, true)
          this.getReward(adData)
          break;
        }
      }
    },
    closeDownAdDialog(close = false, unlock = false, skip = false) {
      if (unlock) { // 解除锁定状态
        window.$config.downLockCcid = ''
        this.$store.commit('adConfig/setControlLockAd', { lockDownIng: false })
      }
      if (close) { // 关闭弹窗
        this.destroyDownDialog = true
        this.showDialog = false
        this.dialogType = ''
        this.downAdData = null
        this.adReportType = ''
        this.renderDialog = false // 不要动效立即关闭
        // setTimeout(() => { // van-overlay 动画时间 300ms
        //   this.renderDialog = false
        // }, 300)
      }
      if (skip) { // 自动翻页
        this.$refs.hChapter.onAdSkip()
      }
    },
    clearDownBubble() { // 关闭提示弹框
      clearTimeout(downTimer)
      downTimer = null
      downDelay = false
    },
    showDownBubble() { // 出提示弹框
      this.$store.commit('adConfig/setDownAdBar', { bubble: true })
      setTimeout(() => { // 5s后自动关闭
        this.$store.commit('adConfig/setDownAdBar', { bubble: false })
      }, 5 * 1000)
    },

    // 章首激励视频广告
    setHPageCur(params) { // 页数变化-横翻
      const { type, page, lastPage } = params
      const isSwitchChapter = (type.includes('switchChapter') || type === 'prevNext') && page > 0
      if (!isSwitchChapter) { // 非切章只切换页
        this.setRewardAdCP('setHPageCur', 0, page)
      }
      // 是否是最后一章最后一页
      this.isLastPage = lastPage
    },
    setRewardAdCP(type = '', num, page = 0) { // 出激励视频广告
      // console.log(555, 'setRewardAdCP', type)
      if (!this.rewardAdCpConfig) {
        return
      }
      // 1个循环内执行1次、初始化未完成不执行
      if (this.showRewardAdTag || window.$config.loadIng <= 1) {
        return
      }
      // 限制-机器阅读数据
      const { timeConfig, pageConfig } = this.rewardAdCpConfig
      let canNext = true
      if (timeConfig || pageConfig) {
        canNext = false
      }
      if (timeConfig && readTimes >= timeConfig * 60) { // 阅读时间限制
        canNext = true
        if (this.swiperCpNum === 0) { // 补回进页面的章节切换计算次数
          this.swiperCpNum = 1
        }
      }
      if (pageConfig) { // 阅读页数限制
        const theTotalPage = readPages + this.getTotalReadPage()
        if (theTotalPage >= pageConfig) {
          canNext = true
          if (this.swiperCpNum === 0) { // 补回进页面的章节切换计算次数
            this.swiperCpNum = 1
          }
        }
      }
      if (!canNext) {
        return
      }

      // 切章触发场景：进页面、手动切章、横翻切章、竖翻切章
      if (num > 0) {
        this.swiperCpNum += 1
        this.hasRewardAdDialog = false
      }
      console.log(333, '出激励视频广告1', type, this.swiperCpNum)

      // 免广时间、免广章节关闭
      if (this.inRewardDuration || this.isFreeAd) {
        return this.closeRewardAll()
      }
      // 横竖翻模式切换非第1章出
      const pageMode = type === 'setPageMode' && !this.isFirstChapter
      // 横竖翻下章节手动切换出
      const prevNext = type === 'toPrevNext'
      if (pageMode || prevNext) {
        return this.showRewardAdCP()
      }

      // 翻页触发场景：横竖翻切换、页数变化
      this.getCurPage()
      const theFeiye = this.inBookFeiye
      const thePage  = page || this.curPage
      // 扉页不出
      if (theFeiye) {
        return this.closeRewardAll()
      }
      // 横翻第1章 curPage===2 出
      const hFirst2 = this.pageMode.isHorizontal && this.isFirstChapter && this.curPage === 2
       // 竖翻切章 thePage===0 出
      const vFirst0 = type === 'sliderChapterChange' && !this.isFirstChapter && thePage === 0
      if (thePage === 1 || hFirst2 || vFirst0) {
        return this.showRewardAdCP()
      }
      this.closeRewardAll()
    },
    showRewardAdCP() { // 显示广告
      this.showRewardAdTag = true
      this.$nextTick(() => {
        this.showRewardAdTag = false
      })

      const rewardAd = getRewardAdCP(this.rewardAdCpConfig, this.swiperCpNum)
      console.log(333, '出激励视频广告3', rewardAd)
      if (rewardAd === 'dialog' && !this.hasRewardAdDialog) { // 章首弹窗激励视频
        console.log(999, 222, this.destroyDownDialog)
        // 如果源头广告被销毁的权益领取弹窗先出，需要关闭-章首激励弹窗和权益领取弹窗互斥
        if (this.destroyDownDialog) {
          this.closeDownDialog('auto')
        }
        this.rewardDialogIng = true
        if (this.pageMode.isVertical) { // 延迟出弹窗防止出现后瞬间又消失-竖翻
          clearTimeout(this.rewardAdCpDialogTimer)
          this.rewardAdCpDialogTimer = setTimeout(() => {
            this.showRewardDialog()
          }, 300)
        } else {
          this.showRewardDialog()
        }
      } else if (rewardAd === 'bottom') { // 章首固底激励视频
        this.closeRewardDialog() // 出固底同时关闭弹窗
        this.setRewardBottom(true)
      } else {
        this.closeRewardAll()
      }
    },
    showRewardDialog() { // 显示-章首弹窗激励视频
      this.setRewardBottom(false) // 出弹窗同时关闭固底
      this.hasRewardAdDialog = true // 控制 swiperCpNum 未变更前，1章出1次
      this.renderRewardAdDialog = true
      this.$nextTick(() => {
        this.rewardAdDialog = true
      })
    },
    closeRewardDialog() { // 关闭-章首弹窗激励视频
      // 解锁页面-竖翻
      if (this.pageMode.isVertical) {
        clearTimeout(this.rewardAdCpDialogTimer)
      }

      const hasShow = this.renderRewardAdDialog
      this.rewardDialogIng = false
      this.renderRewardAdDialog = false
      this.rewardAdDialog = false

      // 关闭章首弹窗激励出-进页面自动加书架
      if (hasShow) {
        this.isAutoBookBar()
      }
    },
    setRewardBottom(bool) { // 开关-章首固底激励视频
      /* if (bool) {
        // 先销毁再出现，以正确计数
        this.rewardAdBottom = false
        setTimeout(() => {
          this.rewardAdBottom = true
        }, 50)
      } else {
        this.rewardAdBottom = false
      } */
      this.rewardAdBottom = bool
    },
    closeRewardAll() { // 关闭-章首弹窗、固底激励视频
      this.setRewardBottom(false)
      this.closeRewardDialog()
    },

    // 新手指引
    handleOnbroading() { // 判断是否展示新手引导
      const { vertical, horizontal } = readCacheData.getShowOnbroading();
      if (this.pageMode.isVertical && !vertical) {
        this.setOnboarding(true)
        readCacheData.setShowOnbroading({ horizontal, vertical: true });
      }
      if (this.pageMode.isHorizontal && !horizontal) {
        this.setOnboarding(true)
        readCacheData.setShowOnbroading({ horizontal: true, vertical });
      }
    },
    setOnboarding(bool) { // 设置显、隐状态
      if (bool) {
        this.renderOnboarding = bool
        this.$nextTick(() => {
          this.showOnboarding = bool
        })
        report('reader_NewGuide_shown')
      } else { // 关闭新手指引
        this.showOnboarding = bool
        setTimeout(() => { // van-overlay 动画时间 300ms
          this.renderOnboarding = bool
          // 关闭新手指引出-进页面自动加书架
          this.isAutoBookBar()
        }, 300)
        report('reader_NewGuide_clicked')
      }
    },

    // 加书架弹窗
    async confirmAddBookShelf() { //  确认加入书架
      report('reader_saveAddshelf_confirm_clicked', { ext1: 0 });
      this.setBookShelf(false);
      try {
        const result = await this.goAddBookShelf();
        if (result) {
          this.goBack();
        }
      } catch (err) {
        console.log('confirmAddBookShelf', err);
      }
    },
    cancelAddBookShelf() { // 取消加入书架
      report('reader_saveAddshelf_cancel_clicked', { ext1: 0 });
      this.setBookShelf(false);
      this.goBack();
    },
    setBookShelf(bool) { // 设置加书架弹窗显、隐状态
      if (bool) {
        this.renderAddShelf = bool
        this.$nextTick(() => {
          this.showAddShelf = bool
        })
        report('reader_saveAddshelf_shown', { ext1: 0 });
      } else {
        this.showAddShelf = bool
        setTimeout(() => { // van-overlay 动画时间 300ms
          this.renderAddShelf = bool
        }, 300)
      }
    },
    async goAddBookShelf(type = '') { // 加入书架
      if (this.subscribing) {
        return false
      }
      let success
      try {
        this.subscribing = true
        await jsbridge.call('subscribeEBook', this.hwbid)
        success = true
        this.isInBookShelf = 1
        if (!type) {
          toast('已加入书架')
        }

        report('reader_addshelf_success', { pdid: this.reportPdid })
      } catch (err) {
        success = false
        if (!type) {
          toast('加入书架失败')
        }
      }
      this.subscribing = false
      return success
    },
    async cancelBookShelf(cb) { // 撤销已加书架
      if (this.cancelBookShelfIng) {
        return false
      }
      try {
        this.cancelBookShelfIng = true
        await jsbridge.call('subscribeEBook', this.hwbid, '0')
        this.isInBookShelf = 0
        cb && cb()
        toast('加入书架已撤销')
      } catch (err) {
        toast('撤销失败')
      }
      this.cancelBookShelfIng = false
    },
    // 加书架提示条
    isShowAddBookBar() { // 翻页自动加书架
      // 菜单栏自动加书架已关闭、只弹 1 次
      if (this.autoAddBook < 1 || this.showAddBookBarNum >= 1) {
        return
      }

      // url popBfWin 配大于 0，阅读满 x 页
      const theReadPage = this.getTotalReadPage()
      const thePopBfWin = theReadPage - popBfWinPage >= this.globalData.popBfWin
      if (this.globalData.popBfWin > 0 && thePopBfWin) { // 阅读满 popBfWin 页
        this.showAddBook(() => {
          popBfWinPage = theReadPage
        })
      }
    },
    isAutoBookBar() { // 进页面自动加书架
      // 菜单栏自动加书架已关闭、只弹 1 次
      if (this.initChapter <= 0 || this.autoAddBook < 1 || this.showAddBookBarNum >= 1) {
        return
      }

      // url popBfWin 配 -1 打开，横竖翻扉页、公告页、章首激励弹窗、新手引导图不出
      const theHide = this.inBookFeiye || this.showBannerAd || this.renderRewardAdDialog || this.renderOnboarding
      if (this.globalData.popBfWin === -1 && !theHide) {
        this.showAddBook()
      }
    },
    async showAddBook(cb) { // 加书架 && 弹出加书架条
      // 如果不在书架 && 书籍未下架
      if (!this.isInBookShelf && !this.isOffline) {
        cb && cb()
        this.showAddBookBarNum += 1

        try {
          await this.goAddBookShelf('auto')
          this.$nextTick(() => { // 渲染后延迟1帧再出现，否则没动效
            this.showAddBookBarState = 1
            report('reader_addShelf_banner_shown', { chap_no: this.ccid })
          })
        } catch (error) {
          console.log('自动加书架失败：', error);
          this.showAddBookBarNum = 0
        }
      }
    },
    cancelAddBook() { // 撤销加书架
      this.cancelBookShelf(() => {
        this.isCancelAddBookBar = true
        this.hideAddBookBar()
        report('reader_addShelf_banner_clicked', { chap_no: this.ccid })
      })
    },
    hideAddBookBar() { // 隐藏加书架条
      this.showAddBookBarState = 2
    },

    // 浅度推书弹窗
    openBookDialog(readDuration) { // 打开推书弹窗
      // 一个生命周期只弹 1 次
      if (this.showBookDialogCount >= 1) {
        return false
      }
      const { show } = getBookDialogShow(this.bookUserConfig, readDuration)
      if (show) {
        this.showBookDialog = true
        this.showBookDialogCount += 1
        return true
      }
      return false
    },
    // 深度推书弹窗
    openDeepBookDialog() { // 打开推书弹窗
      // 一个生命周期只弹 1 次
      if (this.showDeepBookDialogCount >= 1) {
        return false
      }
      // 获取深度阅读推荐书弹窗配置
      const showDeepBookDialog = getDeepBookDialogShow(this.hasDeepBooks, this.deepBooksConfig, readTimesBook, this.cbid)
      if (showDeepBookDialog) {
        this.showDeepBookDialog = true
        this.showDeepBookDialogCount += 1
        return true
      }
      return false
    },
    onCancelBookDialog() { // 确定退出
      this.goBack()
    },
    onLeaveBook() { // 离开推荐弹窗进入另一本书
      this.beforeUnload()
      jsbridge.call('offBack', this.onBackCallbackFn)
    },

    // 退出以及阅读上报
    goBackCallback(immediate) { // 顶部导航返回书城
      report('reader_return_clicked', { pdid: this.reportPdid, chap_no: this.ccid });
      if (!this.chapter) {
        return this.back(immediate)
      }
      // 手势返回如果打开目录，则关闭目录
      if (this.isShowCatalog) {
        this.closeCatalog()
        return [{ eventIntercept: true }];
      }
      // 手势返回如果打开了书籍详情页，则关闭书籍详情页
      if (this.showBookDetail) {
        this.closeBookDetail()
        return [{ eventIntercept: true }];
      }
      // 多次触发退出：如果已弹出加书架弹窗 || 浅度推书弹窗 || 深度推书弹窗 || 激励下载广告拦截弹窗，则直接退出
      if (this.showAddShelf || this.showBookDialog || this.showDeepBookDialog || this.showDialog) {
        return this.back()
      }
      // 公告页直接退出-公告广告
      if (this.showBannerAd) {
        return this.back(immediate)
      }

      // 打开拦截弹窗-激励下载广告
      const downAdDatas = this.getDownAdOpen()
      if (downAdDatas) {
        this.setDownDialog({
          showDialog: true, // 弹窗弹出
          dialogType: 'out', // 退出拦截弹窗
          adData: downAdDatas, // 广告数据
        })
        return [{ eventIntercept: true }]
      }

      const now = new Date().getTime();
      const readDuration = this.stayTime.totalDuration + Math.floor((now - this.stayTime.lastTime) / 1000);
      // 如果不在书架 && 阅读时长超过10s && 书籍未下架 && 未点击撤销加书架 - 弹出加书架弹窗
      if (!this.isInBookShelf && readDuration >= 10 && !this.isOffline && !this.isCancelAddBookBar) {
        this.setBookShelf(true)
        return [{ eventIntercept: true }]
      }

      // 推书弹窗
      if (!this.functionSwitch.isShowBookDialog) { // url 开关未打开
        return this.back(immediate)
      }
      // 打开浅度推书弹窗
      if (this.openBookDialog(readDuration)) {
        return [{ eventIntercept: true }]
      }
      // 打开深度推书弹窗
      if (this.openDeepBookDialog()) {
        return [{ eventIntercept: true }]
      }

      return this.back(immediate)
    },
    back(immediate) {
      if (immediate === 1) {
        this.goBack();
      } else {
        if (this.chapter) {
          this.beforeUnload()
        }
        jsbridge.call('offBack', this.onBackCallbackFn);
        return [{ eventIntercept: false }];
      }
    },
    goBack() { // 确定真的退出阅读器
      if (this.chapter) {
        this.beforeUnload()
      }
      jsbridge.call('offBack', this.onBackCallbackFn)
      jsbridge.call('goBack')
    },
    beforeUnload() { // 离开阅读器之前执行的事件
      // 上报阅读进度
      try {
        const type = this.pageMode.isVertical ? 'vertical' : 'horizontal'
        this.addReadProgress({ type, caseType: READ_PROGRESS_CAUSE.EXIT });
      } catch (err) {
        console.log(err);
      }
      // 上报阅读时长
      this.reportStayTime(3)

      // 设置缓存-机器阅读数据
      this.setReadData()
      // 设置缓存-书籍阅读数据
      this.setBookData()

      // 离开阅读器之前-上报全部数据
      setTimeout(() => {
        report(null)
      }, 0)
    },
    getReadData(isBook) { // 获取阅读缓存数据-机器、书籍
      let theReadCacheData = null
      if (isBook) { // 书籍阅读数据
        const bookCacheData = getBookCacheData() || {}
        const caheBook = bookCacheData[this.cbid]
        if (caheBook) {
          theReadCacheData = caheBook
        }
      } else { // 机器阅读数据
        theReadCacheData = getReadCacheData()
      }
      const { hasCache, before4, cacheTimes, cachePages, cacheEndTime } = getBookReadCache(theReadCacheData)

      if (isBook) {
        readTimesBook = cacheTimes || readTimesBook
        readEndTimeBook = cacheEndTime || readEndTimeBook

        if (before4) {
          const { readTime } = theReadCacheData
          this.userBookCacheData = { readTime }
        }
        if (!hasCache) {
          this.setBookData()
        }

        // 关闭骨架屏开始阅读计时，目前限制条件：打开并配置深度推书弹窗
        if (this.isDeepBookDialog) {
          this.setReadTime(true)
        }
      } else {
        readTimes = cacheTimes || readTimes
        readPages = cachePages || readPages
        readEndTime = cacheEndTime || readEndTime

        if (before4) {
          const { readTime, readPage } = theReadCacheData
          this.userReadCacheData = { readTime, readPage }
        }
        if (!hasCache) {
          this.setReadData('init')
        }

        // 关闭骨架屏开始阅读计时，目前限制条件：章首激励视频广告配置(timeConfig)
        const isTimeConfig = this.rewardAdCpConfig && this.rewardAdCpConfig.timeConfig
        if (isTimeConfig) {
          this.setReadTime(false)
        }
      }
    },
    setReadTime(isBook) { // 计时器-机器、书籍阅读数据
      if (isBook) { // 书籍阅读数据
        clearInterval(readTimerBook)
        readTimerBook = setTimeout(() => {
          readTimesBook += 1
          this.setReadTime(isBook)

          // 请求书籍-深度推书弹窗
          if (!this.shouldGetDeepBook) {
            const { bookReadTime, bookSpanReadTime, bookDayCount } = this.deepBooksConfig[0]
            if (readTimesBook >= bookReadTime * 60) {
              // 是否出深度弹窗
              const show = isDeepBookDialogShow(this.cbid, bookDayCount, bookSpanReadTime, false)
              if (show) {
                this.shouldGetDeepBook = true
              }
            }
          }
        }, 1000)
      } else { // 机器阅读数据
        clearInterval(readTimer)
        readTimer = setTimeout(() => {
          readTimes += 1
          this.setReadTime(isBook)
        }, 1000)
      }
    },
    setReadData(type) { // 设置缓存-机器阅读数据
      if (type !== 'init') {
        readPages = readPages + this.getTotalReadPage()
      }

      // 凌晨3点阅读到凌晨5点，退出的时候去掉3点获取的缓存
      if (this.userReadCacheData && new Date().getHours() >= 4) {
        const { readTime, readPage } = this.userReadCacheData
        readTimes -= readTime
        readPages -= readPage
        readEndTime = 0
      }
      console.log('机器阅读数据-setReadData', new Date().getHours(), readEndTime)

      setReadCacheData({
        readTime: readTimes,
        readPage: readPages,
        endTime: readEndTime || getMidnight(),
      })
    },
    setBookData() { // 设置缓存-书籍阅读数据
      // 凌晨3点阅读到凌晨5点，退出的时候去掉3点获取的缓存
      if (this.userBookCacheData && new Date().getHours() >= 4) {
        const { readTime } = this.userBookCacheData
        readTimesBook -= readTime
        readEndTimeBook = 0
      }
      console.log('书籍阅读数据-setBookData', new Date().getHours(), readEndTimeBook)

      const bookCacheData = getBookCacheData() || {}
      const caheBook = bookCacheData[this.cbid]
      if (caheBook) {
        bookCacheData[this.cbid] = {
          ...caheBook,
          readTime: readTimesBook, // 阅读时长
          endTime: readEndTimeBook || getMidnight(), // 阅读时长有效截止时间
        }
      } else {
        bookCacheData[this.cbid] = {
          readTime: readTimesBook, // 阅读时长
          endTime: readEndTimeBook || getMidnight(), // 阅读时长有效截止时间
        }
      }
      setBookCacheData(bookCacheData)
    },
    logExitChapter(status) { // 记录用户退出阅读章节
      this.reportStayTime(status);
    },
    /**
     * 上报阅读时长
     * @param stayStatus 停留状态 (0=打开页面（打开一个新的章节）、1=进行中、2=跳出页面、3跳出页面未读完本章)
     * @param isUseNewStayId 是否使用新的停留id
     */
    reportStayTime(stayStatus) {
      const now = new Date().getTime();
      if (stayStatus === 0) {
        this.stayTime.duration = 0;
        this.stayTime.pages = 0;
      } else {
        // 最小值0，最大值30，兼容用户手动更改系统时间场景
        const duration = Math.max(Math.min(Math.floor((now - this.stayTime.lastTime) / 1000), 30), 0);
        const totalDuration = this.stayTime.totalDuration + duration;
        this.stayTime.isTail = stayStatus === 3 ? 0 : 1;
        this.stayTime.duration = duration;
        this.stayTime.totalDuration = totalDuration;
        this.stayTime.totalPages = this.getTotalReadPage()
        logReader(this.hwbid, this.chapter, this.stayTime, this.maxChapterIndex, totalChapterIds, this.globalData?.functionswitch) // 上报阅读时长事件
      }
      this.stayTime.lastTime = now;

      // 打开页面
      if (this.stayTime.objInterval) {
        clearTimeout(this.stayTime.objInterval);
        this.stayTime.objInterval = null;
      }
      if (stayStatus === 2 || stayStatus === 3) {
        return;
      }

      // 按照_stayTime.intervalTime自动上报
      this.stayTime.objInterval = setTimeout(() => {
        // 大于一个上报周期
        if (
          new Date().getTime() - this.stayTime.lastTime
          >= this.stayTime.intervalTime + 1000
        ) {
          this.reportStayTime(0);
        } else {
          this.reportStayTime(1);
        }
      }, this.stayTime.intervalTime);
    },
    reportLcp(entry) {
      jsbridge.commitPerformanceEvent({
        cause: 'init',
        cost: entry.startTime,
      });
    },
    commitPerformanceEvent() { // 上报性能指标
      // 计算lcp
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.reportEventFn(entry);
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      // 计算fcp上报
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            jsbridge.commitPerformanceEvent({
              cause: 'show',
              cost: entry.startTime,
            });
          }
        }
      }).observe({ type: 'paint', buffered: true });
    },
  },
};
</script>

<style lang="scss" scoped>
.chapter_vertical {
  position: relative;
}
</style>