/// <reference types="Cypress" />

const faker = require('faker')

describe('Deve testar as rotas de usuários', () => {

    /* Os hooks before e after nesse cenário garantem a independência de cada teste  
    Com essa estratégia, é possível executar qualquer teste individualmente */

    let resCadastro

    // Cadastra o usuário antes da execução dos testes e salva o response na variável resCadastro
    before(() => {
        cy.cadastraUsuario().then(res => {
            resCadastro = res
        })
    })

    // Exclui o usuário após a execução dos testes
    after(() => {
        cy.excluiUsuario()
    })


    it('Deve cadastrar um usuário com sucesso', () => {

        //Invoca a fixture userData.json com os dados do usuário
        cy.fixture('userData').then(() => {

            // Valida o status code e body do response da requisição realizada no before
            cy.get(resCadastro).then(() => {
                expect(resCadastro.status).to.be.equal(201)
                expect(resCadastro.body.message).to.be.equal("Cadastro realizado com sucesso")
                expect(resCadastro.body._id).to.be.not.empty
            })
        })
    })

    it('Não deve cadastrar um usuário já cadastrado', () => {

        //Invoca a fixture userData.json com os dados do usuário
        cy.fixture('userData').then(usuario => {

            // Faz a requisição POST no endpoint /usuarios passando os dados do usuário já cadastrado no body
            cy.request({
                method: 'POST',
                url: '/usuarios',
                body: {
                    "nome": usuario.nome,
                    "email": usuario.email,
                    "password": usuario.password,
                    "administrador": usuario.administrador
                },
                failOnStatusCode: false
            }).as('response')

            // Valida o status code e body do response
            cy.get('@response').then(res => {
                expect(res.status).to.be.equal(400)
                expect(res.body.message).to.be.equal("Este email já está sendo usado")
            })
        })
    })

    it('Deve buscar o usuário cadastrado', () => {

        //Invoca a fixture userData.json com os dados do usuário
        cy.fixture('userData').then(usuario => {

            // Faz a requisição GET no endpoint /usuarios passando nome e e-mail como chaves na query string
            cy.request({
                method: 'GET',
                url: `/usuarios?nome=${usuario.nome}&email=${usuario.email}`
            }).as('response')

            // Valida o status code e body do response
            cy.get('@response').then(res => {
                expect(res.status).to.be.equal(200)
                expect(res.body.quantidade).to.be.equal(1)
                expect(res.body.usuarios[0].nome).to.be.equal(usuario.nome)
                expect(res.body.usuarios[0].email).to.be.equal(usuario.email)
                expect(res.body.usuarios[0].administrador).to.be.equal(usuario.administrador)
                expect(res.body.usuarios[0]._id).to.be.not.empty
            })
        })
    })

    it('Não deve editar o usuário por e-mail já cadastrado', () => {

        //Invoca a fixture userData.json com os dados do usuário
        cy.fixture('userData').then(usuario => {
            cy.request({
                method: 'PUT',
                url: `/usuarios/${resCadastro.body._id}`,
                body: {
                    "nome": usuario.nome,
                    "email": usuario.email,
                    "password": usuario.senha,
                    "administrador": usuario.administrador
                },
                failOnStatusCode: false
            }).as('response')
        })

        // Valida o status code e body do response
        cy.get('@response').then(res => {
            expect(res.status).to.be.equal(400)
        })
    })

    it('Deve editar o usuário cadastrado', () => {

        //Invoca a fixture userData.json com os dados do usuário
        cy.fixture('userData').then(usuario => {

            // Faz a requisição PUT no endpoint /usuarios passando o _id do usuário
            cy.request({
                method: 'PUT',
                url: `/usuarios/${resCadastro.body._id}`,
                body: {
                    "nome": usuario.nome,
                    // Utiliza a biblioteca "faker" para gerar um e-mail aleatório
                    "email": `${faker.random.uuid(1)}@email.com`,
                    "password": usuario.password,
                    "administrador": "false"
                }
            }).as('response')

            // Valida o status code e body do response
            cy.get('@response').then(res => {
                expect(res.status).to.be.equal(200)
                expect(res.body.message).to.be.equal("Registro alterado com sucesso")
            })
        })
    })

    it('Deve cadastrar um usuário através da tentativa de edição de um usuário não cadastrado', () => {

        // Faz a requisição PUT no endpoint /usuarios passando um _id de usuário inválido
        cy.request({
            method: 'PUT',
            url: `/usuarios/idInvalido`,
            body: {
                // Utiliza a biblioteca "faker" para preencher os dados de forma aleatória
                "nome": `${faker.random.uuid(3)}`,
                "email": `${faker.random.uuid(1)}@email.com`,
                "password": `${faker.random.words(1)}`,
                "administrador": "false"
            }
        }).as('response')

        // Valida o status code e body do response
        cy.get('@response').then(res => {
            expect(res.status).to.be.equal(201)
            expect(res.body.message).to.be.equal("Cadastro realizado com sucesso")
            expect(res.body._id).to.be.not.empty
        })
    })


    it('Deve excluir o usuário cadastrado', () => {

        // Consulta o usuário e passa o _id na requisição DELETE
        cy.consultaUsuario().then(res => {
            cy.request({
                method: 'DELETE',
                url: `/usuarios/${res.body.usuarios[0]._id}`
            }).as('responseDelete')

            //Valida o status code e body do response
            cy.get('@responseDelete').then(res => {
                expect(res.status).to.be.equal(200)
                expect(res.body.message).to.be.equal("Registro excluído com sucesso")
            })
        })
    })

    it('Não deve excluir usuário por parâmetro inválido', () => {

        // Faz a requisição DELETE no endpoint /usuarios passando uma string representando um ID inválido
        cy.request({
            method: 'DELETE',
            url: '/usuarios/idInvalido'
        }).as('response')

        // Valida o status code e body do response
        cy.get('@response').then(res => {
            expect(res.status).to.be.equal(200)
            expect(res.body.message).to.be.equal("Nenhum registro excluído")
        })
    })
})