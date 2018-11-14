<template>
  <div class="app-loading">
    <transition name="vue-ui-fade">
      <VueLoadingIndicator
        v-if="loading"
        class="primary"
      />
    </transition>
  </div>
</template>

<script>
import LOADING from '@/graphql/loading/loading.gql'

export default {
  apollo: {
    loading: {
      query: LOADING,
      fetchPolicy: 'cache-only'
    }
  }
}
</script>
