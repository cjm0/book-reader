<template>
  <div class="loading" :style="{ background:theme.bg, paddingTop:statusBarHeight }" v-if="show">
    <img class="loading-icon" src="@/assets/images/loading.webp" srcset="" @contextmenu.prevent />
    <span class="loading-txt">{{text}}</span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'Loading',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['statusBarHeight', 'theme']),
  },
  data() {
    return {
      text: '正在加载...',
    };
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
