const AlunoService = require('../services/AlunoService');

class AlunoController {
    
    // Processa o cadastro transacional completo do aluno
    async cadastrar(req, res) {
        try {
            const personalId = req.usuario.id;
            
            // Repassa os dados coletados no corpo da requisição para o serviço processar
            await AlunoService.cadastrarAluno(personalId, req.body);

            return res.status(201).json({
                mensagem: 'Aluno, Avaliacao Corporal e Ficha de Anamnese cadastrados com sucesso!'
            });
        } catch (error) {
            // Captura erros de validações e regras de negócio lançadas pelo Service
            if (error.message === 'Email ja cadastrado' || error.message.includes('fora dos limites')) {
                return res.status(400).json({ erro: error.message });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao processar cadastro transacional do aluno.' });
        }
    }

    // Lista os alunos respeitando o escopo do usuário autenticado
    async listar(req, res) {
        try {
            const userRole = req.usuario.tipo || req.usuario.tipo_usuario;
            const usuarioId = req.usuario.id;

            const alunos = await AlunoService.listarAlunos(userRole, usuarioId);
            return res.json(alunos);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar alunos' });
        }
    }

    // Carrega o histórico de pesagem do aluno
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

    // Adiciona uma nova medição de evolução para o histórico
    async registrarEvolucaoFisica(req, res) {
        try {
            const alunoId = req.usuario.id;
            const { peso, altura } = req.body;

            await AlunoService.registrarNovaEvolucao(alunoId, peso, altura);

            return res.status(201).json({ 
                mensagem: 'Dados corporais atualizados e IMC recalculado com sucesso!' 
            });
        } catch (error) {
            if (error.message.includes('fora dos limites')) {
                return res.status(400).json({ erro: error.message });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao salvar novos indicadores fisiologicos.' });
        }
    }

    // Carrega o prontuário de anamnese e check-ins detalhados do aluno
    async buscarPorId(req, res) {
        try {
            const alunoId = req.params.id;
            const userRole = req.usuario.tipo || req.usuario.tipo_usuario;
            const logadoId = req.usuario.id;

            const prontuario = await AlunoService.buscarProntuarioPorId(alunoId, userRole, logadoId);
            return res.json(prontuario);
        } catch (error) {
            // Trata as exceções de segurança e existência lançadas na camada Service
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
}

module.exports = new AlunoController();