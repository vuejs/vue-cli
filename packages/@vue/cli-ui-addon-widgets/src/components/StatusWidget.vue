<template>
  <div class="status-widget">
    <div class="icon-wrapper">
      <ItemLogo
        :image="icon"
        class="icon"
        :class="iconClass"
      />
      <VueIcon
        v-if="secondaryIcon"
        :icon="secondaryIcon"
        class="secondary-icon"
      />
    </div>

    <div class="info">
      <div class="title" v-html="title"/>
      <div class="description" v-html="description"/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      required: true
    },

    iconClass: {
      type: [String, Array, Object],
      default: undefined
    },

    secondaryIcon: {
      type: String,
      default: undefined
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.status-widget
  h-box()
  box-center()

.icon-wrapper
  position relative
</style>
