const connection = require('../config/database');

class ExercicioRepository {

    async buscarTodos() {
        const [rows] = await connection.execute(
            'SELECT id, nome, grupo_muscular, descricao, url_execucao FROM exercicios ORDER BY nome ASC'
        );
        return rows;
    }

    async criar({ nome, grupo_muscular, descricao, url_execucao }) {
        const [resultado] = await connection.execute(
            'INSERT INTO exercicios (nome, grupo_muscular, descricao, url_execucao) VALUES (?, ?, ?, ?)',
            [nome, grupo_muscular, descricao, url_execucao]
        );
        
        return resultado.insertId;
    }

    async excluir(id) {
        await connection.execute(
            'DELETE FROM exercicios WHERE id = ?',
            [id]
        );
    }
}

module.exports = new ExercicioRepository();