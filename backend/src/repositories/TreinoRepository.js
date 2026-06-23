const connection = require('../config/database');

class TreinoRepository {

    // verifica se o aluno realmente pertence aquele personal trainer
    async verificarVinculoAluno(alunoId, personalId) {
        const [rows] = await connection.execute(
            'SELECT id_usuario FROM alunos WHERE id_usuario = ? AND personal_id = ?',
            [alunoId, personalId]
        );
        return rows.length > 0;
    }

    // busca uma ficha de treino que esteja atualmente ativa para o aluno
    async buscarFichaAtiva(alunoId) {
        const [rows] = await connection.execute(
            `SELECT ft.id, ft.status, ft.data_criacao, u.nome as personal_nome
             FROM fichas_treino ft
             JOIN usuarios u ON ft.personal_id = u.id
             WHERE ft.aluno_id = ? AND ft.status = 'ATIVA'`,
            [alunoId]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    // cria uma nova ficha de treino no banco de dados
    async criarFicha(alunoId, personalId) {
        const [resultado] = await connection.execute(
            'INSERT INTO fichas_treino (aluno_id, personal_id) VALUES (?, ?)',
            [alunoId, personalId]
        );
        return resultado.insertId;
    }

    // cria a divisão do treino
    async criarDivisao(fichaId, identificador, ordem) {
        const [resultado] = await connection.execute(
            'INSERT INTO divisoes_treino (ficha_id, identificador, ordem) VALUES (?, ?, ?)',
            [fichaId, identificador, ordem]
        );
        return resultado.insertId;
    }

    // vincula um exercício específico a uma divisão de treino informando séries e repetições
    async vincularExercicioADivisao(divisaoId, exercicioId, series, repeticoes) {
        await connection.execute(
            'INSERT INTO itens_ficha_treino (divisao_id, exercicio_id, series, repeticoes) VALUES (?, ?, ?, ?)',
            [divisaoId, exercicioId, series, repeticoes]
        );
    }

    // faz o JOIN trazendo o email e contando as divisões reais
    async listarFichasPorPersonal(personalId) {
        const [rows] = await connection.execute(
            `SELECT ft.id, u.nome as aluno_nome, u.email as aluno_email, 
                    COUNT(DISTINCT dt.id) as num_divisoes, ft.status, ft.data_criacao
             FROM fichas_treino ft
             JOIN usuarios u ON ft.aluno_id = u.id
             LEFT JOIN divisoes_treino dt ON ft.id = dt.ficha_id
             WHERE ft.personal_id = ?
             GROUP BY ft.id
             ORDER BY ft.data_criacao DESC`,
            [personalId]
        );
        return rows;
    }

    // busca os dados básicos de uma ficha específica pelo ID dela
    async buscarFichaPorId(fichaId) {
        const [rows] = await connection.execute(
            `SELECT ft.id, ft.status, ft.data_criacao, u.nome as aluno_nome, u.email as aluno_email, ft.personal_id
             FROM fichas_treino ft
             JOIN usuarios u ON ft.aluno_id = u.id
             WHERE ft.id = ?`,
            [fichaId]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    // carrega todas as divisões associadas a uma ficha de treino específica
    async buscarDivisoesDeUmaFicha(fichaId) {
        const [rows] = await connection.execute(
            'SELECT id, ficha_id, identificador, ordem FROM divisoes_treino WHERE ficha_id = ? ORDER BY ordem ASC',
            [fichaId]
        );
        return rows;
    }

    // busca os exercícios detalhados que compõem uma divisão
    async buscarExerciciosDaDivisao(divisaoId) {
        const [rows] = await connection.execute(
            `SELECT ift.id, e.nome, e.grupo_muscular, e.descricao, e.url_execucao, ift.series, ift.repeticoes
             FROM itens_ficha_treino ift
             JOIN exercicios e ON ift.exercicio_id = e.id
             WHERE ift.divisao_id = ?
             ORDER BY ift.id ASC`,
            [divisaoId]
        );
        return rows;
    }

    // remove uma ficha do banco de dados pelo ID
    async deletarFicha(fichaId) {
        await connection.execute('DELETE FROM fichas_treino WHERE id = ?', [fichaId]);
    }

    // registra o check-in quando o aluno termina o treino do dia
    async registrarExecucaoTreino(alunoId, observacoes, fichaId) {
        const sql = 'INSERT INTO execucoes_treino (aluno_id, observacoes, ficha_id) VALUES (?, ?, ?)';
        const [resultado] = await connection.execute(sql, [alunoId, observacoes, fichaId]);
        return resultado.insertId;
    }

    // lista o histórico de treinos executados pelo aluno logado
    async listarExecucoesPorAluno(alunoId) {
        const [rows] = await connection.execute(
            'SELECT id, data_execucao, observacoes FROM execucoes_treino WHERE aluno_id = ? ORDER BY data_execucao DESC',
            [alunoId]
        );
        return rows;
    }
}

module.exports = new TreinoRepository();