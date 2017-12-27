import { shallow } from 'vue-test-utils'
<%_ if (options.assertionLibrary === 'expect' && options.unit !== 'jest') { _%>
import { expect } from 'expect'
<%_ } _%>
<%_ if (options.assertionLibrary === 'chai') { _%>
import { expect } from 'chai'
<%_ } _%>
import HelloWorld from '@/components/HelloWorld.vue'

describe('Hello.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallow(HelloWorld, {
      context: { props: { msg } }
    })
    <%_ if (options.assertionLibrary === 'expect' || options.unit === 'jest') { _%>
    expect(wrapper.text()).toBe(msg)
    <%_ } else if (options.assertionLibrary === 'chai') { _%>
    expect(wrapper.text()).to.equal(msg)
    <%_ } else { _%>
    // assert wrapper.text() equals msg
    <%_ } _%>
  })
})
