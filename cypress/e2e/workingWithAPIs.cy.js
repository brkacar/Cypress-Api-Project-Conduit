/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

it('first test',{tags:'@smoke'} ,() => {

    // cy.intercept('GET', '**/tags', { fixture: 'tags.json' }).as('tagsGet')
    cy.intercept({ method: 'GET', pathname: 'tags' }, { fixture: 'tags.json' }).as('tagsGet')
    cy.intercept('GET', '**/articles*', { fixture: 'articles.json' }).as('articlesGet')
    cy.loginToApplication()

})

it('modify api response', {retries:2, tags:['@smoke','@likes']},() => {

    cy.intercept('GET', '**/articles*', req => {

        /// to modify the response 
        req.reply(res => {
            res.body.articles[0].favoritesCount = 8999999
            res.send() // to send the modified response to the application
        })

        /*    
            req.continue(res => {
                res.body.articles[0].favoritesCount = 333333    
            })
        */
    })    

    cy.uiLogin()
    cy.get('app-favorite-button').first().should('contain.text', '8999999')
})

it('waiting for apis', {retries:2},() => {
    cy.intercept('GET', '**/articles*').as('articlesGet')
    cy.uiLogin()
    //cy.get('app-article-list').should('contain.text', 'Bondar Academy')  //waiting until the articles contain the text 'Bondar Academy'
    cy.wait('@articlesGet').then(apiArticleObject => {
        expect(apiArticleObject.response.body.articles[0].title).to.contain('Bondar Academy')
    })
    cy.get('app-article-list').invoke('text').then(allArticleTexts => {
        expect(allArticleTexts).to.contain('Bondar Academy')
    })

})

it('delete article', () => {
    const title = faker.person.fullName()
    cy.loginToApplication() // to get the access token and set it to local storage and visit the application
    cy.get('@accessToken').then(accessToken => {
        
        cy.request({
            url: Cypress.env('apiUrl') + '/articles/',
            method: 'POST',
            body: {
                "article": {
                    "title": title,
                    "description": faker.person.jobDescriptor(),
                    "body": faker.lorem.paragraph(10),
                    "tagList": []
                }
            },
            headers: { 'Authorization': 'Token ' + accessToken }
        }).then(response => {
            expect(response.status).to.equal(201)
            expect(response.body.article.title).to.equal(title)
        })
    })


    cy.contains(title).click()
    cy.intercept('GET', '**/articles*').as('artcileApiCall')
    cy.contains('button', 'Delete Article').first().click()
    cy.wait('@artcileApiCall')
    cy.get('app-article-list').should('not.contain.text', title)
})

it('api testing', () => {
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
        const accessToken = 'Token ' + response.body.user.token

        cy.request({
            url: Cypress.env('apiUrl') + '/articles/',
            method: 'POST',
            body: {
                "article": {
                    "title": "Test title Cypress API Testing",
                    "description": "Some description",
                    "body": "This is a body",
                    "tagList": []
                }
            },
            headers: { 'Authorization': accessToken }
        }).then(response => {
            expect(response.status).to.equal(201)
            expect(response.body.article.title).to.equal('Test title Cypress API Testing')
        })

        cy.request({
            url: Cypress.env('apiUrl') + '/articles?limit=10&offset=0',
            method: 'GET',
            headers: { 'Authorization': accessToken }
        }).then(response => {
            expect(response.status).to.equal(200)
            expect(response.body.articles[0].title).to.equal('Test title Cypress API Testing')
            const slugID = response.body.articles[0].slug

            cy.request({
                url: `${Cypress.env('apiUrl')}/articles/${slugID}`,
                method: 'DELETE',
                headers: { 'Authorization': accessToken }
            }).then(response => {
                expect(response.status).to.equal(204)
            })
        })

        cy.request({
            url: Cypress.env('apiUrl') + '/articles?limit=10&offset=0',
            method: 'GET',
            headers: { 'Authorization': accessToken }
        }).then(response => {
            expect(response.status).to.equal(200)
            expect(response.body.articles[0].title).to.not.equal('Test title Cypress API Testing')
        })
    })

})