<template>
  <div class="plugin-updates">
    <StatusWidget
      v-if="status"
      :icon="icons[status.status]"
    />
  </div>
</template>

<script>
import { UPDATES_ICONS } from '../util/icons'

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
  }
}
</script>
