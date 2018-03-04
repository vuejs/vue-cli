---
extend: '@vue/cli-service/generator/template/src/components/HelloWorld.vue'
replace: !!js/regexp /<script>[^]*?<\/script>/
---
<script lang="ts">
<%_ if (!options.classComponent) { _%>
import Vue from 'vue';

export default Vue.extend({
  name: 'HelloWorld',
  props: {
    msg: String,
  },
});
<%_ } else { _%>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;
}
<%_ } _%>
</script>
