<template>
  <transition-group name="suggestion" class="suggestions">
    <SuggestionBarItem
      v-for="(suggestion, index) of suggestions"
      :key="`${$i18n.locale}:${suggestion.id}`"
      :suggestion="suggestion"
      :index="suggestions.length - index - 1"
      ping
    />
  </transition-group>
</template>

<script>
export default {
  props: {
    suggestions: {
      type: Array,
      required: true
    }
  }
}
</script>
