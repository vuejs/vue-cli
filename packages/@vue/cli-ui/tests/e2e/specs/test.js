// https://docs.cypress.io/api/introduction/api.html

describe('Vue project manager', () => {
  it('Switches between tabs', () => {
    cy.visit('/project/select')
    cy.get('.project-select-list').should('be.visible')
    cy.get('.tab-button').eq(1).click()
    cy.get('.folder-explorer').should('be.visible')
    cy.get('.tab-button').eq(2).click()
    cy.get('.folder-explorer').should('be.visible')
    cy.get('.tab-button').eq(0).click()
    cy.get('.project-select-list').should('be.visible')
  })

  it('Creates a new project (manual)', () => {
    cy.visit('/project/select')
    cy.get('.tab-button').eq(1).click()
    cy.get('.folder-explorer').should('be.visible')
    cy.get('.create-project').click()
    cy.get('.change-folder').click()
    cy.get('.create').within(() => {
      cy.get('.folder-explorer').should('be.visible')
      cy.get('.current-path').click()
      cy.get('.path-input input').clear().type(Cypress.env('cwd') + '{enter}')
      cy.get('.create-project').click()
    })
    cy.get('.details').within(() => {
      cy.get('.app-name input').type('cli-ui-test')
      cy.get('.force').click()
      cy.get('.next').click()
    })
    cy.get('.presets').within(() => {
      cy.get('[data-id="__manual__"]').click()
      cy.get('.next').click()
    })
    cy.get('.features').within(() => {
      cy.get('[data-id="pwa"] .bullet').click()
      cy.get('[data-id="router"] .bullet').click()
      cy.get('[data-id="vuex"] .bullet').click()
      cy.get('[data-id="css-preprocessor"] .bullet').click()
      cy.get('[data-id="use-config-files"] .bullet').click()
      cy.get('.next').click()
    })
    cy.get('.config').within(() => {
      cy.get('.vue-ui-select').eq(0).click()
    })
    cy.get('.vue-ui-select-button').eq(1).click()
    cy.get('.config').within(() => {
      cy.get('.vue-ui-select').eq(1).click()
    })
    cy.get('.vue-ui-select-button').eq(5).click()
    cy.get('.config').within(() => {
      cy.get('.vue-ui-switch').click({ multiple: true })
      cy.get('.next').click()
    })
    cy.get('.save-preset-modal').within(() => {
      cy.get('.continue').click()
    })
    cy.get('.loading-screen .vue-ui-loading-indicator').should('be.visible')
    cy.get('.project-home', { timeout: 1000000 }).should('be.visible')
    cy.get('.current-project').should('have.text', 'cli-ui-test')
  })
})
