const request = require('supertest');
const app = require('../app');
const connection = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

describe('Testes de Integração - Módulo de Alunos', () => {
    let tokenPersonal;
    let tokenAluno;
    let idAlunoCriado;
    let idPersonalTeste;

    beforeAll(async () => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'teste_secret_chave';

        await connection.execute('DELETE FROM usuarios WHERE email = ?', ['personal_int_aluno@fitsync.com']);

        const senhaHash = await bcrypt.hash('123456', 10);
        const [userRes] = await connection.execute(
            `INSERT INTO usuarios (nome, email, senha, tipo_usuario, status) 
             VALUES (?, ?, ?, ?, ?)`,
            ['Personal Teste Integracao', 'personal_int_aluno@fitsync.com', senhaHash, 'PERSONAL', 'ATIVO']
        );
        idPersonalTeste = userRes.insertId;

        // CORREÇÃO: Incluído o campo obrigatório 'registro_profissional' exigido pela sua tabela
        await connection.execute(
            'INSERT INTO personal_trainers (id_usuario, registro_profissional) VALUES (?, ?) ON DUPLICATE KEY UPDATE id_usuario=id_usuario',
            [idPersonalTeste, 'CREF-TESTE-123']
        );

        tokenPersonal = jwt.sign(
            { id: idPersonalTeste, tipo: 'PERSONAL', tipo_usuario: 'PERSONAL' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        tokenAluno = jwt.sign(
            { id: 999, tipo: 'ALUNO', tipo_usuario: 'ALUNO' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        if (idAlunoCriado) {
            await connection.execute('DELETE FROM anamneses WHERE aluno_id = ?', [idAlunoCriado]);
            await connection.execute('DELETE FROM evolucao_fisica WHERE aluno_id = ?', [idAlunoCriado]);
            await connection.execute('DELETE FROM alunos WHERE id_usuario = ?', [idAlunoCriado]);
            await connection.execute('DELETE FROM usuarios WHERE id = ?', [idAlunoCriado]);
        }
        await connection.execute('DELETE FROM personal_trainers WHERE id_usuario = ?', [idPersonalTeste]);
        await connection.execute('DELETE FROM usuarios WHERE id = ?', [idPersonalTeste]);
        await connection.end();
    });

    it('1. Deve cadastrar um aluno completo com anamnese e avaliação corporal (Personal autenticado)', async () => {
        const novoAluno = {
            nome: 'Aluno Teste Integração',
            email: 'aluno_integracao@fitsync.com',
            senha: 'password123',
            objetivo: 'Hipertrofia',
            data_nascimento: '1995-05-20',
            peso: 82.5,
            altura: 1.78,
            historico_lesoes: 'Nenhum registro crítico',
            restricoes_fisicas: 'Nenhuma restrição',
            condicoes_medicas: 'Nenhuma condição mapeada'
        };

        const response = await request(app)
            .post('/alunos')
            .set('Authorization', `Bearer ${tokenPersonal}`)
            .send(novoAluno);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('mensagem', 'Aluno, avaliacao corporal e ficha de anamnese cadastrados com sucesso!');

        const [rows] = await connection.execute('SELECT id FROM usuarios WHERE email = ?', ['aluno_integracao@fitsync.com']);
        if (rows.length > 0) {
            idAlunoCriado = rows[0].id;
        }
    });

    it('2. Deve recusar o cadastro se o e-mail já estiver em uso no sistema', async () => {
        const alunoDuplicado = {
            nome: 'Outro Aluno',
            email: 'aluno_integracao@fitsync.com',
            senha: 'password123',
            peso: 70,
            altura: 1.70,
            data_nascimento: '1998-02-10'
        };

        const response = await request(app)
            .post('/alunos')
            .set('Authorization', `Bearer ${tokenPersonal}`)
            .send(alunoDuplicado);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('erro', 'Email ja cadastrado');
    });

    it('3. Deve barrar o cadastro de aluno se os limites corporais forem incoerentes', async () => {
        const alunoInvalido = {
            nome: 'Aluno Gigante',
            email: 'aluno_gigante@fitsync.com',
            senha: 'password123',
            data_nascimento: '1995-05-20',
            peso: 450,
            altura: 1.78
        };

        const response = await request(app)
            .post('/alunos')
            .set('Authorization', `Bearer ${tokenPersonal}`)
            .send(alunoInvalido);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('erro', 'Valores corporais fora dos limites permitidos (Peso: 20-300kg, Altura: 1.00-2.50m).');
    });

    it('4. Deve permitir que o Personal Trainer busque o prontuário do aluno cadastrado', async () => {
        const response = await request(app)
            .get(`/alunos/${idAlunoCriado}`)
            .set('Authorization', `Bearer ${tokenPersonal}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('nome', 'Aluno Teste Integração');
        expect(response.body).toHaveProperty('historico_lesoes');
        expect(response.body).toHaveProperty('checkins');
    });

    it('5. Deve barrar a busca do prontuário se um Aluno tentar ver os dados de outro Aluno', async () => {
        const response = await request(app)
            .get(`/alunos/${idAlunoCriado}`)
            .set('Authorization', `Bearer ${tokenAluno}`);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('erro');
    });

    it('6. Deve desativar o aluno com sucesso no sistema (Soft Delete)', async () => {
        const response = await request(app)
            .put(`/alunos/${idAlunoCriado}/desativar`)
            .set('Authorization', `Bearer ${tokenPersonal}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('mensagem', 'Aluno desativado com sucesso!');

        const [rows] = await connection.execute('SELECT status FROM usuarios WHERE id = ?', [idAlunoCriado]);
        expect(rows[0].status).toBe('INATIVO');
    });
});