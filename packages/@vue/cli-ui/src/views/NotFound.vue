<template>
  <div class="not-found page">
    <VueIcon icon="pets" class="huge"/>
    <h1 class="title">View not found</h1>
    <VueButton :to="{ name: 'home' }">Go home</VueButton>
  </div>
</template>

<style lang="stylus" scoped>
@import "~@/style/imports"

.not-found
  v-box()
  box-center()
  height 100%

  .title
    margin $padding-item 0
</style>
