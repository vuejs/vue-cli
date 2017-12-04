import Vue from 'vue'
import Router from 'vue-router'
import Home from '../components/Home'
import HelloWorld from '../components/models/HelloWorld'
import MnistCnn from '../components/models/MnistCnn'

Vue.use(Router)

const routes = new Router({
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/HelloWorld', name: 'HelloWorld', component: HelloWorld },
    { path: '/Home', name: 'Home', component: Home },
    { path: '/mnist-cnn', component: MnistCnn }
    // { path: '/mnist-vae', component: MnistVae },
    // { path: '/mnist-acgan', component: MnistAcgan },
    // { path: '/resnet50', component: Resnet50 },
  ]
})

export default routes
