<%_ if (hasTS) { _%>
import { expect } from 'chai'
<%_ if (!rootOptions.bare || !hasRouter) { _%>
import { shallowMount } from '@vue/test-utils'
<%_ } else { _%>
import { mount, createLocalVue } from '@vue/test-utils'
<%_ } _%>
<%_ if (!rootOptions.bare) { _%>
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      <%_ if (isVue3) { _%>
      props: { msg }
      <%_ } else { _%>
      propsData: { msg }
      <%_ } _%>
    })
    expect(wrapper.text()).to.include(msg)
  })
})
<%_ } else { _%>
import App from '@/App.vue'
<%_ if (!hasRouter) { _%>

describe('App', () => {
  it('should work', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.text()).to.include(`Welcome to Your Vue.js + TypeScript App`)
  })
})

<%_ } else {_%>
import VueRouter from 'vue-router'
import router from '@/router'

const localVue = createLocalVue()
localVue.use(VueRouter)

describe('App', () => {
  it('should render default route', () => {
    const wrapper = mount(App, {
      localVue,
      router
    })
    expect(wrapper.text()).to.include(`Welcome to Your Vue.js App`)
  })
})

<%_ } _%>
<%_ } _%>
<%_ } _%>
