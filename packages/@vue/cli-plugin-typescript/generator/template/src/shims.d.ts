declare var process: {
  env: { [key: string]: string }
};

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}
