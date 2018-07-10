describe('Configurations', () => {
  it('Displays configurations', () => {
    cy.visit('/configuration')
    cy.get('.configuration-item').should('have.length', 3)
  })
})
