const bcrypt = require('bcrypt');
const AlunoRepository = require('../repositories/AlunoRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');

class AlunoService {

    // função para cadastrar e salvar todos os dados iniciais do aluno no sistema
    async cadastrarAluno(personalId, dados) {
        const { 
            nome, email, senha, objetivo, data_nascimento,
            peso, altura, historico_lesoes, restricoes_fisicas, condicoes_medicas
        } = dados;

        const emailExiste = await UsuarioRepository.buscarPorEmail(email);
        if (emailExiste) {
            throw new Error('Email ja cadastrado');
        }

        if (peso < 20 || peso > 300 || altura < 1.00 || altura > 2.50) {
            throw new Error('Valores corporais fora dos limites permitidos (Peso: 20-300kg, Altura: 1.00-2.50m).');
        }

        const senhaHash = await bcrypt.hash(senha, 10);
        const usuarioId = await UsuarioRepository.criarUsuario(nome, email, senhaHash, 'ALUNO');

        await AlunoRepository.criarAluno(usuarioId, data_nascimento, objetivo, personalId);
        await AlunoRepository.registrarEvolucaoFisica(usuarioId, peso, altura);
        await AlunoRepository.registrarAnamnese(usuarioId, historico_lesoes, restricoes_fisicas, condicoes_medicas);

        return true;
    }

    // função para listar os alunos ativos ou inativos no dashboard do personal
    async listarAlunos(userRole, usuarioId, statusAlvo = 'ATIVO') {
        return await AlunoRepository.listarComFiltros(userRole, usuarioId, statusAlvo);
    }

    // função para carregar o histórico de evolução e pesagem do aluno
    async listarEvolucaoFisica(alunoId) {
        return await AlunoRepository.buscarHistoricoEvolucao(alunoId);
    }

    // função para registrar novas medidas corporais e atualizar o peso do aluno
    async registrarNovaEvolucao(alunoId, peso, altura) {
        if (peso < 20 || peso > 300 || altura < 1.00 || altura > 2.50) {
            throw new Error('Valores corporais fora dos limites permitidos (Peso: 20-300kg, Altura: 1.00-2.50m).');
        }

        await AlunoRepository.registrarEvolucaoFisica(alunoId, peso, altura);
        return true;
    }

    // função para buscar o prontuário completo, anamnese e check-ins do aluno
    async buscarProntuarioPorId(alunoId, userRole, logadoId) {
        const aluno = await AlunoRepository.buscarDadosProntuario(alunoId);

        if (!aluno) {
            throw new Error('Aluno nao encontrado.');
        }

        if (userRole === 'ALUNO' && String(alunoId) !== String(logadoId)) {
            throw new Error('Acesso negado. Voce nao pode visualizar o prontuario de outro aluno.');
        }

        if (userRole === 'PERSONAL' && aluno.personal_id !== logadoId) {
            throw new Error('Acesso negado. Este aluno pertence a carteira de outro Personal Trainer.');
        }

        const checkins = await AlunoRepository.buscarUltimosCheckins(alunoId, 10);
        aluno.checkins = checkins;

        return aluno;
    }

    // função para desativar o acesso de um aluno específico da carteira do personal
    async desativarAlunoPorPersonal(alunoId, personalId) {
        const aluno = await AlunoRepository.buscarDadosProntuario(alunoId);

        if (!aluno) {
            throw new Error('Aluno nao encontrado.');
        }

        if (aluno.personal_id !== personalId) {
            throw new Error('Acesso proibido. Este aluno nao pertence a sua carteira.');
        }

        await UsuarioRepository.desativar(alunoId);
        return true;
    }
}

module.exports = new AlunoService();