const TreinoRepository = require('../repositories/TreinoRepository');

class TreinoService {

    // Regra para montar uma divisão de treino (ex: Treino A) adicionando os exercícios
    async criarDivisaoTreino(personalId, dados) {
        const { aluno_id, identificador, ordem, exercicios } = dados;

        // Validação de dados obrigatórios
        if (!aluno_id || !identificador || !Array.isArray(exercicios) || exercicios.length === 0) {
            throw new Error('Campos obrigatorios ausentes ou lista de exercicios vazia.');
        }

        // Regra de Segurança: Um personal não pode criar treino para alunos de outros personais
        const vinculoValido = await TreinoRepository.verificarVinculoAluno(aluno_id, personalId);
        if (!vinculoValido) {
            throw new Error('Acesso proibido. Este aluno nao pertence a sua carteira.');
        }

        // Verifica se o aluno já tem uma ficha "ATIVA" aberta
        let ficha = await TreinoRepository.buscarFichaAtiva(aluno_id);
        let fichaId;

        if (!ficha) {
            // Se não tiver nenhuma ativa, o sistema cria de forma transparente uma nova ficha padrão
            fichaId = await TreinoRepository.criarFicha(aluno_id, personalId);
        } else {
            fichaId = ficha.id;
        }

        // Salva a divisão do treino associada à ficha encontrada/criada
        const divisaoId = await TreinoRepository.criarDivisao(fichaId, identificador, ordem);

        // Varre a lista de exercícios enviada pelo front-end e faz os vínculos individuais
        for (let exercicio of exercicios) {
            await TreinoRepository.vincularExercicioADivisao(
                divisaoId,
                exercicio.exercicio_id,
                exercicio.series,
                exercicio.repeticoes
            );
        }

        return fichaId;
    }

    // Regra para listar as fichas associadas ao personal logado
    async listarFichasDoPersonal(personalId) {
        return await TreinoRepository.listarFichasPorPersonal(personalId);
    }

    // Regra para destrinchar uma ficha de treino trazendo suas divisões e os respectivos exercícios
    async buscarDetalhesFicha(fichaId, personalId) {
        const ficha = await TreinoRepository.buscarFichaPorId(fichaId);
        
        if (!ficha) {
            throw new Error('Ficha de treino nao encontrada.');
        }

        // Proteção de segurança arquitetural: Bloqueia se outro personal tentar espionar a ficha
        if (ficha.personal_id !== personalId) {
            throw new Error('Acesso proibido a este documento de treino.');
        }

        // Busca todas as divisões (A, B, C...) dessa ficha
        const divisoes = await TreinoRepository.buscarDivisoesDeUmaFicha(fichaId);

        // Alimenta cada divisão com a sua respectiva coleção de exercícios mapeados
        for (let divisao of divisoes) {
            divisao.exercicios = await TreinoRepository.buscarExerciciosDaDivisao(divisao.id);
        }

        return { ficha, divisoes };
    }

    // Regra para deletar uma ficha
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

    // Regra focada na visão do aluno logado: Carrega o treino atual dele completo
    async buscarTreinoAtivoDoAluno(alunoId) {
        const ficha = await TreinoRepository.buscarFichaAtiva(alunoId);

        if (!ficha) {
            return { mensagem: 'Nenhuma ficha ativa vinculada a voce.' };
        }

        // Se achar a ficha ativa, carrega as divisões dela
        const divisoes = await TreinoRepository.buscarDivisoesDeUmaFicha(ficha.id);

        // Acopla os exercícios em cada uma das divisões carregadas
        for (let divisao of divisoes) {
            divisao.exercicios = await TreinoRepository.buscarExerciciosDaDivisao(divisao.id);
        }

        return { ficha, divisoes };
    }

    // Regra para registrar o check-in diário de conclusão de atividades
    async salvarExecucao(alunoId, observacoes) {
        await TreinoRepository.registrarExecucaoTreino(alunoId, observacoes);
        return true;
    }

    // Regra para listar o histórico de atividades cumpridas pelo aluno
    async listarHistoricoDoAluno(alunoId) {
        return await TreinoRepository.listarExecucoesPorAluno(alunoId);
    }
}

module.exports = new TreinoService();