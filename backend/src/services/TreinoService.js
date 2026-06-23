const TreinoRepository = require('../repositories/TreinoRepository');

class TreinoService {

    async criarDivisaoTreino(personalId, dados) {
        const { aluno_id, identificador, ordem, exercicios } = dados;

        if (!aluno_id || !identificador || !Array.isArray(exercicios) || exercicios.length === 0) {
            throw new Error('Campos obrigatorios ausentes ou lista de exercicios vazia.');
        }

        const vinculoValido = await TreinoRepository.verificarVinculoAluno(aluno_id, personalId);
        if (!vinculoValido) {
            throw new Error('Acesso proibido. Este aluno nao pertence a sua carteira.');
        }

        let ficha = await TreinoRepository.buscarFichaAtiva(aluno_id);
        let fichaId;

        if (!ficha) {
            fichaId = await TreinoRepository.criarFicha(aluno_id, personalId);
        } else {
            fichaId = ficha.id;
        }

        const divisaoId = await TreinoRepository.criarDivisao(fichaId, identificador, ordem);

        await Promise.all(
            exercicios.map(exercicio =>
                TreinoRepository.vincularExercicioADivisao(
                    divisaoId,
                    exercicio.exercicio_id,
                    exercicio.series,
                    exercicio.repeticoes
                )
            )
        );

        return fichaId;
    }

    async listarFichasDoPersonal(personalId) {
        return await TreinoRepository.listarFichasPorPersonal(personalId);
    }

    async buscarDetalhesFicha(fichaId, personalId) {
        const ficha = await TreinoRepository.buscarFichaPorId(fichaId);
        
        if (!ficha) {
            throw new Error('Ficha de treino nao encontrada.');
        }

        if (ficha.personal_id !== personalId) {
            throw new Error('Acesso proibido a este documento de treino.');
        }

        const divisoes = await TreinoRepository.buscarDivisoesDeUmaFicha(fichaId);

        await Promise.all(
            divisoes.map(async (divisao) => {
                divisao.exercicios = await TreinoRepository.buscarExerciciosDaDivisao(divisao.id);
            })
        );

        return { ficha, divisoes };
    }

    async excluirFicha(fichaId, personalId) {
        const ficha = await TreinoRepository.buscarFichaPorId(fichaId);
        
        if (!ficha) {
            throw new Error('Ficha de treino nao encontrada.');
        }

        if (ficha.personal_id !== personalId) {
            throw new Error('Acesso proibido. Nao e possivel excluir fichas de terceiros.');
        }

        await TreinoRepository.deletarFicha(fichaId);
        return true;
    }

    async buscarTreinoAtivoDoAluno(alunoId) {
        const ficha = await TreinoRepository.buscarFichaAtiva(alunoId);

        if (!ficha) {
            return { mensagem: 'Nenhuma ficha ativa vinculada a voce.' };
        }

        const divisoes = await TreinoRepository.buscarDivisoesDeUmaFicha(ficha.id);

        await Promise.all(
            divisoes.map(async (divisao) => {
                divisao.exercicios = await TreinoRepository.buscarExerciciosDaDivisao(divisao.id);
            })
        );

        return { ficha, divisoes };
    }

    async salvarExecucao(alunoId, observacoes, fichaId) {
        await TreinoRepository.registrarExecucaoTreino(alunoId, observacoes, fichaId);
        return true;
    }

    async listarHistoricoDoAluno(alunoId) {
        return await TreinoRepository.listarExecucoesPorAluno(alunoId);
    }
}

module.exports = new TreinoService();