<!--
 * @Description : 单书推荐弹窗 BookDialog
 * @Author      : chenjianmin
 * @Date        : 2023-05-17 15:02:43
-->
<template>
  <van-overlay
    :show="show"
    @click="onClickMask"
    z-index="1100"
    :custom-style="{'background-color': isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)'}"
  >
    <div :class="[isHmArk ? 'is_hm_ark': 'book_dialog', isDark && 'book_dialog_dark']" v-if="book">
      <div
        class="dialog"
        :style="{ backgroundColor: theme.bg}"
        @click.stop
      >
        <p class="close_btn" @click="onClose" v-if="!isHmArk">
          <svg-icon icon-class="close" class="close" />
        </p>
        <p class="tit">确定退出阅读吗 ？</p>
        <p class="desc">为您私人定制热门好书，试读一下</p>

        <template v-if="isBookOne">
          <div class="book_out" @click.stop="toRead">
            <div class="book_wrap">
              <BookCover :url="book.cover" :size="56"/>
              <div class="book_inner">
                <div>
                  <p class="book_tit">{{ book.name }}</p>
                  <p class="book_dot">{{ book.categoryName }}<span>·</span>{{ book.wordCount }}万字<span>·</span>{{ book.finished }}</p>
                </div>
                <p class="book_hot" v-if="book.cpExtInfo && book.cpExtInfo.randname">{{ book.cpExtInfo.randname }} {{ book.cpExtInfo.randId ? `Top ${book.cpExtInfo.randId}` : ''}}</p>
              </div>
              <p :class="['add_btn', book.isAddBook && 'add_btn_disable']" @click.stop="addBook" v-if="!book.subscribeInfo">{{ book.isAddBook ? '已添加' : '加书架'}}</p>
            </div>
            <div class="book_cont">{{ book.introduction }}</div>
          </div>
        </template>
        <template v-else>
          <div
            class="book_wrap2"
            @click.stop="toRead(item)"
            v-for="(item, index) in book"
            :key="item.hwBookId + index"
          >
            <BookCover :url="item.cover" :size="66"/>
            <div class="book_inner">
              <div>
                <p class="book_tit">{{ item.name }}</p>
                <p class="book_cont2">{{ item.introduction }}</p>
              </div>
              <p class="book_dot book_dot2">
                <span class="category_name">{{ item.categoryName }}</span>
                <span>·</span>{{ item.wordCount }}万字
                <span>·</span>{{ item.finished }}
              </p>
            </div>
            <p class="add_btn add_btn2" @click.stop="toRead(item)" v-if="item.subscribeInfo">去阅读</p>
            <p :class="['add_btn add_btn2', item.isAddBook && 'add_btn_disable']" @click.stop="addBook(item, index)" v-else>{{ item.isAddBook ? '已添加' : '加书架'}}</p>
          </div>
        </template>

        <div :class="['btn_wrap', isBookOne && 'btn_wrap_1']">
          <p class="btn cancel" @click="onCancel">确定退出</p>
          <span class="btn_line" v-if="!isHmArk"></span>
          <p :class="['btn', 'confirm', !isBookOne && transBooks.length <= 3 && 'btn_disable']" @click="onConfirm">{{ isBookOne ? '免费阅读' : '换一换'}}</p>
        </div>
      </div>
    </div>
  </van-overlay>
</template>

<script>
import BookCover from '@/components/BookCover';
import { mapGetters } from 'vuex';
import { logUserBehavior } from '@/service';
import { getUserInfo, toast } from '@/utils/helpers';
import { getBookDialog, setBookDialog } from '@/utils/cacheData';
import jsbridge from '@/utils/jsbridge';
import { getRecommendBooks } from '@/pages/read/read.js';
import { loginMixin } from '@/mixins/login';

