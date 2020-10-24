---
extend: '@vue/cli-service/generator/template/src/App.vue'
when: "rootOptions.plugins && !rootOptions.plugins['@vue/cli-plugin-router']"
replace:
  - !!js/regexp /Welcome to Your Vue\.js App/g
  - !!js/regexp /<script>[^]*?<\/script>/
---

<%# REPLACE %>
Welcome to Your Vue.js + TypeScript App
<%# END_REPLACE %>

<%# REPLACE %>
<script lang="ts">
<%_ if (!options.classComponent) { _%>
import { defineComponent } from 'vue';
import HelloWorld from './components/HelloWorld.vue';

export default defineComponent({
  name: 'App',
  components: {
    HelloWorld
  }
});
<%_ } else { _%>
import { Options, Vue } from 'vue-class-component';
import HelloWorld from './components/HelloWorld.vue';

@Options({
  components: {
    HelloWorld,
  },
})
export default class App extends Vue {}
<%_ } _%>
</script>
<%# END_REPLACE %>
