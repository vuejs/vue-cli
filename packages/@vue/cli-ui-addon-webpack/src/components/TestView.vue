<template>
  <div class="test-view">
    <h1>{{ $t('org.vue.vue-webpack.test-view') }}</h1>
    <p>A vue-cli plugin created me! I am a dynamically loaded component paired with a custom route.</p>
    <div class="section">
      <VueInput
        v-model="testData"
        placeholder="Shared data (with storage)"
      />
    </div>
    <div class="section">
      <VueButton @click="testPluginAction()">Test plugin action</VueButton>
    </div>
  </div>
</template>

<script>
export default {
  sharedData: {
    testData: 'test-data'
  },

  created () {
    this.$onPluginActionCalled(action => {
      // eslint-disable-next-line no-console
      console.log('called', action)
    })
    this.$onPluginActionResolved(action => {
      // eslint-disable-next-line no-console
      console.log('resolved', action)
    })
  },

  methods: {
    testPluginAction () {
      this.$callPluginAction('test-action', {
        meow: 'meow'
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.test-view
  padding 42px

.section
  margin-bottom 12px
</style>
