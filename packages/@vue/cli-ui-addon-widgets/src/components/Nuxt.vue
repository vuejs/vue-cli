<template>
  <div class="nuxt">
    <ItemLogo
      image="https://avatars2.githubusercontent.com/u/23360933?s=200&v=4"
      class="icon"
    />

    <div class="message">
      Is Nuxt 2.0 released yet?
    </div>
    <div class="status">
      {{ widget.data.config.released ? 'YES' : 'Not yet' }}
    </div>
  </div>
</template>

<script>
export default {
  inject: [
    'widget'
  ]
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.nuxt
  v-box()
  box-center()

.icon
  margin-bottom $padding-item
  margin-right 0

.message
  margin-bottom ($padding-item / 2)

.status
  font-size 24px
</style>
