<template>
  <div class="plugin-updates">
    <StatusWidget
      v-if="status"
      :icon="icons[status.status]"
      :icon-class="iconClasses[status.status]"
      :title="$t(`org.vue.widgets.plugin-updates.messages.${status.status}`)"
      :status="status"
      @check="checkForUpdates()"
    >
      <template slot="more-actions">
        <VueButton
          :to="{ name: 'project-plugins' }"
          :label="$t('org.vue.widgets.plugin-updates.page')"
          icon-left="extension"
        />
      </template>
    </StatusWidget>
  </div>
</template>

<script>
import { UPDATES_ICONS, UPDATES_ICON_CLASSES } from '../util/consts'

import StatusWidget from './StatusWidget.vue'

export default {
  components: {
    StatusWidget
  },

  sharedData () {
    return mapSharedData('org.vue.widgets.plugin-updates.', {
      status: 'status'
    })
  },

  created () {
    this.icons = UPDATES_ICONS
    this.iconClasses = UPDATES_ICON_CLASSES
  },

  methods: {
    checkForUpdates () {
      // TODO
    }
  }
}
</script>
