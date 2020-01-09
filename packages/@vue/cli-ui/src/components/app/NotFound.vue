<template>
  <div class="not-found page">
    <template v-if="addonRouteTimout">
      <VueIcon icon="cake" class="huge"/>
      <h1 class="title">Addon route taking too long to load</h1>
      <h2 class="subtitle">The route may not exist</h2>
      <VueButton :to="{ name: 'home' }">Go home</VueButton>
    </template>
    <template v-else-if="isAddonRoute">
      <VueLoadingIndicator
        class="accent big"
      />
    </template>
    <template v-else>
      <VueIcon icon="pets" class="huge"/>
      <h1 class="title">View not found</h1>
      <VueButton :to="{ name: 'home' }">Go home</VueButton>
    </template>
  </div>
</template>

<script>
export default {
  name: 'NotFound',

  data () {
    return {
      addonRouteTimout: false
    }
  },

  computed: {
    isAddonRoute () {
      return this.$route.path.includes('/addon/')
    }
  },

  mounted () {
    if (this.isAddonRoute) {
      setTimeout(() => {
        this.addonRouteTimout = true
      }, 5000)
    }
  }
}
</script>

<style lang="stylus" scoped>
.not-found
  v-box()
  box-center()
  height 100%

  .vue-ui-icon,
  .title,
  .subtitle
    margin 0 0 $padding-item
</style>
