const connection = require('../config/database');

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
                const idDoExercicio = exercicio.id || exercicio.exercicio_id;
                
                if (idDoExercicio) {
                    await connection.execute(
                        'INSERT INTO itens_ficha_treino (divisao_id, exercicio_id, series, repeticoes) VALUES (?, ?, ?, ?)',
                        [divisaoId, idDoExercicio, exercicio.series || 3, exercicio.repeticoes || 10]
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

    async registrarExecucao(req, res) {
        try {
            const alunoId = req.usuario.id; 
            const { fichaId, observacoes } = req.body; 

            if (!fichaId) {
                return res.status(400).json({ erro: 'O id da ficha de treino e obrigatorio.' });
            }

            const [fichaVerify] = await connection.execute(
                'SELECT id FROM fichas_treino WHERE id = ? AND aluno_id = ?',
                [fichaId, alunoId]
            );

            if (fichaVerify.length === 0) {
                return res.status(404).json({ erro: 'Ficha de treino nao encontrada ou nao vinculada ao seu perfil.' });
            }

            await connection.execute(
                'INSERT INTO execucoes_treino (aluno_id, ficha_id, observacoes) VALUES (?, ?, ?)',
                [alunoId, fichaId, observacoes || null]
            );

            return res.status(201).json({ mensagem: 'Treino registrado com sucesso! Boa performance!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao registrar execucao do treino no servidor.' });
        }
    }

    async listarExecucoes(req, res) {
        try {
            const alunoId = req.usuario.id;

            const [execucoes] = await connection.execute(
                `SELECT et.id, et.data_execucao, et.observacoes, ft.status as status_ficha
                 FROM execucoes_treino et
                 JOIN fichas_treino ft ON et.ficha_id = ft.id
                 WHERE et.aluno_id = ?
                 ORDER BY et.data_execucao DESC`,
                [alunoId]
            );

            const dadosFormatados = execucoes.map(exec => ({
                id: exec.id,
                data_execucao: exec.data_execucao,
                observacoes: exec.observacoes,
                identificador_divisao: `Ficha Ativa (${exec.status_ficha})`
            }));

            return res.json(dadosFormatados);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar historico de execucoes de treino.' });
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

    async excluirFicha(req, res) {
        try {
            const personalId = req.usuario.id;
            const { fichaId } = req.params;

            const [ficha] = await connection.execute(
                'SELECT id FROM fichas_treino WHERE id = ? AND personal_id = ?',
                [fichaId, personalId]
            );

            if (ficha.length === 0) {
                return res.status(404).json({ erro: 'Ficha de treino nao encontrada ou nao pertence a voce.' });
            }

            await connection.execute(
                'DELETE FROM fichas_treino WHERE id = ?',
                [fichaId]
            );

            return res.json({ mensagem: 'Ficha de treino excluida com sucesso.' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao excluir ficha de treino.' });
        }
    }

    async buscarFichaAtivaAluno(req, res) {
        try {
            const alunoId = req.usuario.id;

            const [ficha] = await connection.execute(
                `SELECT ft.id, ft.status, ft.data_criacao, u.nome as personal_nome
                 FROM fichas_treino ft
                 JOIN usuarios u ON ft.personal_id = u.id
                 WHERE ft.aluno_id = ? AND ft.status = 'ATIVA'`,
                [alunoId]
            );

            if (ficha.length === 0) {
                return res.json({ mensagem: 'Nenhuma ficha ativa vinculada a voce.' });
            }

            const fichaId = ficha[0].id;

            const [divisoes] = await connection.execute(
                'SELECT id, ficha_id, identificador, ordem FROM divisoes_treino WHERE ficha_id = ? ORDER BY ordem ASC',
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
            return res.status(500).json({ erro: 'Erro ao buscar sua ficha de treino ativa.' });
        }
    }
}

module.exports = new TreinoController();