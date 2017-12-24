import { shallow } from 'vue-test-utils'
import Hello from '@/components/Hello.vue'
{{#if_eq mochaAssertionLibrary 'expect'}}
import { expect } from 'expect'
{{/if_eq}}
{{#if_eq mochaAssertionLibrary 'chai'}}
import { expect } from 'chai'
{{/if_eq}}

describe('Hello.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallow(Hello, {
      context: { props: { msg } }
    })
    {{#if_eq mochaAssertionLibrary 'expect'}}
    expect(wrapper.text()).toBe(msg)
    {{/if_eq}}
    {{#if_eq mochaAssertionLibrary 'chai'}}
    expect(wrapper.text()).to.equal(msg)
    {{/if_eq}}
    {{#if_eq mochaAssertionLibrary 'custom'}}
    // assert wrapper.text() equals msg
    {{/if_eq}}
  })
})
