import Vue from 'vue'
import wrap from '@vue/web-component-wrapper'

// runtime shared by every component chunk
import 'css-loader/lib/css-base'
import 'vue-style-loader/lib/addStylesShadow'
import 'vue-loader/lib/runtime/component-normalizer'

import myWc from '~root/my-wc.vue'
window.customElements.define('my-wc', wrap(Vue, myWc))