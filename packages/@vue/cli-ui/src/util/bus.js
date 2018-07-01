import Vue from 'vue'

const bus = new Vue()

export default {
  install (Vue) {
    Vue.prototype.$bus = (type, ...args) => {
      bus.$emit(type, ...args)
    }

    Vue.mixin({
      beforeCreate () {
        const busOptions = this.$options.bus
        if (busOptions) {
          this.$_bus = []

          const addListeners = map => {
            for (const event in map) {
              const handler = map[event].bind(this)
              bus.$on(event, handler)
              this.$_bus.push({ event, handler })
            }
          }

          if (Array.isArray(busOptions)) {
            busOptions.forEach(addListeners)
          } else {
            addListeners(busOptions)
          }
        }
      },

      beforeDestroy () {
        if (this.$_bus) {
          for (const listener of this.$_bus) {
            bus.$off(listener.event, listener.handler)
          }
        }
      }
    })

    Vue.config.optionMergeStrategies.bus = (parent, child, vm) => {
      if (Array.isArray(parent)) {
        if (Array.isArray(child)) {
          return parent.concat(child)
        } else {
          parent.push(child)
          return parent
        }
      } else if (Array.isArray(child)) {
        child.push(parent)
        return child
      } else if (parent && child) {
        return [parent, child]
      } else if (parent) {
        return parent
      }
      return child
    }
  }
}
