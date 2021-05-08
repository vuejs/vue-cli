/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

type OneOf<T extends string[]> = T[number]

type Directive<
  Exp,
  Arg extends string | undefined = undefined,
  Modifiers extends string[] = never[]
  > = [Exp, Arg, OneOf<Modifiers>[]] | [Exp, OneOf<Modifiers>[]] | Exp | [Exp] | [Exp, Arg]


declare namespace JSX {
  interface IntrinsicAttributes {
    'v-show': Directive<boolean>;
  }
}
