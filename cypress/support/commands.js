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
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('getToken', () => {
    cy.request({
        // Faz a requisição POST no endpoint /login passando os dados de um usuário já pré-cadastrado no sistema e retorna o token
        method: 'POST',
        url: '/login',
        body: {
            email: "fulano@qa.com",
            password: "teste"
        }
    }).its('body.authorization').then(token => {
        Cypress.env('token', token)
        return token
    })
})

Cypress.Commands.add('cadastraUsuario', () => {
    cy.fixture('userData').then(usuario => {
        // Faz a requisição POST no endpoint /usuarios passando os dados da fixture no body e retorna o response
        cy.request({
            method: 'POST',
            url: '/usuarios',
            body: {
                "nome": usuario.nome,
                "email": usuario.email,
                "password": usuario.password,
                "administrador": usuario.administrador
            }
        }).then(res => {
            return res
        })
    })
})

Cypress.Commands.add('consultaUsuario', () => {
    //Invoca a fixture userData.json com os dados do usuário
    cy.fixture('userData').then(usuario => {

        // Faz a requisição GET no endpoint /usuarios passando nome e e-mail como chaves na query string
        cy.request({
            method: 'GET',
            url: `/usuarios?nome=${usuario.nome}`
        }).then(res => {
            return res
        })
    })
})

Cypress.Commands.add('excluiUsuario', () => {
    cy.fixture('userData').then(usuario => {
        // Faz a requisição GET no endpoint /usuarios passando nome e e-mail como chaves na query string
        cy.request({
            method: 'GET',
            url: `/usuarios?nome=${usuario.nome}&email=${usuario.email}`
        }).as('response').then(res => {

            // Se body.quantidade = 1 significa que o usuário está cadastrado, então exclui o usuário
            if (res.body.quantidade === 1) {

                // Faz a requisição DELETE no endpoint /usuarios passando o _id como chave na query string
                cy.get('@response').then(res => {
                    cy.request({
                        method: 'DELETE',
                        url: `/usuarios/${res.body.usuarios[0]._id}`
                    })
                })
            }
        })
    })
})

Cypress.Commands.add('cadastraProduto', () => {
    let token
    cy.getToken().then(tkn => {
        token = tkn
    })

    cy.fixture('productData').then(produto => {
        // Faz a requisição POST no endpoint /produtos passando o token nos headers e o produto da fixture no body
        cy.request({
            method: 'POST',
            url: '/produtos',
            headers: { "Authorization": token },
            body: {
                "nome": produto.nome,
                "preco": produto.preco,
                "descricao": produto.descricao,
                "quantidade": produto.quantidade
            },
        }).then(res => {
            return res
        })
    })
})

Cypress.Commands.add('excluiProduto', () => {
    let token
    cy.getToken().then(tkn => {
        token = tkn
    })

    cy.fixture('productData').then(produto => {
        // Faz a requisição GET no endpoint /usuarios passando nome e e-mail como chaves na query string
        cy.request({
            method: 'GET',
            url: `/produtos?nome=${produto.nome}&preco=${produto.preco}`,
        }).as('response').then(res => {

            // Se body.quantidade = 1 significa que o produto está cadastrado, então exclui o produto
            if (res.body.quantidade === 1) {

                // Faz a requisição DELETE no endpoint /usuarios passando o _id como chave na query string
                cy.get('@response').then(res => {
                    cy.request({
                        method: 'DELETE',
                        headers: { "Authorization": token },
                        url: `/produtos/${res.body.produtos[0]._id}`
                    })
                })
            }
        })
    })
})