/// <reference types="Cypress" />

describe('Deve testar as rotas de login', () => {

    it('Deve realizar login com sucesso', () => {

        // Faz a requisição POST no endpoint /login passando um usuário válido no body
        cy.request({
            method: 'POST',
            url: '/login',
            body: {
                "email": "fulano@qa.com",
                "password": "teste"
            }
        }).as('response')

        // Valida o status code e body do response
        cy.get('@response').then(res => {
            expect(res.status).to.be.equal(200)
            expect(res.body.message).to.be.equal("Login realizado com sucesso")
            expect(res.body.authorization).to.be.not.empty
        })
    })

    it('Não deve realizar login com usuário ou senha inválidos', () => {

        // Faz a requisição POST no endpoint /login passando um usuário inválido no body
        cy.request({
            method: 'POST',
            url: '/login',
            body: {
                "email": "emailinvalido@qa.com",
                "password": "teste"
            },
            failOnStatusCode: false
        }).as('response')

        // Valida o status code e body do response
        cy.get('@response').then(res => {
            expect(res.status).to.be.equal(401)
            expect(res.body.message).to.be.equal("Email e/ou senha inválidos")
        })
    })
})