class App {
  /**
   * elements
   */
  get heading () { return $('h1') }

  /**
   * methods
   */
  open (path = '/') {
    browser.url(path)
  }
}

<%- hasTS ? 'export default new App()' : 'module.exports = new App()' %>

