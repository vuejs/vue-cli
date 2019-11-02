import Vue from 'vue'
<%_ if (hasTypeScript) { _%>
import VueRouter, { RouteConfig } from 'vue-router'
<%_ } else { _%>
import VueRouter from 'vue-router'
<%_ } _%>
import Home from '../views/Home.vue'

<%_ if (hasTypeScript) { _%>
const routes = <Array<RouteConfig>>[

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
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    <%_ } else { _%>
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
    <%_ } _%>
  }
]
<%_ } else { _%>
const routes = [
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
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    <%_ } else { _%>
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
    <%_ } _%>
  }
]
<%_ } _%>

Vue.use(VueRouter)

const router = new VueRouter({
  <%_ if (historyMode) { _%>
  mode: 'history',
  base: process.env.BASE_URL,
  <%_ } _%>
  routes
})

export default router
