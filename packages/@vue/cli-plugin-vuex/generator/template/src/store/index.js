import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    title:''
  },
  mutations: {
    setTitle(state,newTitle){
      state.title = newTitle;
    }
  },
  getters:{
    title: state => state.title
  },
  actions: {
    setUpperTitle(context,newTitle){
      let titleUpper = newTitle.toUpperCase();
      context.commit('setTitle',titleUpper);
    }
  },
  modules: {
  }
})
