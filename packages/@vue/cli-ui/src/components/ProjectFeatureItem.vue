<template>
  <div
    class="project-feature-item"
    :class="{
      enabled: feature.enabled
    }"
  >
    <VueSwitch
      :value="feature.enabled"
      class="extend-left"
    >
      <div class="content">
        <div class="name">{{ feature.name }}</div>
        <div class="description">
          {{ feature.description }}
          <a
            v-if="feature.link"
            :href="feature.link"
            target="_blank"
            @click.stop="() => {}"
          >
            More info
          </a>
        </div>
      </div>
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
@import "~@/style/imports"

.project-feature-item
  user-select none
  cursor pointer

  .vue-switch
    padding 12px
    width 100%
    box-sizing border-box

  .content
    display grid
    grid-template-columns 1fr
    grid-template-rows repeat(2, 24px)
    grid-template-areas "name" "description"

  .name
    grid-area name

  .description
    grid-area description
    color lighten($vue-color-dark, 40%)

  &.enabled
    background rgba($vue-color-primary, .05)
    .name
      color $vue-color-primary

  &:hover
    background rgba($vue-color-primary, .1)

</style>
