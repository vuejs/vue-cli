<script>
import AppAutoUpdate from '@/components/app-auto-update.vue'

export default {
  // To auto update your PWA when a new service worker is available, just drop in the AppAutoUpdate component
  // The ideal use case for this would be on a landing page or a login page, if your application has one.
  // Some things to note:
  // 1. You really only want to auto update when you are sure there will be no adverse affects to your application, like on a login page.
  // 2. If you are making your website PWA accessible, then it's probably safe to add this to your home page.
  // 3. If you are using advanced features of a PWA, like API caching, offline capabilities, etc. You may not want to use the auto update. Instead,
  // use the manual update, which gives the user control.
  name: 'auto-update-example',
  components: {
    AppAutoUpdate
  }
}
</script>

<template>
  <AppAutoUpdate />
</template>
