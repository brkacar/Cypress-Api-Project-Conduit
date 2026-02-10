/// <reference types="cypress" />

const testData = [

    { username: '12', errorMessage: 'username is too short (minimum is 3 characters)', errorIsDisplayed: true },
    { username: '12345678901234567890', errorMessage: 'username', errorIsDisplayed: false },
    { username: '12345678901234567890', errorMessage: 'username', errorIsDisplayed: false },
    { username: '123456789012345678901', errorMessage: 'username is too long (maximum is 20 characters)', errorIsDisplayed: true },

]

testData.forEach(data => {
    it(`first test ${data.username}`, () => {
        cy.visit('/')
        cy.contains('Sign up').click()
        cy.get('input[placeholder="Username"]').type(data.username)
        cy.get('input[placeholder="Email"]').type("12")
        cy.get('input[placeholder="Password"]').type("12")
        cy.contains('button', 'Sign up').click()

        if (data.errorIsDisplayed) {
            cy.get('.error-messages li').should('contain.text', data.errorMessage)
        } else {
            cy.get('.error-messages li').should('not.contain.text', data.errorMessage)
        }
    })

})
