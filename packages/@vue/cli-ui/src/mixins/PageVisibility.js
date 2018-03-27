import Vue from 'vue'

const vm = new Vue({
  data: {
    documentVisible: !document.hidden,
    documentFocus: document.hasFocus()
  }
})

document.addEventListener('visibilitychange', () => {
  vm.documentVisible = !document.hidden
}, false)

window.addEventListener('focus', () => {
  vm.documentFocus = true
})

window.addEventListener('blur', () => {
  vm.documentFocus = false
})

// @vue/component
export default {
  computed: {
    documentVisible () {
      return vm.documentVisible
    },

    documentFocus () {
      return vm.documentFocus
    }
  }
}
