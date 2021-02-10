/// <reference types="Cypress" />

const faker = require('faker')

describe('Deve testar as rotas de produtos', () => {

    /* Os hooks before e after nesse cenário garantem a independência de cada teste  
    Com essa estratégia, é possível executar qualquer teste individualmente */

    let token, resCadastro

    before(() => {
        // Recebe o token na variável "tkn"
        cy.getToken().then(tkn => {
            token = tkn
        })

        //Recebe o response do cadastro de produtos na variável "resCadastro"
        cy.cadastraProduto().then(res => {
            resCadastro = res
        })
    })

    // Exclui o produto cadastrado após a execução dos scripts
    after(() => {
        cy.excluiProduto()
    })

    it('Deve listar o produto cadastrado', () => {

        //Invoca a fixture productData.json com os dados do produto
        cy.fixture('productData').then(produto => {
            // Faz a requisição GET no endpoint /produtos passando nome e preço do produto como chaves na query string
            cy.request({
                method: 'GET',
                url: `/produtos?nome=${produto.nome}&preco=${produto.preco}`
            }).then((res) => {

                //Valida o status code e body do response
                expect(res.status).to.equal(200)
                expect(res.body.produtos[0].nome).to.equal(produto.nome)
                expect(res.body.produtos[0].descricao).to.equal(produto.descricao)
            })
        })
    })


    it('Deve cadastrar um produto com sucesso', () => {

        // Valida o status code e body do response do produto cadastrado no before
        cy.get(resCadastro).then(() => {
            expect(resCadastro.status).to.be.equal(201)
            expect(resCadastro.body.message).to.be.equal("Cadastro realizado com sucesso")
            expect(resCadastro.body._id).to.be.not.empty
        })
    })

    it('Não deve cadastrar um produto já cadastrado', () => {

        //Invoca a fixture productData.json com os dados do produto
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
                failOnStatusCode: false
            }).then(res => {

                //Valida o status code e body do response
                expect(res.status).to.equal(400)
                expect(res.body.message).to.be.equal("Já existe produto com esse nome")
            })
        })
    })

    it('Não deve cadastrar um produto por ausência de autorização', () => {

        //Invoca a fixture productData.json com os dados do produto
        cy.fixture('productData').then(produto => {

            // Faz a requisição POST no endpoint /produtos passando um token inválido nos headers e o produto da fixture no body
            cy.request({
                method: 'POST',
                url: '/produtos',
                headers: { "Authorization": 'tokenInvalido' },
                body: {
                    "nome": produto.nome,
                    "preco": produto.preco,
                    "descricao": produto.descricao,
                    "quantidade": produto.quantidade
                },
                failOnStatusCode: false
            }).then(res => {

                //Valida o status code e body do response
                expect(res.status).to.be.equal(401)
                expect(res.body.message).to.be.equal("Token de acesso ausente, inválido, expirado ou usuário do token não existe mais")
            })
        })
    })

    it('Deve editar o produto cadastrado', () => {

        // Faz a requisição PUT no endpoint /produtos passando o id como chave na query string e token nos headers
        cy.request({
            method: 'PUT',
            headers: { "Authorization": token },
            url: `/produtos/${resCadastro.body._id}`,
            body: {
                // Usa a biblioteca "faker" para gerar registros aleatórios nos atributos "nome" e "descrição"
                "nome": `Produto Teste ${faker.random.uuid(1)}`,
                "preco": 10,
                "descricao": `Descrição ${faker.random.words(1)}`,
                "quantidade": 10
            }
        }).then(res => {
            //Valida o status code e body do response
            expect(res.status).to.be.equal(200)
            expect(res.body.message).to.be.equal("Registro alterado com sucesso")
        })
    })

    it('Deve cadastrar um produto através da tentativa de edição de um produto não cadastrado', () => {

        // Faz a requisição PUT no endpoint /produtos passando um id inválido como chave na query string e token nos headers
        cy.request({
            method: 'PUT',
            headers: { "Authorization": token },
            url: '/produtos/idInvalido',
            body: {
                // Usa a biblioteca "faker" para gerar registros aleatórios nos atributos "nome" e "descrição"
                "nome": `Produto Teste ${faker.random.words(3)}`,
                "preco": 10,
                "descricao": `Descrição ${faker.random.uuid(1)}`,
                "quantidade": 10
            }
        }).then(res => {
            //Valida o status code e body do response
            expect(res.status).to.be.equal(201)
            expect(res.body.message).to.be.equal("Cadastro realizado com sucesso")
            expect(res.body._id).to.be.not.empty
        })
    })

    it('Não deve editar um produto por falta de autenticação', () => {

        // Faz a requisição PUT no endpoint /produtos passando um token inválido no headers
        cy.request({
            method: 'PUT',
            headers: { "Authorization": 'tokenInvalido' },
            url: `/produtos/${resCadastro.body._id}`,
            body: {
                // Usa a biblioteca "faker" para gerar registros aleatórios nos atributos "nome" e "descrição"
                "nome": `Produto Teste ${faker.random.uuid(1)}`,
                "preco": 10,
                "descricao": `Descrição ${faker.random.words(1)}`,
                "quantidade": 10
            },
            failOnStatusCode: false
        }).then(res => {
            //Valida o status code e body do response
            expect(res.status).to.be.equal(401)
            expect(res.body.message).to.be.equal("Token de acesso ausente, inválido, expirado ou usuário do token não existe mais")
        })
    })

    it('Deve excluir o produto cadastrado', () => {

        // Faz a requisição DELETE no endpoint /produtos passando o id como chave na query string e token invalido nos headers
        cy.request({
            method: 'DELETE',
            headers: { "Authorization": token },
            url: `/produtos/${resCadastro.body._id}`
        }).then(res => {

            //Valida o status code e body do response
            expect(res.status).to.be.equal(200)
            expect(res.body.message).to.be.equal("Registro excluído com sucesso")
        })
    })

    it('Não deve excluir o produto por falta de parâmetro', () => {

        // Faz a requisição DELETE no endpoint /produtos passando o um id incorreto como chave na query string e token invalido nos headers
        cy.request({
            method: 'DELETE',
            headers: { "Authorization": token },
            url: `/produtos/idIncorreto`
        }).then(res => {

            //Valida o status code e body do response
            expect(res.status).to.be.equal(200)
            expect(res.body.message).to.be.equal("Nenhum registro excluído")
        })
    })

    it('Não deve excluir o produto por falta de autenticação', () => {

        // Faz a requisição DELETE no endpoint /produtos passando um token invalido nos headers
        cy.request({
            method: 'DELETE',
            headers: { "Authorization": 'tokenInvalido' },
            url: `/produtos/${resCadastro.body._id}`,
            failOnStatusCode: false
        }).then(res => {

            //Valida o status code e body do response
            expect(res.status).to.be.equal(401)
            expect(res.body.message).to.be.equal("Token de acesso ausente, inválido, expirado ou usuário do token não existe mais")
        })
    })
})