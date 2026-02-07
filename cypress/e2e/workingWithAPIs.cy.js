/// <reference types="cypress" />

it('first test', () => {

    cy.intercept('GET','**/tags',{fixture:'tags.json'}).as('tagsGet')
    cy.intercept('GET','**/articles*',{fixture:'articles.json'}).as('articlesGet')
    cy.loginToApplication()

})