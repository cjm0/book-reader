<template>
  <div
    id="topbar"
    :class="['topbar', show && 'show', needAnim ? 'anim' : 'no-anim']"
    :style="{'background':theme.bg, height:topbarHeight, paddingTop:statusBarHeight}"
    @click="handlerClick"
  >
    <div :class="['topbar_btn', isHmArk ? 'back_hm' : 'back']" @click="goBack">
      <svg-icon
        :icon-class="isHmArk ? 'chevron_backward' : 'arrow-back'"
        :class="['topbar_icon', isDark && 'topbar_icon_adrk']"
      />
    </div>

    <template v-if="isHmArk">
      <div :class="['topbar_btn', 'add_book_hm']" @click="addBookShelf" v-if="showRight">
        <svg-icon
          :icon-class="isInBookShelf ? 'header_added_bookshelf' :'header_unadd_bookshelf'"
          :class="['topbar_icon', isDark && 'topbar_icon_adrk', isInBookShelf && 'topbar_icon_disable']"
        />
      </div>
    </template>
    <template v-else>
      <div :class="['topbar_btn', 'add_book', isInBookShelf && 'add_disable']" @click="addBookShelf" v-if="showRight">
        <p :class="[isInBookShelf && 'text']" v-if="readUIConfig > 0">{{ isInBookShelf ? '已加书架' : '加入书架' }}</p>
        <svg-icon
          :icon-class="isInBookShelf ? 'addedbook' :'addbook'"
          :class="['topbar_icon', isDark && 'topbar_icon_adrk']"
          @click="addBookShelf"
          v-else
        />
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { logUserBehavior } from '@/service';
import { loginMixin } from '@/mixins/login'

export default {
  name: 'Topbar',
  mixins: [loginMixin],
  props: {
    isInBookShelf: {
      type: Number,
      default: 0,
    },
    show: {
      type: Boolean,
      default: false,
    },
    showRight: {
      type: Boolean,
      default: true,
    },
    needAnim: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {

    };
  },
  computed: {
    ...mapGetters(['theme', 'statusBarHeight', 'topbarHeight', 'readUIConfig', 'isHmArk']),
    isDark() {
      return this.theme.theme === 'dark'
    },
  },

  methods: {
    handlerClick() {
      this.$emit('handlerClick')
    },
    async addBookShelf() {
      try {
        await this.beforeAddShelfCheck();
        if (!this.isInBookShelf) {
          logUserBehavior({
            eventId: 'reader_menu_Addshelf_clicked',
            eventCode: 'clicked',
          })
          this.$emit('addBookShelf')
        }
      } catch (err) {
        console.log('当前状态未登录', err);
        return false;
      }
    },
    goBack() {
      this.$emit('goBack');
    },
  },
};
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
