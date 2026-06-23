const connection = require('../config/database');

class UsuarioRepository {

    // vai ao banco procurar um usuario pelo e-mail dele
    async buscarPorEmail(email) {
     
        const [rows] = await connection.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        // Se achou, devolve o registo completo; se não, devolve null
        return rows.length > 0 ? rows[0] : null;
    }

    // Cria o registo base na tabela geral de usuario tanto para Personal como Aluno
    async criarUsuario(nome, email, senhaHash, tipoUsuario) {
        const [resultado] = await connection.execute(
            'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, tipoUsuario]
        );
        // Retorna o ID gerado pelo banco de dados
        return resultado.insertId;
    }

    // Cria o registo específico na tabela de Personal Trainers usando o ID do utilizador criado acima
    async criarPersonal(usuarioId, registroProfissional) {
        await connection.execute(
            'INSERT INTO personal_trainers (id_usuario, registro_profissional) VALUES (?, ?)',
            [usuarioId, registroProfissional]
        );
        return true;
    }
}

// Exportamos uma instância pronta para ser usada no Service
module.exports = new UsuarioRepository();