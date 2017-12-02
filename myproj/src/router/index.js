import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '../components/HelloWorld'
import Home from '../components/Home'

Vue.use(Router)

const routes2 =  new Router({
  routes: [
    { path: '/', component: Home },
    { path: '/HelloWorld', name: 'HelloWorld', component: HelloWorld },
    { path: '/Home', name: 'Home', component: Home }
    // { path: '/mnist-cnn', component: MnistCnn },
    // { path: '/mnist-vae', component: MnistVae },
    // { path: '/mnist-acgan', component: MnistAcgan },
    // { path: '/resnet50', component: Resnet50 },
  ]
})

export default {routes2};
