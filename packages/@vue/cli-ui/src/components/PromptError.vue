<template>
  <div v-if="error" class="prompt-error">
    <div class="vue-text danger banner">
      <VueIcon icon="warning" class="big"/>
      <span>{{ error.message }}</span>
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
@import "~@/style/imports"

.prompt-error
  padding 0 $padding-item $padding-item

  .banner
    border-radius $br
</style>
