<template>
  <div class="home">
    <img src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld'

export default {
  name: 'home',
  components: {
    HelloWorld
  }
}
</script>
