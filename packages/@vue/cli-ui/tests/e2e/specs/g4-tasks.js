describe('Tasks', () => {
  it('Displays tasks', () => {
    cy.visit('/tasks')
    cy.get('.task-item:contains("serve")').should('be.visible')
    cy.get('.task-item:contains("build")').should('be.visible')
    cy.get('.task-item:contains("lint")').should('be.visible')
  })

  it('Run serve task', () => {
    cy.visit('/tasks')
    cy.get('.task-item:contains("serve")').click()
    cy.get('[data-testid="run-task"]').click()
    cy.get('.task-item:contains("serve").status-running')
    cy.wait(500)
    cy.get('.build-progress .done', { timeout: 250000 }).should('be.visible')
    cy.wait(200)
    cy.get('[data-testid="stop-task"]').click()
    cy.get('.task-item:contains("serve").status-terminated')
  })

  it('Run build task', () => {
    cy.visit('/tasks')
    cy.get('.task-item:contains("build")').click()
    cy.get('[data-testid="run-task"]').click()
    cy.get('.task-item:contains("build").status-running')
    cy.wait(500)
    cy.get('.build-progress .done', { timeout: 250000 }).should('be.visible')
    cy.get('.task-item:contains("build").status-done', { timeout: 25000 })
  })
})
