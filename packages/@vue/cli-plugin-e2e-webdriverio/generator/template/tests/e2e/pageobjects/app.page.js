class App {
  /**
   * elements
   */
  get heading () { return $('h1') }

  /**
   * methods
   */
  async open (path = '/') {
    await browser.url(path)
  }
}

<%- hasTS ? 'export default new App()' : 'module.exports = new App()' %>

