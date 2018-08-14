<%_ if (!rootOptions.router) { _%>
<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <%_ if (!rootOptions.bare) { _%>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <%_ } else { _%>
    <h1>Welcome to Your Vue.js App</h1>
    <%_ } _%>
  </div>
</template>
  <%_ if (!rootOptions.bare) { _%>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  }
}
</script>
  <%_ } _%>
<%_ } else { _%>
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>
<%_ } _%>
<%_ if (!rootOptions.bare) { _%>
<%_ if (rootOptions.cssPreprocessor !== 'stylus') { _%>

<style<%-
  rootOptions.cssPreprocessor
    ? ` lang="${
        rootOptions.cssPreprocessor === 'sass'
          ? 'scss'
          : rootOptions.cssPreprocessor
      }"`
    : ``
%>>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  <%_ if (!rootOptions.router) { _%>
  margin-top: 60px;
  <%_ } _%>
}
<%_ if (rootOptions.router) { _%>
  <%_ if (!rootOptions.cssPreprocessor) { _%>
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
  <%_ } else { _%>
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
  <%_ } _%>
<%_ } _%>
</style>
<%_ } else { _%>
<style lang="stylus">
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
  <%_ if (!rootOptions.router) { _%>
  margin-top 60px
  <%_ } _%>
<%_ if (rootOptions.router) { _%>

#nav
  padding 30px
  a
    font-weight bold
    color #2c3e50
    &.router-link-exact-active
      color #42b983
<%_ } _%>
</style>
<%_ } _%>
<%_ } _%>
