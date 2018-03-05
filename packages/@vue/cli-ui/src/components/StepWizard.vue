<template>
  <div class="step-wizard">
    <div class="header">
      <div v-if="title" class="title">{{ title }}</div>
    </div>

    <VueTabs
      ref="tabs"
      class="main-tabs"
      group-class="accent"
    >
      <slot/>
    </VueTabs>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: null
    }
  },

  methods: {
    next () {
      const tabs = this.$refs.tabs
      tabs.activateChild(tabs.activeChildIndex + 1)
    },
    previous () {
      const tabs = this.$refs.tabs
      tabs.activateChild(tabs.activeChildIndex - 1)
    },
  }
}
</script>


<style lang="stylus" scoped>
@import "~@/style/imports"

.step-wizard
  v-box()

  .main-tabs
    height 100%
    flex auto 1 1

  .header,
  >>> .tabs
    background $vue-color-light-neutral

  >>> .tabs-content
    height 0

  &,
  >>> .vue-tab,
  >>> .vue-tab-content
    height 100%

  >>> .vue-tab-content
    overflow-y auto
    v-box()

    > .content
      flex 100% 1 1

    > .actions-bar
      justify-content space-between

  .title
    padding 12px
    font-size 24px
    text-align center
    font-weight lighter

</style>
