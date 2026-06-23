const ExercicioService = require('../services/ExercicioService');

class ExercicioController {

    async listar(req, res) {
        try {
            const exercicios = await ExercicioService.listarExercicios();
            return res.json(exercicios);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar exercicios' });
        }
    }

    async cadastrar(req, res) {
        try {
            const { nome, grupo_muscular, descricao, url_execucao } = req.body;

            const exercicioId = await ExercicioService.cadastrarExercicio({
                nome, grupo_muscular, descricao, url_execucao
            });

            return res.status(201).json({
                mensagem: 'Exercicio cadastrado com sucesso!',
                id: exercicioId
            });
        } catch (error) {
            if (error.message.includes('obrigatorio') || error.message.includes('YouTube')) {
                return res.status(400).json({ erro: error.message });
            }

            console.error(error);
            return res.status(500).json({ erro: 'Erro ao cadastrar exercicio' });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await ExercicioService.deletarExercicio(id);
            return res.json({ mensagem: 'Exercicio excluido com sucesso!' });
        } catch (error) {
            if (error.message.includes('vinculado')) {
                return res.status(400).json({ erro: error.message });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao excluir exercicio' });
        }
    }
}

module.exports = new ExercicioController();