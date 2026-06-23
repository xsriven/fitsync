const connection = require('../config/database');

class UsuarioRepository {

    async buscarPorEmail(email) {
        const [rows] = await connection.execute(
            'SELECT * FROM usuarios WHERE email = ? AND status = "ATIVO"',
            [email]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    async criarUsuario(nome, email, senhaHash, tipoUsuario) {
        const [resultado] = await connection.execute(
            'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, tipoUsuario]
        );
        return resultado.insertId;
    }

    async criarPersonal(usuarioId, registroProfissional) {
        await connection.execute(
            'INSERT INTO personal_trainers (id_usuario, registro_profissional) VALUES (?, ?)',
            [usuarioId, registroProfissional]
        );
        return true;
    }

    async desativar(usuarioId) {
        await connection.execute(
            'UPDATE usuarios SET status = "INATIVO" WHERE id = ?',
            [usuarioId]
        );
    }

    async reativar(usuarioId) {
        await connection.execute(
            'UPDATE usuarios SET status = "ATIVO" WHERE id = ?',
            [usuarioId]
        );
    }
}


module.exports = new UsuarioRepository();