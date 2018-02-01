import Vue from 'vue'
import Component from '~entry'
import wrap from '@vue/web-component-wrapper'

const name = process.env.CUSTOM_ELEMENT_NAME

// CSS injection function exposed by vue-loader & vue-style-loader
const options = typeof Component === 'function' ? Component.options : Component
const styleInjectors = window[options.__shadowInjectId]
const onMounted = root => styleInjectors.forEach(inject => inject(root))

wrap(Vue, name, Component, onMounted)
