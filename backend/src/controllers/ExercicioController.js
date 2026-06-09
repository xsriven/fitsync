const connection = require('../config/database');

class ExercicioController {
    async listar(req, res) {
        try {
            const [exercicios] = await connection.execute(
                'SELECT id, nome, grupo_muscular, descricao, url_execucao FROM exercicios ORDER BY nome ASC'
            );
            return res.json(exercicios);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar exercicios' });
        }
    }

    async cadastrar(req, res) {
        try {
            const { nome, grupo_muscular, descricao, url_execucao } = req.body;

            if (!nome || !grupo_muscular) {
                return res.status(400).json({ erro: 'Nome e Grupo Muscular sao obrigatorios.' });
            }

            const [resultado] = await connection.execute(
                'INSERT INTO exercicios (nome, grupo_muscular, descricao, url_execucao) VALUES (?, ?, ?, ?)',
                [nome, grupo_muscular, descricao || null, url_execucao || null]
            );

            return res.status(201).json({
                mensagem: 'Exercicio cadastrado com sucesso!',
                id: resultado.insertId
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao cadastrar exercicio' });
        }
    }
}

module.exports = new ExercicioController();