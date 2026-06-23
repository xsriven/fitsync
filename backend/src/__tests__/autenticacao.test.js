const request = require('supertest');
const app = require('../app');
const connection = require('../config/database');
const bcrypt = require('bcrypt');

describe('Testes de Integração - Módulo de Autenticação', () => {
    beforeAll(async () => {
        await connection.execute('DELETE FROM usuarios WHERE email = ?', ['auth_personal@fitsync.com']);
        
        const senhaHash = await bcrypt.hash('senha_personal_123', 10);
        await connection.execute(
            `INSERT INTO usuarios (nome, email, senha, tipo_usuario, status) 
             VALUES (?, ?, ?, ?, ?)`,
            ['Personal Teste Autenticacao', 'auth_personal@fitsync.com', senhaHash, 'PERSONAL', 'ATIVO']
        );
    });

    afterAll(async () => {
        await connection.execute('DELETE FROM usuarios WHERE email = ?', ['auth_personal@fitsync.com']);
        await connection.end();
    });

    it('1. Deve autenticar com sucesso e retornar um token JWT válido', async () => {
        const credenciais = {
            email: 'auth_personal@fitsync.com',
            password: 'senha_personal_123',
            tipo_usuario: 'PERSONAL'
        };

        const response = await request(app)
            .post('/login')
            .send(credenciais);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('usuario');
        expect(response.body.usuario).toHaveProperty('tipo', 'PERSONAL');
    });

    it('2. Deve recusar o login se a senha estiver incorreta', async () => {
        const credenciaisErradas = {
            email: 'auth_personal@fitsync.com',
            password: 'senha_errada_456',
            tipo_usuario: 'PERSONAL'
        };

        const response = await request(app)
            .post('/login')
            .send(credenciaisErradas);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('erro');
    });

    it('3. Deve recusar o login se o e-mail não existir no sistema', async () => {
        const credenciaisInexistentes = {
            email: 'inexistente@fitsync.com',
            password: 'any_password',
            tipo_usuario: 'PERSONAL'
        };

        const response = await request(app)
            .post('/login')
            .send(credenciaisInexistentes);

        expect(response.status).toBe(401);
    });
});