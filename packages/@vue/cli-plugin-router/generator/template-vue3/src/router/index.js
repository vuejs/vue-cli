import { createRouter<%
  if (historyMode) {
    %>, createWebHistory<%
  } else {
    %>, createWebHashHistory<%
  }

  if (hasTypeScript) {
    %>, RouteRecordRaw<%
  }
  %> } from 'vue-router'
import Home from '../views/Home.vue'

const routes<% if (hasTypeScript) { %>: Array<RouteRecordRaw><% } %> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
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

const router = createRouter({
  <%_ if (historyMode) { _%>
  history: createWebHistory(process.env.BASE_URL),
  <%_ } else { _%>
  history: createWebHashHistory(),
  <%_ } _%>
  routes
})

export default router
