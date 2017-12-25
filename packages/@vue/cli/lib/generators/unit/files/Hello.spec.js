import { shallow } from 'vue-test-utils'
<%_ if (assertionLibrary === 'expect') { _%>
import { expect } from 'expect'
<%_ } _%>
<%_ if (assertionLibrary === 'chai') { _%>
import { expect } from 'chai'
<%_ } _%>
import Hello from '@/components/Hello.vue'

describe('Hello.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallow(Hello, {
      context: { props: { msg } }
    })
    <%_ if (assertionLibrary === 'expect' || unit === 'jest') { _%>
    expect(wrapper.text()).toBe(msg)
    <%_ } _%>
    <%_ if (assertionLibrary === 'chai') { _%>
    expect(wrapper.text()).to.equal(msg)
    <%_ } _%>
    <%_ if (assertionLibrary === 'custom') { _%>
    // assert wrapper.text() equals msg
    <%_ } _%>
  })
})
