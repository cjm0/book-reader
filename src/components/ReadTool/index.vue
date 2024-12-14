<template>
  <div class="readtool_index">
    <div
      :class="['tools', show && 'show', needAnim ? 'anim':'no-anim']"
      :style="{
        'background':theme.bg,
        'padding-bottom': `${navigationHeight}px`,
        'height': `${bootomBarHeight + navigationHeight}px`,
      }"
    >
      <div
        v-for="item in tools"
        :key="item.name"
        :class="[isHmArk ? 'is_hm_ark' : 'item', active === item.name && 'active']"
        @click="clickTool(item.name)"
      >
        <svg-icon
          v-if="theme.theme === 'dark'"
          :icon-class="(active === item.name) ? item.name_darkact :item.name_dark"
          class="icon"
        />
        <svg-icon
          v-else
          :icon-class="(active === item.name) ? item.name_act : item.name"
          class="icon"
          :style="{color: theme.activePaper}"
        />
        <span v-if="readUIConfig > 0">{{ item.name === 'mode' ? feedModeText : item.text }}</span>
      </div>
    </div>
    <Progress
      :show="active === 'progress'"
      :chapter="chapter"
      :clientResize="clientResize"
      @toPrev="toPrev"
      @toNext="toNext"
      @toOne="toOne"
    />
    <Setting
      :show="active === 'settings'"
      @setFontSize="setFontSize"
      @setPageMode="setPageMode"
    />
    <transition name="source_fade">
      <div
        v-show="showSource"
        class="source_wrap"
        :style="{
          'width': `${clientWidth - gap * 2}px`,
          'left': `${gap}px`,
          'bottom': `${bootomBarHeight + navigationHeight + 24 + (controlBottomAd.show ? 36 : 0)}px`,
        }"
      >
        <img
          class="source_img"
          :src="menuBarConfig.imgUrl"
          @contextmenu.prevent
          @click.stop="toLink"
        >
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { TOOL_BTNS, BOOTM_BAR_HEIGHT } from '@/constants';
import { getGap, getUserInfo } from '@/utils/helpers';
import { read as cacheData } from '@/utils/cacheData';
import jsbridge from '@/utils/jsbridge';
import { logUserBehavior } from '@/service';

