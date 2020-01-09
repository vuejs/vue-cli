<template>
  <div v-if="error" class="prompt-error">
    <div class="vue-ui-text danger banner">
      <VueIcon icon="warning" class="big"/>
      <span>{{ $t(error.message) }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default: null
    }
  }
}
</script>

<style lang="stylus" scoped>
.prompt-error
  padding 0 $padding-item $padding-item

  .banner
    border-radius $br
</style>
