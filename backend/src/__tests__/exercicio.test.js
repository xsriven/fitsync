const request = require('supertest');
const app = require('../app');
const connection = require('../config/database'); 
const jwt = require('jsonwebtoken');

describe('Testes de Integração - Módulo de Exercícios', () => {
    let tokenPersonal;
    let tokenAluno;
    let idExercicioCriado; // Guarda o ID para testar a exclusão no final

    beforeAll(() => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'teste_secret_chave';
        
        tokenPersonal = jwt.sign(
            { id: 1, tipo: 'PERSONAL' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        tokenAluno = jwt.sign(
            { id: 2, tipo: 'ALUNO' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        // Garante a limpeza de qualquer resquício de teste do banco
        await connection.execute('DELETE FROM exercicios WHERE nome LIKE ?', ['%Teste Integração%']);
        await connection.end();
    });

    // TESTE 1: Fluxo perfeito de criação
    it('1. Deve cadastrar um novo exercicio com sucesso (Personal autenticado)', async () => {
        const novoExercicio = {
            nome: 'Supino Reto - Teste Integração',
            grupo_muscular: 'Peito',
            descricao: 'Execução clássica com barra de 20kg',
            url_execucao: 'https://www.youtube.com/watch?v=zdK07X87bAU'
        };

        const response = await request(app)
            .post('/exercicios')
            .set('Authorization', `Bearer ${tokenPersonal}`)
            .send(novoExercicio);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('mensagem', 'Exercicio cadastrado com sucesso!');
        expect(response.body).toHaveProperty('id');
        
        idExercicioCriado = response.body.id; // Armazena para os testes seguintes
    });

    // TESTE 2: Listagem geral do banco
    it('2. Deve listar todos os exercicios cadastrados no banco', async () => {
        const response = await request(app)
            .get('/exercicios')
            .set('Authorization', `Bearer ${tokenPersonal}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        
        const achouExercicio = response.body.find(e => e.nome === 'Supino Reto - Teste Integração');
        expect(achouExercicio).toBeDefined();
    });

    // TESTE 3: Teste de segurança - Bloqueio por falta de Token
    it('3. Deve rejeitar o cadastro de exercicio se nenhum token for enviado', async () => {
        const response = await request(app)
            .post('/exercicios')
            .send({ nome: 'Invasão - Teste Integração', grupo_muscular: 'Bíceps' });

        expect(response.status).toBe(401);
    });

    // TESTE 4: Teste de segurança - Bloqueio por nível de acesso
    it('4. Deve barrar o cadastro se o usuario logado for um ALUNO', async () => {
        const response = await request(app)
            .post('/exercicios')
            .set('Authorization', `Bearer ${tokenAluno}`)
            .send({
                nome: 'Fraude - Teste Integração',
                grupo_muscular: 'Perna',
                descricao: 'Tentativa de burlar pelo front'
            });

        expect(response.status).toBe(403);
    });

    // TESTE 5: Validação de dados obrigatórios
    it('5. Deve retornar erro se tentar cadastrar sem o nome do exercicio', async () => {
        const response = await request(app)
            .post('/exercicios')
            .set('Authorization', `Bearer ${tokenPersonal}`)
            .send({
                grupo_muscular: 'Costas',
                descricao: 'Falta o campo nome'
            });

        expect(response.status).toBe(400); 
    });

    // TESTE 6: Validação de link do YouTube incorreto
    it('6. Deve retornar erro se a URL enviada não for do YouTube', async () => {
        const response = await request(app)
            .post('/exercicios')
            .set('Authorization', `Bearer ${tokenPersonal}`)
            .send({
                nome: 'Rosca Direta - Teste Integração',
                grupo_muscular: 'Bíceps',
                url_execucao: 'https://google.com/video-fake' // Link inválido para a RegEx
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('erro', 'Por favor, insira uma URL valida do YouTube.');
    });

    // TESTE 7: Segurança na remoção - Bloqueio para Alunos
    it('7. Deve barrar a exclusão de um exercício se o usuário for um ALUNO', async () => {
        const response = await request(app)
            .delete(`/exercicios/${idExercicioCriado}`)
            .set('Authorization', `Bearer ${tokenAluno}`);

        expect(response.status).toBe(403);
    });

    // TESTE 8: Fluxo perfeito de exclusão
    it('8. Deve excluir o exercício com sucesso se for um Personal autenticado', async () => {
        const response = await request(app)
            .delete(`/exercicios/${idExercicioCriado}`)
            .set('Authorization', `Bearer ${tokenPersonal}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('mensagem', 'Exercicio excluido com sucesso!');
    });
});