import Vue from 'vue'
import Router from 'vue-router'
import Home from '../components/Home'
import HelloWorld from '../components/models/HelloWorld'
import MnistCnn from '../components/models/MnistCnn'

Vue.use(Router)

const routes = new Router({
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/home', name: 'Home', component: Home },
    { path: '/hello-world', name: 'HelloWorld', component: HelloWorld },
    { path: '/mnist-cnn', component: MnistCnn }
  ]
})

export default routes
