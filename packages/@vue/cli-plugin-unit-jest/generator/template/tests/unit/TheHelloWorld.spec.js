<%_ if (!hasTS) { _%>
import { shallowMount } from '@vue/test-utils'
import TheHelloWorld from '@/components/TheHelloWorld.vue'

describe('TheHelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(TheHelloWorld, {
      propsData: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
<%_ } _%>
