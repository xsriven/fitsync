const connection = require('../database');

class TreinoController {
    async criarDivisao(req, res) {
        try {
            const personalId = req.usuario.id;
            const { aluno_id, identificador, ordem, exercicios } = req.body;

            if (!aluno_id || !identificador || !Array.isArray(exercicios) || exercicios.length === 0) {
                return res.status(400).json({ erro: 'Aluno, identificador da divisao e exercicios sao obrigatorios.' });
            }

            const [alunoVerify] = await connection.execute(
                'SELECT id_usuario FROM alunos WHERE id_usuario = ? AND personal_id = ?',
                [aluno_id, personalId]
            );

            if (alunoVerify.length === 0) {
                return res.status(403).json({ erro: 'Este aluno nao pertence a sua carteira de clientes.' });
            }

            const [fichaExistente] = await connection.execute(
                'SELECT id FROM fichas_treino WHERE aluno_id = ? AND personal_id = ? AND status = "ATIVA"',
                [aluno_id, personalId]
            );

            let fichaId;
            if (fichaExistente.length === 0) {
                const [fichaResult] = await connection.execute(
                    'INSERT INTO fichas_treino (aluno_id, personal_id) VALUES (?, ?)',
                    [aluno_id, personalId]
                );
                fichaId = fichaResult.insertId;
            } else {
                fichaId = fichaExistente[0].id;
            }

            // Correcao de duplicidade: reaproveita a divisao se o nome ja existir na mesma ficha
            const [divisaoExistente] = await connection.execute(
                'SELECT id FROM divisoes_treino WHERE ficha_id = ? AND identificador = ?',
                [fichaId, identificador]
            );

            let divisaoId;
            if (divisaoExistente.length > 0) {
                divisaoId = divisaoExistente[0].id;
            } else {
                const [divisaoResult] = await connection.execute(
                    'INSERT INTO divisoes_treino (ficha_id, identificador, ordem) VALUES (?, ?, ?)',
                    [fichaId, identificador, ordem || 1]
                );
                divisaoId = divisaoResult.insertId;
            }

            for (const exercicio of exercicios) {
                if (exercicio.id) {
                    await connection.execute(
                        'INSERT INTO itens_ficha_treino (divisao_id, exercicio_id, series, repeticoes) VALUES (?, ?, ?, ?)',
                        [divisaoId, exercicio.id, exercicio.series || 3, exercicio.repeticoes || 10]
                    );
                }
            }

            return res.status(201).json({
                mensagem: 'Divisao de treino criada com sucesso!',
                fichaId,
                divisaoId
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao criar divisao de treino' });
        }
    }

    async listarFichas(req, res) {
        try {
            const personalId = req.usuario.id;

            const [fichas] = await connection.execute(
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

            return res.json(fichas);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar fichas de treino' });
        }
    }

    async buscarDetalhesFicha(req, res) {
        try {
            const personalId = req.usuario.id;
            const { fichaId } = req.params;

            const [ficha] = await connection.execute(
                `SELECT ft.id, u.nome as aluno_nome, u.email as aluno_email, ft.status, ft.data_criacao
                 FROM fichas_treino ft
                 JOIN usuarios u ON ft.aluno_id = u.id
                 WHERE ft.id = ? AND ft.personal_id = ?`,
                [fichaId, personalId]
            );

            if (ficha.length === 0) {
                return res.status(404).json({ erro: 'Ficha de treino nao encontrada' });
            }

            const [divisoes] = await connection.execute(
                'SELECT id, identificador, ordem FROM divisoes_treino WHERE ficha_id = ? ORDER BY ordem ASC',
                [fichaId]
            );

            for (let divisao of divisoes) {
                const [exercicios] = await connection.execute(
                    `SELECT ift.id, e.nome, e.grupo_muscular, e.descricao, e.url_execucao, ift.series, ift.repeticoes
                     FROM itens_ficha_treino ift
                     JOIN exercicios e ON ift.exercicio_id = e.id
                     WHERE ift.divisao_id = ?
                     ORDER BY ift.id ASC`,
                    [divisao.id]
                );
                divisao.exercicios = exercicios;
            }

            return res.json({ ficha: ficha[0], divisoes });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar detalhes da ficha de treino' });
        }
    }
}

module.exports = new TreinoController();