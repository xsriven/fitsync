const bcrypt = require('bcrypt');
const AlunoRepository = require('../repositories/AlunoRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');

class AlunoService {

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

    async listarAlunos(userRole, usuarioId) {
        return await AlunoRepository.listarComFiltros(userRole, usuarioId);
    }

    async listarEvolucaoFisica(alunoId) {
        return await AlunoRepository.buscarHistoricoEvolucao(alunoId);
    }

    async registrarNovaEvolucao(alunoId, peso, altura) {
        if (peso < 20 || peso > 300 || altura < 1.00 || altura > 2.50) {
            throw new Error('Valores corporais fora dos limites permitidos (Peso: 20-300kg, Altura: 1.00-2.50m).');
        }

        await AlunoRepository.registrarEvolucaoFisica(alunoId, peso, altura);
        return true;
    }

    async buscarProntuarioPorId(alunoId, userRole, logadoId) {
        const aluno = await AlunoRepository.buscarDadosProntuario(alunoId);

        if (!aluno) {
            throw new Error('Aluno nao encontrado no ecossistema FitSync.');
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
}

module.exports = new AlunoService();