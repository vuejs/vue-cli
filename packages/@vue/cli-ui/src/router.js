import Vue from 'vue'
import Router from 'vue-router'
import { apolloClient } from './vue-apollo'

import ProjectHome from './views/ProjectHome.vue'
import ProjectPlugins from './views/ProjectPlugins.vue'
import ProjectConfiguration from './views/ProjectConfiguration.vue'
import ProjectTasks from './views/ProjectTasks.vue'
import ProjectSelect from './views/ProjectSelect.vue'
import ProjectCreate from './views/ProjectCreate.vue'
import About from './views/About.vue'

import PROJECT_CURRENT from './graphql/projectCurrent.gql'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: ProjectHome,
      meta: {
        needProject: true
      },
      children: [
        {
          path: '',
          name: 'project-home',
          redirect: { name: 'project-plugins' }
        },
        {
          path: 'plugins',
          name: 'project-plugins',
          component: ProjectPlugins
        },
        {
          path: 'configuration',
          name: 'project-configuration',
          component: ProjectConfiguration
        },
        {
          path: 'tasks',
          name: 'project-tasks',
          component: ProjectTasks
        }
      ]
    },
    {
      path: '/project/select',
      name: 'project-select',
      component: ProjectSelect
    },
    {
      path: '/project/create',
      name: 'project-create',
      component: ProjectCreate
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(m => m.meta.needProject)) {
    const result = await apolloClient.query({
      query: PROJECT_CURRENT,
      fetchPolicy: 'network-only'
    })
    if (!result.data.projectCurrent) {
      next({ name: 'project-select' })
      return
    }
  }
  next()
})

export default router
