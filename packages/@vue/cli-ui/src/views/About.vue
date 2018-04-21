<template>
  <div class="about page">
    <h1>{{ $t('views.about.title') }}</h1>

    <p class="description" v-html="$t('views.about.description')"/>

    <blockquote class="quote" v-text="$t('views.about.quote')"/>

    <p>- <a href="https://github.com/Akryum" target="_blank">Guillaume Chau</a></p>

    <h2>{{ $t('views.about.links') }}</h2>

    <div class="links vue-ui-grid default-gap">
      <VueButton href="https://github.com/vuejs/vue-cli" target="_blank">Repository</VueButton>
      <VueButton href="https://github.com/vuejs/vue-cli/tree/dev/docs#table-of-contents" target="_blank">Documentation</VueButton>
      <VueButton href="https://vuejs.org/v2/guide/" target="_blank">Vue.js Guide</VueButton>
      <VueButton href="https://vuejs.org/v2/api/" target="_blank">Vue.js API reference</VueButton>
      <VueButton href="https://forum.vuejs.org/" target="_blank">Vue.js Forums</VueButton>
      <VueButton href="https://chat.vuejs.org/" target="_blank">Vue.js Chat</VueButton>
    </div>

    <div class="actions">
      <VueButton
        :to="previousRoute"
        class="primary big"
        left-icon="arrow_back"
        :label="$t('views.about.back')"
      />
    </div>
  </div>
</template>

<script>
export default {
  metaInfo () {
    return {
      title: this.$t('views.about.title')
    }
  },

  data () {
    return {
      previousRoute: { name: 'home' }
    }
  },

  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (from) vm.previousRoute = from.fullPath
    })
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.about
  padding 42px
  max-width 900px
  margin 0 auto
  box-sizing border-box

  .quote
    border-left solid 4px rgba($vue-ui-color-primary, .3)
    margin-left 0
    padding-left $padding-item
    color lighten($vue-ui-color-dark, 30%)

  .links
    grid-template-columns repeat(auto-fill, 180px)

  .actions
    margin-top @padding
    h-box()
    box-center()
</style>
