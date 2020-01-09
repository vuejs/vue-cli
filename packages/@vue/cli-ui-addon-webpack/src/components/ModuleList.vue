<template>
  <div class="module-list card list-block">
    <div class="content">
      <div class="title">
        {{ $t('org.vue.vue-webpack.dashboard.module-list.title') }}
      </div>

      <VueIcon
        v-if="!depModules.length"
        icon="more_horiz"
        class="blank-icon"
      />

      <div class="list">
        <ModuleListItem
          v-for="m of depModules"
          :key="m.id"
          :module="m"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ModuleListItem from './ModuleListItem'

export default {
  components: {
    ModuleListItem
  },

  computed: {
    ...mapGetters([
      'depModules'
    ])
  }
}
</script>
