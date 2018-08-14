---
extend: '@vue/cli-service/generator/router/template/src/views/TheHome.vue'
when: 'rootOptions.router'
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
import TheHelloWorld from '@/components/TheHelloWorld.vue'; // @ is an alias to /src

export default Vue.extend({
  name: 'TheHome',
  components: {
    TheHelloWorld,
  },
});
<%_ } else { _%>
import { Component, Vue } from 'vue-property-decorator';
import TheHelloWorld from '@/components/TheHelloWorld.vue'; // @ is an alias to /src

@Component({
  components: {
    TheHelloWorld,
  },
})
export default class Home extends Vue {}
<%_ } _%>
</script>
<%# END_REPLACE %>
