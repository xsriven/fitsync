const AlunoService = require('../services/AlunoService');

class AlunoController {
    
    async cadastrar(req, res) {
        try {
            const personalId = req.usuario.id;
            
            await AlunoService.cadastrarAluno(personalId, req.body);

            return res.status(201).json({
                mensagem: 'Aluno, avaliacao corporal e ficha de anamnese cadastrados com sucesso!'
            });
        } catch (error) {
            if (error.message === 'Email ja cadastrado' || error.message.includes('fora dos limites')) {
                return res.status(400).json({ erro: error.message });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao processar cadastro transacional do aluno.' });
        }
    }

    async listar(req, res) {
        try {
            const userRole = req.usuario.tipo || req.usuario.tipo_usuario;
            const usuarioId = req.usuario.id;
            const { status } = req.query; 

            const alunos = await AlunoService.listarAlunos(userRole, usuarioId, status || 'ATIVO');
            return res.json(alunos);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar alunos' });
        }
    }

    async listarEvolucaoFisica(req, res) {
        try {
            const alunoId = req.usuario.id;
            const historico = await AlunoService.listarEvolucaoFisica(alunoId);
            return res.json(historico);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao carregar o historico de evolucao fisica.' });
        }
    }

    async registrarEvolucaoFisica(req, res) {
        try {
            const alunoId = req.usuario.id;
            const { peso, altura } = req.body;

            await AlunoService.registrarNovaEvolucao(alunoId, peso, altura);

            return res.status(201).json({ 
                mensagem: 'Dados corporais updated e IMC recalculado com sucesso!' 
            });
        } catch (error) {
            if (error.message.includes('fora dos limites')) {
                return res.status(400).json({ erro: error.message });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao salvar novos indicadores fisiologicos.' });
        }
    }

    async buscarPorId(req, res) {
        try {
            const alunoId = req.params.id;
            const userRole = req.usuario.tipo || req.usuario.tipo_usuario;
            const logadoId = req.usuario.id;

            const prontuario = await AlunoService.buscarProntuarioPorId(alunoId, userRole, logadoId);
            return res.json(prontuario);
        } catch (error) {
            if (error.message.includes('nao encontrado')) {
                return res.status(404).json({ erro: error.message });
            }
            if (error.message.includes('Acesso negado')) {
                return res.status(403).json({ erro: error.message });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao processar a busca do prontuario.' });
        }
    }

    async desativar(req, res) {
        try {
            const alunoId = req.params.id;
            const personalId = req.usuario.id;

            await AlunoService.desativarAlunoPorPersonal(alunoId, personalId);

            return res.json({ mensagem: 'Aluno desativado com sucesso!' });
        } catch (error) {
            if (error.message.includes('nao encontrado')) {
                return res.status(404).json({ erro: error.message });
            }
            if (error.message.includes('Acesso proibido')) {
                return res.status(403).json({ erro: error.message });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao desativar aluno.' });
        }
    }
}

module.exports = new AlunoController();