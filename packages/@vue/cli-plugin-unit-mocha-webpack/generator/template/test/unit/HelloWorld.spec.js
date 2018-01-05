<%_ if (options.assertionLibrary === 'expect') { _%>
import expect from 'expect'
<%_ } _%>
<%_ if (options.assertionLibrary === 'chai') { _%>
import { expect } from 'chai'
<%_ } _%>
import { shallow } from 'vue-test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('Hello.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallow(HelloWorld, {
      propsData: { msg }
    })
    <%_ if (options.assertionLibrary === 'expect') { _%>
    expect(wrapper.text()).toMatch(msg)
    <%_ } else if (options.assertionLibrary === 'chai') { _%>
    expect(wrapper.text()).to.include(msg)
    <%_ } else { _%>
    // assert wrapper.text() equals msg
    <%_ } _%>
  })
})
