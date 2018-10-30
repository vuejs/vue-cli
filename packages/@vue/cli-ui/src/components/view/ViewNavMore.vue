<template>
  <div class="project-nav-more">
    <VueDropdown placement="right-end">
      <VueButton
        slot="trigger"
        icon-left="more_horiz"
        class="big flat"
        :class="{
          'icon-button': !$responsive.wide
        }"
      >
        <span v-if="$responsive.wide" class="label">{{ $t('org.vue.components.project-nav.tooltips.more') }}</span>
      </VueButton>

      <VueDropdownButton
        icon-left="home"
        :to="{ name: 'project-select' }"
        :label="$t('org.vue.views.project-select.title')"
      />
      <VueDropdownButton
        icon-left="info"
        :to="{ name: 'about' }"
        :label="$t('org.vue.views.about.title')"
      />
    </VueDropdown>
  </div>
</template>

<style lang="stylus" scoped>
.project-nav-more
  .vue-ui-dropdown.open .dropdown-trigger .vue-ui-button
    &,
    &:hover
      background lighten($vue-ui-color-dark, 10%) !important
      color $md-white !important
      /deep/ > .content > .button-icon
        svg
          fill @color
</style>
