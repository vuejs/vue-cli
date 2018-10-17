<template>
  <component
    v-if="component"
    :is="component"
  />
  <div v-else class="loading">
    <VueLoadingIndicator />
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      component: null
    }
  },

  watch: {
    name: {
      handler: 'updateComponent',
      immediate: true
    }
  },

  methods: {
    async updateComponent () {
      this.component = await ClientAddonApi.awaitComponent(this.name)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.loading
  v-box()
  box-center()
  padding 100px
</style>
