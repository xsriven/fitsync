// O Service precisa do Repository para mandar gravar ou buscar informações
const ExercicioRepository = require('../repositories/ExercicioRepository');

class ExercicioService {

    // Lógica para listar os exercícios (aqui não tem segredo, só repassa)
    async listarExercicios() {
        // Se no futuro precisasses filtrar por personal ou algo do tipo, a lógica seria adicionada aqui
        return await ExercicioRepository.buscarTodos();
    }

    // Lógica para validar e cadastrar um exercício
    async cadastrarExercicio({ nome, grupo_muscular, descricao, url_execucao }) {
        
        // Validação de segurança: Nome e Grupo Muscular são estritamente obrigatórios no sistema
        if (!nome || !grupo_muscular) {
            throw new Error('Nome e Grupo Muscular sao obrigatorios.');
        }

        // Se passar pela validação, chama o repositório para salvar no banco
        // Tratamos também para que campos opcionais vazios entrem como null de forma elegante
        const novoId = await ExercicioRepository.criar({
            nome,
            grupo_muscular,
            descricao: descricao || null,
            url_execucao: url_execucao || null
        });

        // Retorna o ID gerado para que o controller saiba o que responder
        return novoId;
    }
}

module.exports = new ExercicioService();