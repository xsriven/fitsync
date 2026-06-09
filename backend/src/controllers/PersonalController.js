const bcrypt = require('bcrypt');
const connection = require('../config/database');

class PersonalController {
    async cadastrar(req, res) {
        try {
            const { nome, email, password, registro_profissional } = req.body;

            if (!registro_profissional) {
                return res.status(400).json({ erro: 'O registro profissional e obrigatorio para Personal Trainers.' });
            }

            const [emailExiste] = await connection.execute(
                'SELECT id FROM usuarios WHERE email = ?',
                [email]
            );

            if (emailExiste.length > 0) {
                return res.status(400).json({ erro: 'Email ja cadastrado' });
            }

            const senhaHash = await bcrypt.hash(password, 10);

            const [usuarioResult] = await connection.execute(
                'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)',
                [nome, email, senhaHash, 'PERSONAL']
            );

            const usuarioId = usuarioResult.insertId;

            await connection.execute(
                'INSERT INTO personal_trainers (id_usuario, registro_profissional) VALUES (?, ?)',
                [usuarioId, registro_profissional]
            );

            return res.status(201).json({
                mensagem: 'Personal Trainer cadastrado com sucesso!',
                id: usuarioId
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao cadastrar Personal Trainer' });
        }
    }
}

module.exports = new PersonalController();