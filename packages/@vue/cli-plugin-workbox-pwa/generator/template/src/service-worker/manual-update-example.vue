<script>
import AppManualUpdate from '@/components/app-manual-update.vue'

export default {
  // Ideally, you'll want to place the AppManualUpdate component inside the App.vue
  components: {
    AppManualUpdate
  }
}
</script>

<template>
  <!-- Sample App.vue html -->
  <AppManualUpdate />
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </div>
</template>
