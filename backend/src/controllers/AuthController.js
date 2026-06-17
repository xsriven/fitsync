const UsuarioService = require('../services/UsuarioService');

class AuthController {
    async login(req, res) {
        try {
            const { email, password, tipo_usuario } = req.body;

            // O controller delega toda a verificação para o Service
            const resultado = await UsuarioService.autenticar({ email, password, tipo_usuario });

            // Se correu tudo bem, responde com status 200 e o token
            return res.json({
                mensagem: 'Login realizado com sucesso',
                ...resultado
            });
        } catch (error) {
            // Se o Service disparou um throw new Error(), nós apanhamos aqui
            if (error.message === 'Email ou senha invalidos') {
                return res.status(401).json({ erro: error.message });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno no servidor' });
        }
    }
}

module.exports = new AuthController();