export default {
  name: 'BookDialog',
  mixins: [loginMixin],
  components: {
    BookCover,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    hwbid: {
      type: String,
      default: '',
    },
    ccid: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      transBooks: [], // kit 获取到的推荐书籍
      book: null, // 当前展示书籍
      isBookOne: true, // 是否单本书
      // recommendBooks: [], // 推荐书籍原始数据
    }
  },
  computed: {
    ...mapGetters(['theme', 'booksConfig', 'isHmArk']),
    isDark() {
      return this.theme.theme === 'dark'
    },
  },
  watch: {
    show(visible) {
      if (visible) {
        this.report({
          eventId: 'reader_saveRecommend_shown',
          eventCode: 'shown',
        })
        this.report({
          eventId: 'reader_saveRecommend_bid_shown',
          eventCode: 'shown',
        })
      }
    },
    booksConfig: { // // 请求数据时机：已从后端服务获取推荐书配置
      handler(newVal) {
        if (newVal) {
          this.getBooks()
        }
      },
      immediate: true
    },
  },

  methods: {
    async getBooks() { // 获取 kit 书籍数据
      try {
        // 获取弹窗配置
        const userInfo = await getUserInfo()
        const userId = userInfo.userId || ''
        const bookConfig = this.getBookConfig(userId)
        if (!bookConfig) { // 如果没匹配上则无推荐弹窗
          console.log('浅度推书-未匹配', bookConfig);
          return
        }
        if (this.book) {
          console.log('浅度推书-已经有了', this.book);
          return
        }

        // 推荐书类型 1-单本 2-多本
        this.isBookOne = bookConfig.popShowbookType === 1

        // 从 kit 获取推荐书
        const result = await getRecommendBooks(this.hwbid, '1', this.isBookOne ? 3 : 20)
        if (result) {
          this.recommendBooks = result[0]
          if (result[1].length > 0) {
            this.getBook(result[1])
          }
        }

        this.$store.commit('adConfig/setBookUserConfig', {
          bookDialog: this.book ? 1 : 0,
          ...bookConfig,
        })
      } catch (error) {
        console.error('浅度推书-获取失败', error)
      }
    },
    getBookConfig(userId) { // 获取弹窗配置
      const last = userId.slice(userId.length - 1)
      let theConfig = null
      this.booksConfig.forEach((val) => {
        if (theConfig) { // 拿到了一个配置就停止
          return
        }
        if (val.popShowbookList.includes('all') || val.popShowbookList.includes(last)) {
          theConfig = val
        }
      })
      return theConfig
    },
    getBook(resultBooks) { // 获取展示书籍数据
      let books = resultBooks ? resultBooks : JSON.parse(JSON.stringify(this.transBooks))
      if (resultBooks) {
        this.transBooks = JSON.parse(JSON.stringify(books))
      }

      if (books.length > 0) {
        // 获取用过的书籍 id
        const nowTime = new Date() * 1
        let cacheBookIds = getBookDialog()
        if (cacheBookIds) {
          cacheBookIds = nowTime - cacheBookIds.time > 24 * 3600 * 1000 ? [] : cacheBookIds.bookIds
        } else {
          cacheBookIds = []
        }

        // 过滤掉用过的书籍
        let newBook = []
        if (cacheBookIds.length > 0) {
          newBook = books.filter(val => !cacheBookIds.includes(val.hwBookId))
        }

        // 获取当前使用的书籍
        if (this.isBookOne) {
          if (newBook.length > 0) {
            this.book = newBook[0]
          } else {  // 没有新书，用缓存的
            this.book = books[0]
            cacheBookIds = []
          }
        } else {
          const len = newBook.length
          if (len >= 3) {
            this.book = newBook.slice(0, 3)
          } else {  // 没有新书，用缓存的
            this.book = newBook.slice(0, len).concat(books.slice(0, 3 - len))
            if (len === 0) {
              cacheBookIds = []
            }
          }
        }

        // 缓存用过的书籍 id
        if (this.isBookOne) {
          cacheBookIds.push(this.book.hwBookId)
        } else {
          this.book.forEach(val => {
            cacheBookIds.push(val.hwBookId)
          })
        }
        setBookDialog({
          bookIds: cacheBookIds,
          time: nowTime
        })

        if (!resultBooks) {
          this.report({
            eventId: 'reader_saveRecommend_bid_shown',
            eventCode: 'shown',
          })
        }
      }
    },

    async addBook(item, index) { // 加书架
      try {
        await this.beforeAddShelfCheck();
      } catch (err) {
        console.log('当前状态未登录', err);
        return false;
      }
      const theBook = this.isBookOne ? this.book : item
      if (this.subscribing || theBook.isAddBook) {
        return false
      }

      try {
        this.subscribing = true
        const eBook = this.recommendBooks.filter(val => val.ebookInfo.hwBookId === theBook.hwBookId)
        await jsbridge.call('subscribeEBook', theBook.hwBookId, '1', eBook[0])
        if (this.isBookOne) { // 单本书
          this.book.isAddBook = true
        } else {
          this.book[index].isAddBook = true
        }
        // 修改数据状态为已加书架
        this.transBooks = this.transBooks.map(val => {
          if (val.hwBookId === theBook.hwBookId) {
            val.subscribeInfo = true
          }
          return val
        })

        this.report({
          eventId: 'reader_addshelf_success',
          eventCode: 'success',
        })
      } catch (err) {
        toast('加入书架失败')
        console.log('浅度推书-加书架失败', err);
      }
      this.subscribing = false
      this.report({
        eventId: 'reader_saveRecommend_add_clicked',
        eventCode: 'clicked',
      })
    },
    toRead(item) { // 跳另一本书
      this.report({
        eventId: 'reader_saveRecommend_read_clicked',
        eventCode: 'clicked',
      })
      this.$emit('onLeave') // 跳走前上报阅读时长

      const theBook = this.isBookOne ? this.book : item
      const eBook = this.recommendBooks.filter(val => val.ebookInfo.hwBookId === theBook.hwBookId)
      // 小说卡片点击时先调用此接口
      jsbridge.call('clickFeedsCard', eBook[0])
      window.location.replace(theBook.link)
    },
    onConfirm() { // 免费阅读 || 换一换
      // 免费阅读
      if (this.isBookOne) {
        this.toRead()
      }

      // 换一换
      if (!this.isBookOne && this.transBooks.length > 3) {
        this.getBook()
        this.report({
          eventId: 'reader_saveRecommend_change_clicked',
          eventCode: 'clicked',
        })
      }
    },
    onCancel() { // 确定退出
      this.report({
        eventId: 'reader_saveRecommend_exit_clicked',
        eventCode: 'clicked',
      })
      this.$emit('onCancel')
    },
    onClose() { // 关闭弹窗
      this.report({
        eventId: 'reader_saveRecommend_close_clicked',
        eventCode: 'clicked',
      })
      this.$emit('onClose')
    },
    onClickMask() { // 点击蒙版
      // 鸿蒙单框机
      if (this.isHmArk) {
        this.onClose()
      }
    },
    report(info) {
      logUserBehavior({
        ...info,
        eventInfo: {
          chap_no: this.ccid,
          ext1: this.isBookOne ? 1 : 2,
          ext2: 0
        },
      })
    }
  },
};
</script>

