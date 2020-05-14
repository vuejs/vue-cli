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

module.exports = new App()
