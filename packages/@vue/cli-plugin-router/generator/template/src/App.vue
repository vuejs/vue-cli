---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace:
  - !!js/regexp /<template>[^]*?<\/template>/
  - !!js/regexp /\n<script>[^]*?<\/script>\n/
  - !!js/regexp /  margin-top[^]*?<\/style>/
  - !!js/regexp /text-align: center;/
---

<%# REPLACE %>
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>
<%# END_REPLACE %>

<%# REPLACE %>
<%# END_REPLACE %>

<%# REPLACE %>
}

<%_ if (rootOptions.cssPreprocessor !== 'stylus') { _%>
  <%_ if (!rootOptions.cssPreprocessor) { _%>
  
.home {
  text-align: center;
}
#nav {
  padding: 30px;
  text-align: center;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
  <%_ } else { _%>
.home {
  text-align: center;
}
#nav {
  padding: 30px;
  text-align: center;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
  <%_ } _%>
<%_ } else { _%>
.home
  text-align center

#nav
  padding 30px
  text-align center
  a
    font-weight bold
    color #2c3e50
    &.router-link-exact-active
      color #42b983
<%_ } _%>
</style>
<%# END_REPLACE %>
