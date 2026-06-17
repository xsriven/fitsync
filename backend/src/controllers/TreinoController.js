const TreinoService = require('../services/TreinoService');

class TreinoController {

    // Cria ou atualiza as divisões e exercícios de uma ficha
    async criarDivisao(req, res) {
        try {
            const personalId = req.usuario.id;
            const fichaId = await TreinoService.criarDivisaoTreino(personalId, req.body);

            return res.status(201).json({
                mensagem: 'Divisao de treino e exercicios vinculados com sucesso!',
                ficha_id: fichaId
            });
        } catch (error) {
            if (error.message.includes('ausentes') || error.message.includes('vazia')) {
                return res.status(400).json({ erro: error.message });
            }
            if (error.message.includes('proibido')) {
                return res.status(403).json({ erro: error.message });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao processar a criacao da divisao.' });
        }
    }

    // Lista as fichas gerenciadas pelo personal trainer autenticado
    async listarFichas(req, res) {
        try {
            const personalId = req.usuario.id;
            const fichas = await TreinoService.listarFichasDoPersonal(personalId);
            return res.json(fichas);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar fichas de treino.' });
        }
    }

    // Carrega o esqueleto completo da ficha com exercícios inclusos para edição ou visualização
    async buscarDetalhesFicha(req, res) {
        try {
            const fichaId = req.params.fichaId;
            const personalId = req.usuario.id;

            const dadosCompletos = await TreinoService.buscarDetalhesFicha(fichaId, personalId);
            return res.json(dadosCompletos);
        } catch (error) {
            if (error.message.includes('nao encontrada')) {
                return res.status(404).json({ erro: error.message });
            }
            if (error.message.includes('proibido')) {
                return res.status(403).json({ erro: error.message });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao buscar detalhes da ficha.' });
        }
    }

    // Exclui uma ficha de treino permanentemente
    async excluirFicha(req, res) {
        try {
            const fichaId = req.params.fichaId;
            const personalId = req.usuario.id;

            await TreinoService.excluirFicha(fichaId, personalId);
            return res.json({ mensagem: 'Ficha de treino excluida com sucesso!' });
        } catch (error) {
            if (error.message.includes('nao encontrada')) {
                return res.status(404).json({ erro: error.message });
            }
            if (error.message.includes('proibido')) {
                return res.status(403).json({ erro: error.message });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao excluir ficha de treino.' });
        }
    }

    // Retorna a rotina de exercícios do aluno logado para renderização no App/Front
    async buscarFichaAtivaAluno(req, res) {
        try {
            const alunoId = req.usuario.id;
            const resultado = await TreinoService.buscarTreinoAtivoDoAluno(alunoId);
            return res.json(resultado);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar sua ficha de treino ativa.' });
        }
    }

    // Registra a conclusão do treino do dia (Check-in)
    async registrarExecucao(req, res) {
        try {
            const alunoId = req.usuario.id;
            const { observacoes } = req.body;

            await TreinoService.salvarExecucao(alunoId, observacoes);
            return res.status(201).json({ mensagem: 'Execucao de treino salva (Check-in confirmado)!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao salvar execucao de treino.' });
        }
    }

    // Exibe o histórico de treinos já realizados pelo aluno logado
    async listarExecucoes(req, res) {
        try {
            const alunoId = req.usuario.id;
            const historico = await TreinoService.listarHistoricoDoAluno(alunoId);
            return res.json(historico);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar historico de execucoes.' });
        }
    }
}

module.exports = new TreinoController();