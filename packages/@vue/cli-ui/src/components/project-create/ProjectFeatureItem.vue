<template>
  <div
    class="project-feature-item list-item"
    :class="{
      selected: feature.enabled
    }"
    :data-testid="feature.id"
  >
    <VueSwitch
      :value="feature.enabled"
      class="extend-left"
    >
      <ListItemInfo
        :name="$t(feature.name)"
        :description="$t(feature.description)"
        :link="feature.link"
        :selected="feature.enabled"
      />
    </VueSwitch>
  </div>
</template>

<script>
export default {
  props: {
    feature: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
.project-feature-item
  .vue-ui-switch
    padding $padding-item
    width 100%
    box-sizing border-box
</style>
