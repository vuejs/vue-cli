<template>
  <div
    v-show="totalResults > 0"
    class="instant-search-pagination"
  >
    <div class="content">
      <VueButton
        class="icon-button"
        icon-left="first_page"
        :disabled="page === 1"
        @click="goToFirstPage()"
      />

      <VueButton
        class="icon-button"
        icon-left="chevron_left"
        :disabled="page === 1"
        @click="goToPreviousPage()"
      />

      <VueButton
        v-for="item in pages"
        :key="item"
        class="icon-button"
        :class="{
          primary: page === item
        }"
        :label="item.toString()"
        @click="goToPage(item)"
      />

      <VueButton
        class="icon-button"
        icon-left="chevron_right"
        :disabled="page >= totalPages"
        @click="goToNextPage()"
      />

      <VueButton
        class="icon-button"
        icon-left="last_page"
        :disabled="page >= totalPages"
        @click="goToLastPage()"
      />
    </div>
  </div>
</template>

<script>
import { Pagination } from 'vue-instantsearch'

export default {
  extends: Pagination
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.instant-search-pagination
  .content
    h-box()
    box-center()

    > .vue-ui-button
      space-between-x(6px)
</style>
