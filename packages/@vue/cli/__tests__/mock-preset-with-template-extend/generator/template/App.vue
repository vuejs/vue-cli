---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace: !!js/regexp /<script>[^]*?<\/script>/
---

<script>
export default {
  // Replace default script
}
</script>
