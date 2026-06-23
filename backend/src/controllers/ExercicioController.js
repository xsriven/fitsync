// Importa o serviço que criamos, tirando o 'connection' direto daqui
const ExercicioService = require('../services/ExercicioService');

class ExercicioController {

    // Método chamado pela rota GET /exercicios
    async listar(req, res) {
        try {
            // Chama a regra de negócio para listar os exercícios
            const exercicios = await ExercicioService.listarExercicios();

            // Retorna o JSON com a lista para o front-end
            return res.json(exercicios);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar exercicios' });
        }
    }

    // Método chamado pela rota POST /exercicios
    async cadastrar(req, res) {
        try {
            const { nome, grupo_muscular, descricao, url_execucao } = req.body;

            // Devolve a responsabilidade de criação e validação para o Service
            const exercicioId = await ExercicioService.cadastrarExercicio({
                nome, grupo_muscular, descricao, url_execucao
            });

            // Responde com o status de criado (201) e o ID gerado
            return res.status(201).json({
                mensagem: 'Exercicio cadastrado com sucesso!',
                id: exercicioId
            });
        } catch (error) {
            // Captura tanto o erro de campos obrigatórios quanto o do YouTube inválido
            if (error.message.includes('obrigatorio') || error.message.includes('YouTube')) {
                return res.status(400).json({ erro: error.message });
            }

            console.error(error);
            return res.status(500).json({ erro: 'Erro ao cadastrar exercicio' });
        }
    }
}

module.exports = new ExercicioController();