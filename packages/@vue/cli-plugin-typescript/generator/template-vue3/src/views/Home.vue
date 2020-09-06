---
extend: '@vue/cli-plugin-router/generator/template/src/views/Home.vue'
when: "rootOptions.plugins && rootOptions.plugins['@vue/cli-plugin-router']"
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
import { defineComponent } from 'vue';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

export default defineComponent({
  name: 'Home',
  components: {
    HelloWorld,
  },
});
<%_ } else { _%>
import { Options, Vue } from 'vue-class-component';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

@Options({
  components: {
    HelloWorld,
  },
})
export default class Home extends Vue {}
<%_ } _%>
</script>
<%# END_REPLACE %>
