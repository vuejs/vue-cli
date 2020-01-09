describe('Plugins', () => {
  it('Should display the plugins', () => {
    cy.visit('/plugins')
    cy.get('.project-plugin-item').should('have.length', 6)
  })

  it('Should add a plugin', () => {
    cy.visit('/plugins')
    cy.get('[data-testid="add-plugin"]').click()
    cy.get('.project-plugins-add').should('be.visible')
    // Search
    cy.get('.instant-search-input input').clear().type('pwa')
    cy.get('.package-search-item:contains("@vue/cli-plugin-pwa")').should('be.visible')
    cy.get('.instant-search-input input').clear().type('unit-jest')
    cy.get('.package-search-item:contains("@vue/cli-plugin-pwa")').should('be.not.visible')
    cy.get('.package-search-item:contains("@vue/cli-plugin-unit-jest")').should('be.visible')
    cy.get('.instant-search-input input').clear()
    // Install
    cy.get('.instant-search-input input').clear().type('pwa')
    cy.get('.package-search-item:contains("@vue/cli-plugin-pwa") [data-testid="name"]').should('be.visible').click()
    cy.get('[data-testid="download-plugin"]:contains("@vue/cli-plugin-pwa")').should('not.have.class', 'disabled').click()
    cy.get('.loading-screen .vue-ui-loading-indicator').should('be.visible')
    cy.get('.prompts-list', { timeout: 250000 }).should('be.visible')
    cy.get('[data-testid="finish-install"]').should('not.have.class', 'disabled').click()
    cy.get('.loading-screen .vue-ui-loading-indicator', { timeout: 3000 }).should('be.visible')
    cy.get('.file-diff-view', { timeout: 250000 }).should('be.visible')
    cy.get('[data-testid="skip-button"]', { timeout: 3000 })
      .should('be.visible')
      .should('not.have.class', 'disabled')
      .click()
    cy.get('.project-plugin-item').should('have.length', 6)
  })
})
