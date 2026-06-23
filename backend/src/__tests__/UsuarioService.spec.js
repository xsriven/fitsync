const UsuarioService = require('../services/UsuarioService');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../repositories/UsuarioRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('UsuarioService - autenticar (Login)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'secret_teste';
    });

    it('deve autenticar o usuario e retornar o token com sucesso', async () => {
        const usuarioFake = {
            id: 1,
            nome: 'Pedro Henrique',
            email: 'pedro@fitsync.com',
            senha: 'senha_criptografada',
            tipo_usuario: 'PERSONAL'
        };

        UsuarioRepository.buscarPorEmail.mockResolvedValue(usuarioFake);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('token_jwt_valido');

        const dadosLogin = {
            email: 'pedro@fitsync.com',
            password: 'senha123',
            tipo_usuario: 'PERSONAL'
        };

        const resultado = await UsuarioService.autenticar(dadosLogin);

        expect(resultado).toHaveProperty('token', 'token_jwt_valido');
        expect(resultado.usuario.nome).toBe('Pedro Henrique');
    });

    it('deve lancar erro se o e-mail nao existir no sistema', async () => {
        UsuarioRepository.buscarPorEmail.mockResolvedValue(null);

        const dadosLogin = { email: 'inexistente@fitsync.com', password: '123' };

        await expect(
            UsuarioService.autenticar(dadosLogin)
        ).rejects.toThrow('Email ou senha invalidos');
    });

    it('deve lancar erro se a senha estiver incorreta', async () => {
        UsuarioRepository.buscarPorEmail.mockResolvedValue({ email: 'pedro@fitsync.com', senha: 'hash' });
        bcrypt.compare.mockResolvedValue(false);

        const dadosLogin = { email: 'pedro@fitsync.com', password: 'senha_errada' };

        await expect(
            UsuarioService.autenticar(dadosLogin)
        ).rejects.toThrow('Email ou senha invalidos');
    });
});