<style lang="scss" scoped>
.book_dialog {
  display: flex;
  position: absolute;
  bottom: 16px;
  width: 100vw;
  padding: 0 12px;

  @include mediaScreen('hw_fold') {
    left: 50%;
    transform: translateX(-50%);
    width: 410px;
    padding: 0;
  }
  @include mediaScreen('hw_pad') {
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    padding: 0;
  }

  .dialog {
    position: relative;
    width: 100%;
    padding: 20px 0 16px;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 24px;
    overflow: hidden;

    .close_btn {
      position: absolute;
      right: 0;
      top: 0;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      .close {
        width: 24px;
        height: 24px;
        color: var(--color-10);
      }
    }
    .tit{
      @include fontSize(20px);
      @include lineHeight(28px);
      text-align: center;
      color: var(--color-8);
    }
    .desc{
      margin-bottom: 8px;
      @include fontSize(12px);
      @include lineHeight(20px);
      text-align: center;
      color: var(--color-4);
    }

    .book_out{
      padding: 12px 24px;
    }
    .book_wrap{
      position: relative;
      display: flex;
      margin-top: 4px;
    }
    .book_wrap2{
      position: relative;
      display: flex;
      padding: 12px 24px;
      &:first-of-type{
        margin-top: 4px;
      }
    }
    .book_inner{
      margin-left: 12px;
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .book_tit{
      @include fontSize(16px);
      @include lineHeight(19px);
      @include text-ellipsis(1);
      color: var(--color-8);
    }
    .book_dot{
      margin-top: 4px;
      @include fontSize(12px);
      @include lineHeight(18px);
      color: var(--color-4);
    }
    .book_dot2{
      margin-top: 0px;
      padding-right: 62px;
      @include text-ellipsis(1);
      .category_name{
        max-width: 48px;
        @include text-ellipsis(1);
        display: inline-block;
        vertical-align: bottom;
      }
    }
    .book_hot{
      @include fontSize(12px);
      @include lineHeight(17px);
      color: var(--color-theme);
    }
    .add_btn{
      position: absolute;
      right: 0;
      bottom: 0;
      width: 64px;
      height: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      @include fontSize(12px);
      color: #fff;
      background-color: #0A59F7;
      border-radius: 20px;
    }
    .add_btn2{
      right: 20px;
      bottom: 4px;
    }
    .add_btn_disable{
      color: rgba(0, 0, 0, 0.6);
      background-color: rgba(0, 0, 0, 0.05);
    }
    .book_cont{
      margin-top: 16px;
      @include fontSize(14px);
      @include lineHeight(24px);
      @include text-ellipsis(5);
      color: var(--color-6);
    }
    .book_cont2{
      margin-top: 4px;
      @include fontSize(12px);
      @include lineHeight(18px);
      @include text-ellipsis(2);
      color: var(--color-6);
    }

    .btn_wrap {
      margin-top: 20px;
      display: flex;
      align-items: center;
      text-align: center;
      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 22px;
        padding: 20px 0;
        @include fontSize(16px);
        &:active {
          border-radius: 40px;
          background-color: var(--color-button-line);
        }
      }
      .btn_line {
        width: 0.5px;
        height: 24px;
        background-color: var(--color-button-line);
      }
      .cancel {
        margin: 0 8px 0 24px;
        color: var(--color-6);
      }
      .confirm {
        margin: 0 24px 0 8px;
        color: var(--color-theme);
      }
      .btn_disable{
        color: var(--color-text-disabled);
      }
    }
    .btn_wrap_1{
      margin-top: 20px;
    }
  }
}

.is_hm_ark {
  @extend .book_dialog;
  bottom: auto;
  top: 50%;
  left: 50%;
  padding: 0 16px;
  transform: translate(-50%, -50%);

  @include mediaScreen('hw_fold') {
    width: 410px;
    padding: 0;
  }
  @include mediaScreen('hw_pad') {
    width: 500px;
    padding: 0;
  }

  .dialog {
    border-radius: 32px;

    .close_btn {
      color: var(--color-text-primary);
      font-weight: bold;
    }

    .tit{
      color: var(--color-text-primary);
      font-weight: bold;
    }

    .desc {
      @include fontSize(14px);
      color: var(--color-text-secondary);
    }

    .btn_wrap {
      color: var(--color-theme);
      font-weight: 500;
      .cancel {
        color: inherit;
      }
      .confirm {
        color: inherit;
      }
    }
  }
}

.book_dialog_dark{
  .dialog{
    .add_btn{
      background-color: #317AF7;
    }
    .add_btn_disable{
      color: rgba(255, 255, 255, 0.8);
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>

