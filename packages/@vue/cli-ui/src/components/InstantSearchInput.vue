<template>
  <div class="instant-search-input">
    <VueInput
      ref="input"
      icon-left="search"
      v-model="query"
      class="big"
      :placeholder="placeholder"
    >
      <template slot="right">
        <VueButton
          class="icon-button flat"
          icon-left="clear"
          @click="clear()"
        />
      </template>
    </VueInput>
  </div>
</template>

<script>
import { Component } from 'vue-instantsearch'

export default {
  mixins: [
    Component
  ],

  props: {
    placeholder: {
      type: String,
      default: null
    }
  },

  computed: {
    query: {
      get () {
        return this.searchStore.query
      },
      set (value) {
        this.searchStore.stop()
        this.searchStore.query = value
        this.$emit('query', value)
        // We here ensure we give the time to listeners to alter the store's state
        // without triggering in between ghost queries.
        this.$nextTick(() => {
          this.searchStore.start()
          this.searchStore.refresh()
        })
      }
    }
  },

  methods: {
    clear () {
      this.searchStore.stop()
      if (this.searchStore.query.length > 0) {
        this.searchStore.query = ''
      }
      if (this.searchStore.activeRefinements.length > 0) {
        this.searchStore.clearRefinements()
      }
      this.searchStore.start()
      this.searchStore.refresh()
    },

    focus () {
      this.$refs.input.focus()
    }
  }
}
</script>

<style lang="stylus" scoped>
.instant-search-input
  .vue-ui-input
    width 100%
</style>
