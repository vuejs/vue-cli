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
      cy.get('[data-testid="__manual__"]').click()
      cy.get('.next').click()
    })
    cy.get('.features').within(() => {
      cy.get('[data-testid="pwa"] .bullet').click()
      cy.get('[data-testid="router"] .bullet').click()
      cy.get('[data-testid="vuex"] .bullet').click()
      cy.get('[data-testid="css-preprocessor"] .bullet').click()
      cy.get('[data-testid="use-config-files"] .bullet').click()
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
    cy.get('.project-home', { timeout: 250000 }).should('be.visible')
    cy.get('.current-project').should('have.text', 'cli-ui-test')
  })

  it('Favorites the project', () => {
    cy.visit('/project/select')
    cy.get('.project-select-list-item').eq(0).get('[data-testid="favorite-button"]').click()
    cy.get('.cta-text.favorite').should('be.visible')
    cy.get('.project-select-list-item').eq(0).get('[data-testid="favorite-button"]').click()
    cy.get('.cta-text.favorite').should('not.exist')
  })

  it('Imports a project', () => {
    cy.visit('/project/select')
    cy.get('.project-select-list-item').eq(0).get('[data-testid="delete-button"]').click()
    cy.get('.project-select-list-item').should('not.exist')
    cy.get('.tab-button').eq(2).click()
    cy.get('.import').within(() => {
      cy.get('.folder-explorer').should('be.visible')
      cy.get('.current-path').click()
      cy.get('.path-input input').clear().type(Cypress.env('cwd') + '{enter}')
      cy.get(`.folder-explorer-item:contains('cli-ui-test')`).click()
      cy.get('.import-project').should('not.have.class', 'disabled').click()
    })
    cy.get('.project-home').should('be.visible')
    cy.get('.current-project').should('have.text', 'cli-ui-test')
  })
})

describe('Plugins', () => {
  it('Should display the plugins', () => {
    cy.visit('/')
    cy.get('.project-plugin-item').should('have.length', 2)
  })

  it('Should add a plugin', () => {
    cy.visit('/')
    cy.get('[data-testid="add-plugin"]').click()
    cy.get('.project-plugins-add').should('be.visible')
    // Search
    cy.get('.package-search-item:contains("@vue/cli-plugin-pwa")').should('be.visible')
    cy.get('.instant-search-input input').clear().type('unit-jest')
    cy.get('.package-search-item:contains("@vue/cli-plugin-pwa")').should('be.not.visible')
    cy.get('.package-search-item:contains("@vue/cli-plugin-unit-jest")').should('be.visible')
    cy.get('.instant-search-input input').clear()
    // Install
    cy.get('.package-search-item:contains("@vue/cli-plugin-pwa") [data-testid="name"]').should('be.visible').click()
    cy.get('[data-testid="download-plugin"]:contains("@vue/cli-plugin-pwa")').should('not.have.class', 'disabled').click()
    cy.get('.loading-screen .vue-ui-loading-indicator').should('be.visible')
    cy.get('.prompts-list', { timeout: 250000 }).should('be.visible')
    cy.get('[data-testid="finish-install"]').should('not.have.class', 'disabled').click()
    cy.get('.project-plugin-item').should('have.length', 3)
  })
})
