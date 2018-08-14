---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace:
  - !!js/regexp /Welcome to Your Vue\.js App/
  - !!js/regexp /<script>[^]*?<\/script>/
---

<%# REPLACE %>
Welcome to Your Vue.js + TypeScript App
<%# END_REPLACE %>

<%# REPLACE %>
<script lang="ts">
<%_ if (!options.classComponent) { _%>
import Vue from 'vue';
import TheHelloWorld from './components/TheHelloWorld.vue';

export default Vue.extend({
  name: 'app',
  components: {
    TheHelloWorld
  }
});
<%_ } else { _%>
import { Component, Vue } from 'vue-property-decorator';
import TheHelloWorld from './components/TheHelloWorld.vue';

@Component({
  components: {
    TheHelloWorld,
  },
})
export default class App extends Vue {}
<%_ } _%>
</script>
<%# END_REPLACE %>
