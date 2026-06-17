// Importa o ficheiro de ligação ao MySQL
const connection = require('../config/database');

class AlunoRepository {

    // Guarda os dados específicos na tabela de alunos vinculando ao ID do Personal
    async criarAluno(usuarioId, dataNascimento, objetivo, personalId) {
        await connection.execute(
            'INSERT INTO alunos (id_usuario, data_nascimento, objetivo, personal_id) VALUES (?, ?, ?, ?)',
            [usuarioId, dataNascimento, objetivo, personalId]
        );
    }

    // Guarda os dados da avaliação física inicial ou periódica
    async registrarEvolucaoFisica(alunoId, peso, altura) {
        await connection.execute(
            'INSERT INTO evolucao_fisica (aluno_id, peso, altura) VALUES (?, ?, ?)',
            [alunoId, peso, altura]
        );
    }

    // Guarda a ficha de Anamnese clínica/médica do aluno
    async registrarAnamnese(alunoId, historicoLesoes, restricoesFisicas, condicoesMedicas) {
        await connection.execute(
            'INSERT INTO anamneses (aluno_id, historico_lesoes, restricoes_fisicas, condicoes_medicas) VALUES (?, ?, ?, ?)',
            [alunoId, historicoLesoes, restricoesFisicas, condicoesMedicas]
        );
    }

    // Lista os alunos com base na query dinâmica que tu tinhas no controller original
    async listarComFiltros(userRole, usuarioId) {
        let query = `
            SELECT u.id, u.id AS id_usuario, u.nome, u.email, a.objetivo, a.data_nascimento
            FROM usuarios u
            INNER JOIN alunos a ON u.id = a.id_usuario
        `;
        let params = [];

        // Filtra a visibilidade dos dados de acordo com o nível de acesso (Role) do utilizador
        if (userRole === 'ALUNO') {
            query += ' WHERE u.id = ?';
            params.push(usuarioId);
        } else if (userRole === 'PERSONAL') {
            query += ' WHERE a.personal_id = ?';
            params.push(usuarioId);
        }

        const [rows] = await connection.execute(query, params);
        return rows;
    }

    // Carrega o histórico temporal de peso e altura do aluno ordenado por data
    async buscarHistoricoEvolucao(alunoId) {
        const [rows] = await connection.execute(
            'SELECT id, peso, altura, data_registro FROM evolucao_fisica WHERE aluno_id = ? ORDER BY data_registro ASC',
            [alunoId]
        );
        return rows;
    }

    // Faz a busca completa do prontuário do aluno (dados cadastrais + anamnese)
    async buscarDadosProntuario(alunoId) {
        const query = `
            SELECT u.id, u.id AS id_usuario, u.nome, u.email, a.objetivo, a.data_nascimento, a.personal_id,
                   an.historico_lesoes, an.restricoes_fisicas, an.condicoes_medicas
            FROM usuarios u
            INNER JOIN alunos a ON u.id = a.id_usuario
            LEFT JOIN anamneses an ON u.id = an.aluno_id
            WHERE u.id = ?
        `;
        const [rows] = await connection.execute(query, [alunoId]);
        return rows.length > 0 ? rows[0] : null;
    }

    // Carrega as últimas execuções de treino (check-ins) para anexar ao perfil do aluno
    async buscarUltimosCheckins(alunoId, limite = 10) {
        const [checkins] = await connection.execute(
            `SELECT id, data_execucao, observacoes 
             FROM execucoes_treino 
             WHERE aluno_id = ? 
             ORDER BY data_execucao DESC LIMIT ?`,
            [alunoId, limite]
        );
        return checkins;
    }
}

module.exports = new AlunoRepository();