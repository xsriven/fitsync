const connection = require('../config/database');

class AlunoRepository {

    async criarAluno(usuarioId, dataNascimento, objetivo, personalId) {
        await connection.execute(
            'INSERT INTO alunos (id_usuario, data_nascimento, objetivo, personal_id) VALUES (?, ?, ?, ?)',
            [usuarioId, dataNascimento, objetivo, personalId]
        );
    }

    async registrarEvolucaoFisica(alunoId, peso, altura) {
        await connection.execute(
            'INSERT INTO evolucao_fisica (aluno_id, peso, altura) VALUES (?, ?, ?)',
            [alunoId, peso, altura]
        );
    }

    async registrarAnamnese(alunoId, historicoLesoes, restricoesFisicas, condicoesMedicas) {
        await connection.execute(
            'INSERT INTO anamneses (aluno_id, historico_lesoes, restricoes_fisicas, condicoes_medicas) VALUES (?, ?, ?, ?)',
            [alunoId, historicoLesoes, restricoesFisicas, condicoesMedicas]
        );
    }

    async listarComFiltros(userRole, usuarioId) {
        let query = `
            SELECT u.id, u.id AS id_usuario, u.nome, u.email, a.objetivo, a.data_nascimento
            FROM usuarios u
            INNER JOIN alunos a ON u.id = a.id_usuario
        `;
        let params = [];

        if (userRole === 'ALUNO') {
            query += ' WHERE u.id = ?';
            params.push(usuarioId);
        } else if (userRole === 'PERSONAL') {
            query += ' WHERE a.personal_id = ?';
            params.push(usuarioId);
        }

        const [rows] = await connection.query(query, params);
        return rows;
    }

    async buscarHistoricoEvolucao(alunoId) {
        const [rows] = await connection.execute(
            'SELECT id, peso, altura, data_registro FROM evolucao_fisica WHERE aluno_id = ? ORDER BY data_registro ASC',
            [alunoId]
        );
        return rows;
    }

    async buscarDadosProntuario(alunoId) {
        const query = `
            SELECT 
                u.id AS id,
                u.id AS id_usuario,
                u.nome AS nome,
                u.email AS email,
                a.objetivo AS objetivo,
                a.data_nascimento AS data_nascimento,
                a.personal_id AS personal_id,
                an.historico_lesoes AS historico_lesoes,
                an.restricoes_fisicas AS restricoes_fisicas,
                an.condicoes_medicas AS condicoes_medicas
            FROM usuarios u
            INNER JOIN alunos a ON u.id = a.id_usuario
            LEFT JOIN anamneses an ON u.id = an.aluno_id
            WHERE u.id = ?
        `;
        const [rows] = await connection.execute(query, [alunoId]);
        return rows.length > 0 ? rows[0] : null;
    }

    async buscarUltimosCheckins(alunoId, limite = 10) {
        const [checkins] = await connection.query(
            `SELECT id, data_execucao, observacoes 
             FROM execucoes_treino 
             WHERE aluno_id = ? 
             ORDER BY data_execucao DESC LIMIT ?`,
            [alunoId, Number(limite)]
        );
        return checkins;
    }
}

module.exports = new AlunoRepository();