<%_ if (!hasTS) { _%>
import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
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

describe('App', () => {
  it('should work', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.text()).to.include(`Welcome to Your Vue.js App`)
  })
})
<%_ } _%>
<%_ } _%>
