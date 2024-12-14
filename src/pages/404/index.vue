<template>
  <BlankPage :show="true" type="none"></BlankPage>
</template>

<script>
export default {
  name: 'Blank',
  components: {
    BlankPage: import('@/components/BlankPage'),
  },
};
</script>
