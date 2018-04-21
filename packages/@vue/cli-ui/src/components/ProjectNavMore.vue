<template>
  <div class="project-nav-more">
    <VueDropdown placement="right-end">
      <VueButton
        slot="trigger"
        icon-left="more_horiz"
        class="icon-button big flat"
      />

      <VueDropdownButton
        icon-left="work"
        :to="{ name: 'project-select' }"
        :label="$t('views.project-select.title')"
      />
      <VueDropdownButton
        icon-left="info"
        :to="{ name: 'about' }"
        :label="$t('views.about.title')"
      />
    </VueDropdown>
  </div>
</template>
