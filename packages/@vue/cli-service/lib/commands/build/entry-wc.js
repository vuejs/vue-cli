import Vue from 'vue'
import wrap from '@vue/web-component-wrapper'
import Component from '~entry'

window.customElements.define(
  process.env.CUSTOM_ELEMENT_NAME,
  wrap(Vue, Component)
)
