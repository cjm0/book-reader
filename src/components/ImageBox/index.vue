<template>
<div class="img-box" ref="imgBox">
    <img
      v-if="!isLoadError"
      :src="url"
      @contextmenu.prevent
      @error="onError"
      :style="{height:imgHeight}"
    />
    <div v-else class="placeholder" :style="{height:placeholderHeight || '100%'}"></div>
</div>

</template>

<script>
export default {
  name: 'ImageBox',
  props: {
    url: {
      type: String,
      default: '',
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    imgHeight: {
      type: String,
      default: 'auto',
    },
  },
  data() {
    return {
      isLoadError: false,
    };
  },
  computed: {
    placeholderHeight() {
      return this.$refs.imgBox.offsetWidth * this.height / this.width;
    },
  },
  methods: {
    onError() {
      this.isLoadError = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.img-box{
  width: 100%;
  overflow: hidden;
  img{
    width: 100%;
    height: auto;
  }
}
.placeholder{
  background:var(--color-button-border);
}
</style>

