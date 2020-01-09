<template>
  <div class="nav-list vue-ui-disable-scroll">
    <div class="content">
      <slot name="before"/>

      <div
        v-for="item of items"
        :key="item.id"
        @click="currentRoute = item.route"
      >
        <slot
          :item="item"
          :selected="item.route === currentRoute"
        />
      </div>

      <slot name="after"/>
    </div>
  </div>
</template>

<script>
import { isSameRoute, isIncludedRoute } from '@/util/route'

export default {
  props: {
    items: {
      type: Array,
      required: true
    }
  },

  computed: {
    currentRoute: {
      get () {
        const currentRoute = this.$route
        const item = this.items.find(
          item => isIncludedRoute(currentRoute, this.$router.resolve(item.route).route)
        )
        return item && item.route
      },
      set (route) {
        if (!isSameRoute(this.$route, route)) {
          this.$router.push(route)
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.nav-list
  overflow-x hidden
  overflow-y auto
  background $content-bg-list-light
  .vue-ui-dark-mode &
    background $content-bg-list-dark
</style>