export default {
  name: 'ReadTool',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    cbid: {
      type: String,
      default: '',
    },
    hwbid: {
      type: String,
      default: '',
    },
    chapter: {
      type: Object,
      default: null,
    },
    inBookFeiye: {
      type: Boolean,
      default: true,
    },
    clientWidth: { // 屏幕宽度
      type: Number,
      default: 0,
    },
    clientResize: { // 屏幕宽高发生变化
      type: Number,
      default: 0,
    },

    book: {
      type: Object,
      default: null,
    },
    needAnim: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    Progress: import('./Progress'),
    Setting: import('./Setting'),
  },
  data() {
    return {
      bootomBarHeight: BOOTM_BAR_HEIGHT,
      tools: TOOL_BTNS,
      active: '',
      showProgress: false,

      // reqLinkBook: false, // 标记获取过跳转书籍
      // linkBooks: [], // 跳转书籍元数据
      // linkBook: null, // 跳转书籍
    };
  },
  computed: {
    ...mapGetters(['theme', 'navigationHeight', 'feedDisplayMode', 'feedModeText', 'readUIConfig', 'menuBarConfig', 'controlBottomAd', 'isHmArk']),
    gap() {
      return getGap(this.clientWidth)
    },
    showSource() { // 有运营素材 && 菜单栏展示 && 非扉页 => 显示运营素材
      const { imgUrl, linkUrl, linkType } = this.menuBarConfig
      const source = imgUrl && this.show && !this.inBookFeiye
      if (source) {
        logUserBehavior({
          eventId: 'reader_menu_site_shown',
          eventCode: 'shown',
        })

        // 获取跳转书籍：控制只获取 1 次，跳转类型为 1
        if (!this.reqLinkBook && linkType === 1 && linkUrl) {
          this.getLinkBook()
        }
      }
      return source
    }
  },
  watch: {
    show() {
      this.active = '';
    },
  },

  methods: {
    clickTool(name) {
      if (name === 'list') { // 打开目录
        this.$emit('showCatalog');
        logUserBehavior({
          eventId: 'reader_menu_catalog_clicked',
          eventCode: 'clicked',
        });
      }
      if (name === 'mode') { // 夜间模式切换
        const isDay = this.feedDisplayMode === 'day';
        const theMode = isDay ? 'night' : 'day'
        // 先关闭底部二级菜单栏再切换夜间模式（延迟 200ms）因为有巨大色差会闪
        if (this.toolState > 0) {
          setTimeout(() => {
            this.$store.commit('theme/setFeedDisplayMode', theMode)
          }, 200)
        } else {
          this.$store.commit('theme/setFeedDisplayMode', theMode)
        }

        logUserBehavior({
          eventId: 'reader_menu_NightMode_clicked',
          eventCode: 'clicked',
          eventInfo: {
            ext1: isDay ? 2 : 1,
          },
        });
      }
      if (name === 'progress') { // 打开进度条
        this.toolState = 2
        // 尝试请求获取目录数据
        this.$store.dispatch('catalogList/getCatalogList', this.cbid)
        logUserBehavior({
          eventId: 'reader_menu_progress_clicked',
          eventCode: 'clicked',
        });
      }
      if (name === 'settings') { // 打开设置
        this.toolState = 3
        logUserBehavior({
          eventId: 'reader_menu_Set_clicked',
          eventCode: 'clicked',
        });
      }
      if (name === this.active) {
        this.active = ''
        this.toolState = 0
        return
      }
      this.active = name
    },
    toPrev(ccid) {
      this.$emit('toPrev', ccid, 'readTool');
    },
    toNext(ccid) {
      this.$emit('toNext', ccid, 'readTool');
    },
    toOne(ccid, cid) {
      this.$emit('toOne', ccid, cid, 'progress');
    },
    setFontSize(size) {
      this.$emit('setFontSize', size);
    },
    setPageMode(type) {
      this.$emit('setPageMode', type);
    },

    async getLinkBook() { // 获取跳转书籍数据
      const userInfo = await getUserInfo()
      const userId = userInfo.userId || ''
      const repId = String(new Date() * 1) + '_' + userId

      const linkBooks = await jsbridge.call('getReaderRecommendEBook', this.hwbid, '3', JSON.stringify({ bookLen: 1, repId }))
      if (linkBooks && linkBooks.length > 0) {
        this.linkBooks = linkBooks
        const transBooks = this.transBook(linkBooks)
        if (transBooks.length > 0) {
          this.linkBook = transBooks[0]
        }
      }
      this.reqLinkBook = true // 标记获取过跳转书籍
    },
    transBook(books) { // 书籍转换
      let arrBook = []
      books.forEach((val) => {
        const hwBookId = val?.ebookInfo?.hwBookId
        let clickLinkList = val?.action?.clickLinkList
        let clickLink = ''
        if (clickLinkList && clickLinkList.length > 0) {
          clickLinkList = clickLinkList.filter(v => v.type === '0')
          clickLink = clickLinkList?.[0]?.url
        }
        if (hwBookId !== this.hwbid && clickLink) { // 过滤掉当前书籍以及无 clickLink 书籍
          arrBook.push({
            hwBookId, // 华为书籍 id
            cbid: val.oriDocId, // 阅文书籍id
            link: clickLink,
          })
        }
      })
      return arrBook
    },
    toLink() { // 运营位素材跳转链接
      const { linkUrl, linkType } = this.menuBarConfig;
      if (linkUrl) {
        // 跳转类型：1-阅读器其他书籍、2-浏览器客户端链接、3-阅读器外h5
        switch (linkType) {
          case 1: // 跳阅读器其他书籍-直接跳转会有菜单栏
            // amis 配的 ccid 和后端返回的 ccid 一致才去跳，防止 amis 配置和后端配置生效时间不一致时跳错的问题
            if (this.linkBook && this.linkBook.cbid === linkUrl) {
              const eBook = this.linkBooks.filter(val => val.ebookInfo.hwBookId ===  this.linkBook.hwBookId)
              jsbridge.call('clickFeedsCard', eBook[0])
              location.replace(this.linkBook.link)
            }
            break;
          case 2: // 跳浏览器客户端链接-没问题
            location.href = linkUrl
            break;
          case 3: // 跳阅读器外h5-没问题
            // 跳出阅读器前恢复外部导航栏背景色
            if (this.theme.theme !== 'dark' && this.theme.theme > 1) {
              cacheData.setCacheBarTheme(this.theme.theme)
              jsbridge.call('setBackground', '1')
            }
            location.href = linkUrl
        }
        logUserBehavior({
          eventId: 'reader_menu_site_clicked',
          eventCode: 'clicked',
        })
      }
    }
  },
};
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
