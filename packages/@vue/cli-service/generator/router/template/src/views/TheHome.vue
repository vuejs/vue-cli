<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <%_ if (!rootOptions.bare) { _%>
    <TheHelloWorld msg="Welcome to Your Vue.js App"/>
    <%_ } else { _%>
    <h1>Welcome to Your Vue.js App</h1>
    <%_ } _%>
  </div>
</template>
<%_ if (!rootOptions.bare) { _%>

<script>
// @ is an alias to /src
import TheHelloWorld from '@/components/TheHelloWorld.vue'

export default {
  name: 'TheHome',
  components: {
    TheHelloWorld
  }
}
</script>
<%_ } _%>
