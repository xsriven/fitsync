const bcrypt = require('bcrypt');
const connection = require('../database');

class AlunoController {
    async cadastrar(req, res) {
        try {
            const personalId = req.usuario.id;
            const { 
                nome, email, senha, objetivo, data_nascimento,
                peso, altura, historico_lesoes, restricoes_fisicas, condicoes_medicas
            } = req.body;

            const [emailExiste] = await connection.execute(
                'SELECT id FROM usuarios WHERE email = ?',
                [email]
            );

            if (emailExiste.length > 0) {
                return res.status(400).json({ erro: 'Email ja cadastrado' });
            }

            if (peso < 20 || peso > 300 || altura < 1.00 || altura > 2.50) {
                return res.status(400).json({
                    erro: 'Valores corporais fora dos limites permitidos (Peso: 20-300kg, Altura: 1.00-2.50m).'
                });
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            const [usuarioResult] = await connection.execute(
                'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)',
                [nome, email, senhaHash, 'ALUNO']
            );

            const usuarioId = usuarioResult.insertId;

            await connection.execute(
                'INSERT INTO alunos (id_usuario, data_nascimento, objetivo, personal_id) VALUES (?, ?, ?, ?)',
                [usuarioId, data_nascimento, objetivo, personalId]
            );

            await connection.execute(
                'INSERT INTO evolucao_fisica (aluno_id, peso, altura) VALUES (?, ?, ?)',
                [usuarioId, peso, altura]
            );

            await connection.execute(
                'INSERT INTO anamneses (aluno_id, historico_lesoes, restricoes_fisicas, condicoes_medicas) VALUES (?, ?, ?, ?)',
                [usuarioId, historico_lesoes, restricoes_fisicas, condicoes_medicas]
            );

            return res.status(201).json({
                mensagem: 'Aluno, Avaliacao Corporal e Ficha de Anamnese cadastrados com sucesso!'
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao processar cadastro transacional do aluno.' });
        }
    }

    async listar(req, res) {
        try {
            // Adicionado u.id AS id_usuario para suportar os mapeamentos legados do front-end
            let query = `
                SELECT u.id, u.id AS id_usuario, u.nome, u.email, a.objetivo, a.data_nascimento
                FROM usuarios u
                INNER JOIN alunos a ON u.id = a.id_usuario
            `;
            let params = [];
            const userRole = req.usuario.tipo || req.usuario.tipo_usuario;

            if (userRole === 'ALUNO') {
                query += ' WHERE u.id = ?';
                params.push(req.usuario.id);
            } else if (userRole === 'PERSONAL') {
                query += ' WHERE a.personal_id = ?';
                params.push(req.usuario.id);
            }

            const [rows] = await connection.execute(query, params);
            return res.json(rows);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar alunos' });
        }
    }

    async buscarPorId(req, res) {
        try {
            const alunoId = req.params.id;
            const userRole = req.usuario.tipo || req.usuario.tipo_usuario;
            const logadoId = req.usuario.id;

            // Adicionado u.id AS id_usuario na busca individual por consistencia
            const query = `
                SELECT u.id, u.id AS id_usuario, u.nome, u.email, a.objetivo, a.data_nascimento, a.personal_id,
                       an.historico_lesoes, an.restricoes_fisicas, an.condicoes_medicas
                FROM usuarios u
                INNER JOIN alunos a ON u.id = a.id_usuario
                LEFT JOIN anamneses an ON u.id = an.aluno_id
                WHERE u.id = ?
            `;

            const [rows] = await connection.execute(query, [alunoId]);

            if (rows.length === 0) {
                return res.status(404).json({ erro: 'Aluno nao encontrado no ecossistema FitSync.' });
            }

            const aluno = rows[0];

            if (userRole === 'PERSONAL' && aluno.personal_id !== logadoId) {
                return res.status(403).json({ erro: 'Acesso negado. Este aluno pertence a carteira de outro Personal Trainer.' });
            }

            return res.json(aluno);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao processar a busca do prontuario.' });
        }
    }
}

module.exports = new AlunoController();