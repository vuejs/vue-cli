import Vue from 'vue'
import Router from 'vue-router'
import { apolloClient } from './vue-apollo'

import ProjectHome from './views/ProjectHome.vue'
import ProjectPlugins from './views/ProjectPlugins.vue'
import ProjectPluginsAdd from './views/ProjectPluginsAdd.vue'
import ProjectConfigurations from './views/ProjectConfigurations.vue'
import ProjectConfigurationDetails from './views/ProjectConfigurationDetails.vue'
import ProjectTasks from './views/ProjectTasks.vue'
import ProjectTaskDetails from './views/ProjectTaskDetails.vue'
import ProjectSelect from './views/ProjectSelect.vue'
import ProjectCreate from './views/ProjectCreate.vue'
import FileDiffView from './components/FileDiffView.vue'
import About from './views/About.vue'
import NotFound from './views/NotFound.vue'

import PROJECT_CURRENT from './graphql/projectCurrent.gql'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: ProjectHome,
      meta: {
        needProject: true,
        restore: true
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
          path: 'plugins/add',
          name: 'project-plugins-add',
          component: ProjectPluginsAdd
        },
        {
          path: 'configuration',
          name: 'project-configurations',
          component: ProjectConfigurations,
          children: [
            {
              path: ':id',
              name: 'project-configuration-details',
              component: ProjectConfigurationDetails,
              props: true
            }
          ]
        },
        {
          path: 'tasks',
          name: 'project-tasks',
          component: ProjectTasks,
          children: [
            {
              path: ':id',
              name: 'project-task-details',
              component: ProjectTaskDetails,
              props: true
            }
          ]
        }
      ]
    },
    {
      path: '/project/select',
      name: 'project-select',
      component: ProjectSelect,
      meta: {
        restore: true
      }
    },
    {
      path: '/project/create',
      name: 'project-create',
      component: ProjectCreate,
      meta: {
        restore: true
      }
    },
    {
      path: '/file-diff',
      name: 'file-diff',
      component: FileDiffView
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/home',
      name: 'home',
      redirect: { name: 'project-home' }
    },
    {
      path: '*',
      name: 'not-found',
      component: NotFound
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

router.afterEach((to, from) => {
  if (to.matched.some(m => m.meta.restore)) {
    localStorage.setItem('vue-cli-ui.lastRoute', to.fullPath)
  } else {
    localStorage.removeItem('vue-cli-ui.lastRoute')
  }
})

export default router
