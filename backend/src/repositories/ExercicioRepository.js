const connection = require('../config/database');

class ExercicioRepository {

    // busca todos os exercícios cadastrados por ordem alfabética
    async buscarTodos() {
        
        const [rows] = await connection.execute(
            'SELECT id, nome, grupo_muscular, descricao, url_execucao FROM exercicios ORDER BY nome ASC'
        );
        return rows;
    }

    // insere um novo exercício na tabela do banco de dados
    async criar({ nome, grupo_muscular, descricao, url_execucao }) {
        // Faz o insert passando os valores. Se forem nulos, o banco trata ou aceita como NULL
        const [resultado] = await connection.execute(
            'INSERT INTO exercicios (nome, grupo_muscular, descricao, url_execucao) VALUES (?, ?, ?, ?)',
            [nome, grupo_muscular, descricao, url_execucao]
        );
        
        // retorna o ID do exercício gerado automaticamente pelo banco
        return resultado.insertId;
    }
}

// Já exporta a instância pronta para ser usada nas outras camadas
module.exports = new ExercicioRepository();