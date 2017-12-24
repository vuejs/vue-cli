import { shallow } from 'vue-test-utils'
import Hello from '@/components/Hello.vue'
<% if (assertionLibrary === 'expect') { %>
import { expect } from 'expect'
<% } %>
<% if (assertionLibrary === 'chai') { %>
import { expect } from 'chai'
<% } %>

describe('Hello.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallow(Hello, {
      context: { props: { msg } }
    })
    <% if (assertionLibrary === 'expect' || unit === 'jest') { %>
    expect(wrapper.text()).toBe(msg)
    <% } %>
    <% if (assertionLibrary === 'chai') { %>
    expect(wrapper.text()).to.equal(msg)
    <% } %>
    <% if (assertionLibrary === 'custom') { %>
    // assert wrapper.text() equals msg
    <% } %>
  })
})
