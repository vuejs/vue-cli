import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  <%_ if (historyMode) { _%>
  mode: 'history',
  base: process.env.BASE_URL,
  <%_ } _%>
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      <%_ if (doesCompile) { _%>
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
      <%_ } else { _%>
      component: function () { 
        return import(/* webpackChunkName: "about" */ './views/About.vue')
      }
      <%_ } _%>
    }
  ]
})
