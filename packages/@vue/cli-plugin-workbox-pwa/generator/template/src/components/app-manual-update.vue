<script>
import { useServiceWorker } from '@/composables/use-service-worker'

export default {
  name: 'AppManualUpdate',
  setup () {
    const { updateExists, refreshApp } = useServiceWorker()

    return {
      refreshApp,
      updateExists
    }
  }
}
</script>

<template>
  <div
    style="background-color: #FFFF99;"
    v-show="updateExists"
  >
    Update available
    <button @click="refreshApp">
      Update
    </button>
  </div>
</template>
