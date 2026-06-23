const TreinoService = require('../services/TreinoService');
const TreinoRepository = require('../repositories/TreinoRepository');

jest.mock('../repositories/TreinoRepository');

describe('TreinoService - criarDivisaoTreino', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve lancar um erro se o aluno nao pertencer a carteira do personal', async () => {
        TreinoRepository.verificarVinculoAluno.mockResolvedValue(false);

        const dadosFalsos = {
            aluno_id: 1,
            identificador: 'Treino A',
            ordem: 1,
            exercicios: [{ exercicio_id: 1, series: 3, repeticoes: 10 }]
        };

        await expect(
            TreinoService.criarDivisaoTreino(99, dadosFalsos)
        ).rejects.toThrow('Acesso proibido. Este aluno nao pertence a sua carteira.');
    });

    it('deve lancar um erro se faltarem campos obrigatorios ou a lista de exercicios for vazia', async () => {
        const dadosIncompletos = {
            aluno_id: 1,
            identificador: 'Treino A',
            ordem: 1,
            exercicios: []
        };

        await expect(
            TreinoService.criarDivisaoTreino(99, dadosIncompletos)
        ).rejects.toThrow('Campos obrigatorios ausentes ou lista de exercicios vazia.');
    });
});