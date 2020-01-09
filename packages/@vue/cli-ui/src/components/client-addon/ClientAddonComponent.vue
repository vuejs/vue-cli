<template>
  <component
    v-if="component"
    :is="component"
  />
  <div v-else-if="timeout" class="vue-ui-empty">
    <VueIcon
      icon="cake"
      class="big"
    />
    <div class="timeout-title">
      {{ $t('org.vue.components.client-addon-component.timeout') }}
    </div>
    <div class="timeout-info">
      {{ $t('org.vue.components.client-addon-component.timeout-info') }}
    </div>
  </div>
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
      component: null,
      timeout: false
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
      setTimeout(() => {
        if (!this.component) {
          this.timeout = true
        }
      }, 5000)
      this.component = await ClientAddonApi.awaitComponent(this.name)
    }
  }
}
</script>

<style lang="stylus" scoped>
.loading
  v-box()
  box-center()
  padding 42px

.timeout-info
  max-width 200px
  font-size 10px
  margin auto
</style>
