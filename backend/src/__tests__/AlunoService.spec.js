const AlunoService = require('../services/AlunoService');
const AlunoRepository = require('../repositories/AlunoRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const bcrypt = require('bcrypt');

jest.mock('../repositories/AlunoRepository');
jest.mock('../repositories/UsuarioRepository');

// CORREÇÃO: Mock apenas local para evitar vazamento nos testes de integração
jest.spyOn(bcrypt, 'hash');

describe('aluno service - cadastrar aluno', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * teste de caminho feliz
     * valida o fluxo completo de criacao de conta, evolucao fisica e anamnese
     * quando todas as entradas estao corretas e dentro das regras estabelecidas
     */
    it('deve cadastrar um aluno com sucesso se todos os dados forem validos', async () => {
        UsuarioRepository.buscarPorEmail.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('senha_criptografada');
        UsuarioRepository.criarUsuario.mockResolvedValue(1);
        
        AlunoRepository.criarAluno.mockResolvedValue(true);
        AlunoRepository.registrarEvolucaoFisica.mockResolvedValue(true);
        AlunoRepository.registrarAnamnese.mockResolvedValue(true);

        const dadosValidos = {
            nome: 'Sabrina Moreira',
            email: 'sabrina@gmail.com',
            senha: 'password123',
            objetivo: 'Emagrecimento',
            data_nascimento: '2000-01-01',
            peso: 70,
            altura: 1.65,
            historico_lesoes: 'Nenhuma',
            restricoes_fisicas: 'Nenhuma',
            condicoes_medicas: 'Nenhuma'
        };

        const resultado = await AlunoService.cadastrarAluno(10, dadosValidos);

        expect(resultado).toBe(true);
        expect(UsuarioRepository.buscarPorEmail).toHaveBeenCalledWith('sabrina@gmail.com');
        expect(UsuarioRepository.criarUsuario).toHaveBeenCalledWith('Sabrina Moreira', 'sabrina@gmail.com', 'senha_criptografada', 'ALUNO');
    });

    /**
     * teste de regra de negocio / unicidade
     * verifica o bloqueio de cadastros duplicados no sistema
     * garantindo que o mesmo endereco de e-mail nao seja associado a multiplas contas
     */
    it('deve lancar um erro se o e-mail ja estiver cadastrado', async () => {
        UsuarioRepository.buscarPorEmail.mockResolvedValue({ id: 1, email: 'sabrina@gmail.com' });

        const dadosRepetidos = { email: 'sabrina@gmail.com' };

        await expect(
            AlunoService.cadastrarAluno(10, dadosRepetidos)
        ).rejects.toThrow('Email ja cadastrado');
    });

    /**
     * teste de limite / borda fisiologica
     * avalia o comportamento do sistema diante de valores biometricos extremos
     * certificando que as restricoes de peso e altura barram dados incoerentes
     */
    it('deve lancar um erro se os valores corporais estiverem fora dos limites permitidos', async () => {
        UsuarioRepository.buscarPorEmail.mockResolvedValue(null);

        const dadosInvalidos = {
            email: 'aluno@gmail.com',
            peso: 15, 
            altura: 1.65
        };

        await expect(
            AlunoService.cadastrarAluno(10, dadosInvalidos)
        ).rejects.toThrow('Valores corporais fora dos limites permitidos (Peso: 20-300kg, Altura: 1.00-2.50m).');
    });
});