// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// set USER_NAME=brkacaran@gmail.com & set PASSWORD=Test@1234 && npm run cy_run_dev
// npm install cypress-multi-reporters mocha-junit-reporter --save-dev
// npm i --save-dev cypress-mochawesome-reporter
//docker build -t cypress-tests -f Dockerfile .
// npx cypress run --expose grepTags="@smoke",grepFilterSpecs=true
//npx cypress run --expose grepTags="@smoke",grepOmitFiltered=true
//npx cypress run --expose grepTags="@smoke",grepOmitFiltered=true,burn=5  //5 times


Cypress.Commands.add('loginToApplication', () => {

    cy.request({
        url: Cypress.env('apiUrl') + '/users/login',
        method: 'POST',
        body: {
            "user": {
                "email": Cypress.env('username'),
                "password": Cypress.env('password')
            }
        }
    }).then(response => {
        expect(response.status).to.equal(200)
        const accessToken = response.body.user.token
        cy.wrap(accessToken).as('accessToken')
        cy.visit('/', {
            onBeforeLoad(win) {
                win.localStorage.setItem('jwtToken', accessToken)
            }
        })
        
    })

    Cypress.Commands.add('uiLogin',()=> {
        cy.session('user', () => {
            cy.visit('/')
            cy.contains('Sign in').click()
            cy.get('input[placeholder="Email"]').type(Cypress.env('username'))
            cy.get('input[placeholder="Password"]').type(Cypress.env('password'))
            cy.contains('button','Sign in').click()
            cy.location('pathname').should('eq', '/')
        },{
            cacheAcrossSpecs: true
        })
        cy.visit('/')
    })

})