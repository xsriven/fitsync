const UsuarioService = require('../services/UsuarioService');

class PersonalController {
    async cadastrar(req, res) {
        try {
            const { nome, email, password, registro_profissional } = req.body;

            // Chama o serviço responsável por criar o personal trainer
            const usuarioId = await UsuarioService.cadastrarPersonal({
                nome, email, password, registro_profissional
            });

            // Responde com sucesso e o ID criado
            return res.status(201).json({
                mensagem: 'Personal Trainer cadastrado com sucesso!',
                id: usuarioId
            });
        } catch (error) {
            // Trata as mensagens de erro de validação enviadas pelo Service
            if (error.message === 'Email ja cadastrado' || error.message.includes('obrigatorio')) {
                return res.status(400).json({ erro: error.message });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao cadastrar Personal Trainer' });
        }
    }
}

module.exports = new PersonalController();