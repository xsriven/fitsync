const bcrypt = require('bcrypt');
const AlunoRepository = require('../repositories/AlunoRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');

class AlunoService {

    // Orquestra a lógica de criação de todas as fichas iniciais do aluno
    async cadastrarAluno(personalId, dados) {
        const { 
            nome, email, senha, objetivo, data_nascimento,
            peso, altura, historico_lesoes, restricoes_fisicas, condicoes_medicas
        } = dados;

        // 1. Regra de Negócio: Não permite dois utilizadores com o mesmo e-mail no FitSync
        const emailExiste = await UsuarioRepository.buscarPorEmail(email);
        if (emailExiste) {
            throw new Error('Email ja cadastrado');
        }

        // 2. RN-006: Validação de limites corporais fisiológicos aceitáveis pelo sistema
        if (peso < 20 || peso > 300 || altura < 1.00 || altura > 2.50) {
            throw new Error('Valores corporais fora dos limites permitidos (Peso: 20-300kg, Altura: 1.00-2.50m).');
        }

        // 3. Encripta a password gerada para o aluno
        const senhaHash = await bcrypt.hash(senha, 10);

        // 4. Cria o utilizador base na tabela 'usuarios' herdando o comportamento comum
        const usuarioId = await UsuarioRepository.criarUsuario(nome, email, senhaHash, 'ALUNO');

        // 5. Salva as informações específicas do Aluno vinculadas ao Personal Trainer
        await AlunoRepository.criarAluno(usuarioId, data_nascimento, objetivo, personalId);

        // 6. Insere o primeiro registo na tabela de Evolução Física
        await AlunoRepository.registrarEvolucaoFisica(usuarioId, peso, altura);

        // 7. Salva o histórico inicial clínico na tabela de Anamnese
        await AlunoRepository.registrarAnamnese(usuarioId, historico_lesoes, restricoes_fisicas, condicoes_medicas);

        return true;
    }

    // Regra de negócio para listagem com filtros de privilégio
    async listarAlunos(userRole, usuarioId) {
        return await AlunoRepository.listarComFiltros(userRole, usuarioId);
    }

    // Regra para buscar o histórico temporal de medidas corporais
    async listarEvolucaoFisica(alunoId) {
        return await AlunoRepository.buscarHistoricoEvolucao(alunoId);
    }

    // Regra para atualizar o peso/altura atuais do aluno
    async registrarNovaEvolucao(alunoId, peso, altura) {
        // Aplica novamente a RN-006 para novos pesos e alturas enviados
        if (peso < 20 || peso > 300 || altura < 1.00 || altura > 2.50) {
            throw new Error('Valores corporais fora dos limites permitidos (Peso: 20-300kg, Altura: 1.00-2.50m).');
        }

        // Se estiver dentro dos parâmetros, persiste no banco
        await AlunoRepository.registrarEvolucaoFisica(alunoId, peso, altura);
        return true;
    }

    // Lógica para montar o prontuário completo de um aluno específico
    async buscarProntuarioPorId(alunoId, userRole, logadoId) {
        const aluno = await AlunoRepository.buscarDadosProntuario(alunoId);

        if (!aluno) {
            throw new Error('Aluno nao encontrado no ecossistema FitSync.');
        }

        // Regra de Segurança Crítica: Um Personal Trainer não pode ver prontuário de aluno de outra carteira
        if (userRole === 'PERSONAL' && aluno.personal_id !== logadoId) {
            throw new Error('Acesso negado. Este aluno pertence a carteira de outro Personal Trainer.');
        }

        // Busca os últimos 10 check-ins do aluno no banco e anexa de forma limpa na resposta
        const checkins = await AlunoRepository.buscarUltimosCheckins(alunoId, 10);
        aluno.checkins = checkins;

        return aluno;
    }
}

module.exports = new AlunoService();