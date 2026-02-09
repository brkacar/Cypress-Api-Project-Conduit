/// <reference types="cypress" />

it('first test', () => {

    // cy.intercept('GET', '**/tags', { fixture: 'tags.json' }).as('tagsGet')
    cy.intercept({ method: 'GET', pathname: 'tags' }, { fixture: 'tags.json' }).as('tagsGet')
    cy.intercept('GET', '**/articles*', { fixture: 'articles.json' }).as('articlesGet')
    cy.loginToApplication()

})

it('modify api response', () => {

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

    cy.loginToApplication()
    cy.get('app-favorite-button').first().should('contain.text', '8999999')
})

it('waiting for apis', () => {
    cy.intercept('GET', '**/articles*').as('articlesGet')
    cy.loginToApplication()
    //cy.get('app-article-list').should('contain.text', 'Bondar Academy')  //waiting until the articles contain the text 'Bondar Academy'
    cy.wait('@articlesGet')
    cy.get('app-article-list').invoke('text').then(allArticleTexts => {
        expect(allArticleTexts).to.contain('Bondar Academy')
    })

})

it('delete article', () => {
    cy.loginToApplication()
    cy.get('@accessToken').then(accessToken => {

        cy.request({
            url: 'https://conduit-api.bondaracademy.com/api/articles/',
            method: 'POST',
            body: {
                "article": {
                    "title": "Test title Cypress",
                    "description": "Some description",
                    "body": "This is a body",
                    "tagList": []
                }
            },
            headers: { 'Authorization': 'Token ' + accessToken }
        }).then(response => {
            expect(response.status).to.equal(201)
            expect(response.body.article.title).to.equal('Test title Cypress')
        })
    })


    cy.contains('Test title Cypress').click()
    cy.intercept('GET', '**/articles*').as('artcileApiCall')
    cy.contains('button', 'Delete Article').first().click()
    cy.wait('@artcileApiCall')
    cy.get('app-article-list').should('not.contain.text', 'Test title Cypress')
})

it('api testing', () => {
    cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/users/login',
        method: 'POST',
        body: {
            "user": {
                "email": "brkacaran@gmail.com",
                "password": "Test@1234"
            }
        }
    }).then(response => {
        expect(response.status).to.equal(200)
        const accessToken = 'Token ' + response.body.user.token

        cy.request({
            url: 'https://conduit-api.bondaracademy.com/api/articles/',
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
            url: 'https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',
            method: 'GET',
            headers: { 'Authorization': accessToken }
        }).then(response => {
            expect(response.status).to.equal(200)
            expect(response.body.articles[0].title).to.equal('Test title Cypress API Testing')
            const slugID = response.body.articles[0].slug

            cy.request({
                url: `https://conduit-api.bondaracademy.com/api/articles/${slugID}`,
                method: 'DELETE',
                headers: { 'Authorization': accessToken }
            }).then(response => {
                expect(response.status).to.equal(204)
            })
        })

        cy.request({
            url: 'https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',
            method: 'GET',
            headers: { 'Authorization': accessToken }
        }).then(response => {
            expect(response.status).to.equal(200)
            expect(response.body.articles[0].title).to.not.equal('Test title Cypress API Testing')
        })
    })

})