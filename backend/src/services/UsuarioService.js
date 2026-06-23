const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UsuarioRepository = require('../repositories/UsuarioRepository');

class UsuarioService {

    // Lógica de Login do usuario
    async autenticar({ email, password, tipo_usuario }) {
        // 1. Pergunta ao repositório se o e-mail existe
        const usuario = await UsuarioRepository.buscarPorEmail(email);
        
        if (!usuario) {
            // Se não achar o usuario, lançamos um erro
            throw new Error('Email ou senha invalidos');
        }

        // 2. Compara a senha digitada com o hash guardado no banco
        const senhaCorreta = await bcrypt.compare(password, usuario.senha);
        if (!senhaCorreta) {
            throw new Error('Email ou senha invalidos');
        }

        // 3. Valida se o tipo do usuario bate com o que o front enviou (PERSONAL ou ALUNO)
        if (tipo_usuario && usuario.tipo_usuario !== tipo_usuario.toUpperCase()) {
            throw new Error('Email ou senha invalidos');
        }

        // 4. Se passou por tudo, gera o Token de acesso JWT
        const token = jwt.sign(
            { id: usuario.id, tipo: usuario.tipo_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Devolve os dados certinhos que o controller precisa enviar
        return {
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo_usuario
            }
        };
    }

    // Lógica para registar um novo Personal Trainer
    async cadastrarPersonal({ nome, email, password, registro_profissional }) {
        // Validação obrigatória, tem de ter o registo profissional do conselho de educação física
        if (!registro_profissional) {
            throw new Error('O registro profissional e obrigatorio para Personal Trainers.');
        }

        // Verifica se o e-mail já não está registado no sistema
        const emailExiste = await UsuarioRepository.buscarPorEmail(email);
        if (emailExiste) {
            throw new Error('Email ja cadastrado');
        }

        // Criptografa a password do Personal por segurança antes de guardar
        const senhaHash = await bcrypt.hash(password, 10);

        // Chama o repositório para inserir na tabela 'usuarios' e pega o ID gerado
        const usuarioId = await UsuarioRepository.criarUsuario(nome, email, senhaHash, 'PERSONAL');

        // Pega nesse ID e guarda o registo específico na tabela 'personal_trainers'
        await UsuarioRepository.criarPersonal(usuarioId, registro_profissional);

        return usuarioId;
    }
}

module.exports = new UsuarioService();