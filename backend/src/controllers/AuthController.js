const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../database');

class AuthController {
    async login(req, res) {
        try {
            const { email, password, tipo_usuario } = req.body;

            const [rows] = await connection.execute(
                'SELECT * FROM usuarios WHERE email = ?',
                [email]
            );

            if (rows.length === 0) {
                return res.status(401).json({ erro: 'Email ou senha invalidos' });
            }

            const usuario = rows[0];
            const senhaCorreta = await bcrypt.compare(password, usuario.senha);

            if (!senhaCorreta) {
                return res.status(401).json({ erro: 'Email ou senha invalidos' });
            }

            if (tipo_usuario && usuario.tipo_usuario !== tipo_usuario.toUpperCase()) {
                return res.status(403).json({
                    erro: `Acesso negado. Esta conta esta registrada como ${usuario.tipo_usuario} e nao tem permissao para acessar este portal.`
                });
            }

            const token = jwt.sign(
                { id: usuario.id, tipo: usuario.tipo_usuario },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.json({
                mensagem: 'Login realizado com sucesso',
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipo: usuario.tipo_usuario
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno no servidor' });
        }
    }
}

module.exports = new AuthController();