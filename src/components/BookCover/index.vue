<template>
  <p :class="['book_cover', bookSize]">
    <img class="img" alt="书封" :src="coverUrl" @error="onError" @contextmenu.prevent v-show="errImg !== 2"/>
  </p>
</template>

<script>
import { toHttps } from '@/utils/helpers';
const DEFAULT_COVER = require('@/assets/images/bookcover.png')

export default {
  name: 'BookCover',
  props: {
    url: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 96,
    },
  },
  data() {
    return {
      errImg: 0,
    };
  },
  computed: {
    bookSize() {
      if ([96, 72, 62, 66, 56, 45, 30].includes(this.size)) {
        return `size_${this.size}`
      }
      return 'size_96'
    },
    coverUrl() {
      if (this.errImg === 1) {
        return DEFAULT_COVER
      }
      return toHttps(this.url) || DEFAULT_COVER
    },
  },
  methods: {
    onError() {
      if (this.errImg) {
        this.errImg = 2
        return
      }
      this.errImg = 1
      console.log('书封报错', this.url)
    },
  },
};
</script>

<style lang="scss" scoped>
.book_cover {
  background: var(--color-button-border);
  overflow: hidden;
  .img{
    width: 100%;
    height: 100%;
  }
}
.size_96 {
  width: 96px;
  height: 128px;
  border-radius: 8px;
}
.size_72 {
  width: 72px;
  height: 96px;
  border-radius: 6px;
}
.size_62 {
  width: 62px;
  height: 82px;
  border-radius: 4px;
}
.size_66 {
  width: 66px;
  height: 88px;
  border-radius: 8px;
}
.size_56 {
  width: 56px;
  height: 75px;
  border-radius: 8px;
}
.size_45{
  width: 45px;
  height: 60px;
  border-radius: 4px;
}
.size_30{
  width: 30px;
  height: 40px;
  border-radius: 4px;
}
</style>
