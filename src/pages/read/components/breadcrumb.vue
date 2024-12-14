<template>
  <div
    class="bread_crumb_index"
    :style="{ backgroundColor: theme.paper, height: topbarHeight, paddingTop: statusBarHeight }"
  >
    <div class="crumb">{{ bookName }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'BreadCrumb',
  props: {
    bookName: {
      type: String,
      default: '',
    },
  },
  computed: {
    ...mapGetters(['theme', 'statusBarHeight', 'topbarHeight']),
  },
};
</script>

<style lang="scss" scoped>
.bread_crumb_index {
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 11;
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  padding: 0 24px;
  @include fontSize(14px);
  @include lineHeight(20px);
  color: var(--color-text-disabled);
  background-color: transparent;
  .crumb {
    @include text-ellipsis(1);
    // display: flex;
    // align-items: center;
  }
}
.icon {
  margin-right: 4px;
}
</style>
