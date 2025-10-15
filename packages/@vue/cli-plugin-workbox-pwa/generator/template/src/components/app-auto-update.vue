<script>
import { useServiceWorker } from '@/composables/use-service-worker'

export default {
  name: 'AppAutoUpdate',
  setup () {
    // useServiceWorker has a param to force update so all we have to do is reference this component somewhere, ideally on a login page.
    const { updateExists } = useServiceWorker(true)

    return {
      updateExists
    }
  }
}
</script>

<template>
  <div
    v-if="updateExists"
    class="warning-msg"
  >
    <span> Please wait while we update the application.</span>
  </div>
</template>
<style scoped>
.warning-msg {
  background-color: lightgoldenrodyellow;
  border: solid 2px orange;
  border-radius: 2px;
  margin-bottom: 1rem;
  padding: 1rem;
}
</style>
