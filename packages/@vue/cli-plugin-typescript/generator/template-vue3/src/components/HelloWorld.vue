---
extend: '@vue/cli-service/generator/template/src/components/HelloWorld.vue'
replace: !!js/regexp /<script>[^]*?<\/script>/
---
<script lang="ts">
<%_ if (!options.classComponent) { _%>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: String,
  },
});
<%_ } else { _%>
import { Options, Vue } from 'vue-class-component';

@Options({
  props: {
    msg: String
  }
})
export default class HelloWorld extends Vue {
  msg!: string
}
<%_ } _%>
</script>
