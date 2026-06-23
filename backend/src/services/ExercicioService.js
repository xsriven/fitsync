const ExercicioRepository = require('../repositories/ExercicioRepository');

class ExercicioService {

    async listarExercicios() {
        return await ExercicioRepository.buscarTodos();
    }

    async cadastrarExercicio({ nome, grupo_muscular, descricao, url_execucao }) {
        
        if (!nome || !grupo_muscular) {
            throw new Error('Nome e grupo muscular sao obrigatorios.');
        }

        if (url_execucao) {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)[\w-]+(&[\w-]+)*$/;
            
            if (!youtubeRegex.test(url_execucao)) {
                throw new Error('Por favor, insira uma URL valida do YouTube.');
            }
        }

        const novoId = await ExercicioRepository.criar({
            nome,
            grupo_muscular,
            descricao: descricao || null,
            url_execucao: url_execucao || null
        });

        return novoId;
    }

    async deletarExercicio(id) {
        try {
            await ExercicioRepository.excluir(id);
            return true;
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === '1217') {
                throw new Error('Nao e possivel excluir este exercicio pois ele esta vinculado a uma ficha de treino ativa.');
            }
            throw error;
        }
    }
}

module.exports = new ExercicioService();