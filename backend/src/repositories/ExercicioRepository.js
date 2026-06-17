// Importa a conexão padrão que tu já configuraste para o MySQL
const connection = require('../config/database');

class ExercicioRepository {

    // Essa função vai buscar todos os exercícios cadastrados por ordem alfabética do nome
    async buscarTodos() {
        // SQL puro. Apenas pede ao banco e devolve as linhas encontradas
        const [rows] = await connection.execute(
            'SELECT id, nome, grupo_muscular, descricao, url_execucao FROM exercicios ORDER BY nome ASC'
        );
        return rows;
    }

    // Essa função insere um novo exercício na tabela do banco de dados
    async criar({ nome, grupo_muscular, descricao, url_execucao }) {
        // Faz o insert passando os valores. Se forem nulos, o banco trata ou aceita como NULL
        const [resultado] = await connection.execute(
            'INSERT INTO exercicios (nome, grupo_muscular, descricao, url_execucao) VALUES (?, ?, ?, ?)',
            [nome, grupo_muscular, descricao, url_execucao]
        );
        
        // Retorna o ID do exercício gerado automaticamente pelo banco
        return resultado.insertId;
    }
}

// Já exporta a instância pronta para ser usada nas outras camadas
module.exports = new ExercicioRepository();