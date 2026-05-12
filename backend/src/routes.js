const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('./database');
require('dotenv').config();

const routes = express.Router();

routes.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        // procura usuário
        const [rows] = await connection.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        // usuário não existe
        if (rows.length === 0) {
            return res.status(401).json({
                erro: 'Email ou senha inválidos'
            });
        }

        const usuario = rows[0];

        // compara senha
        const senhaCorreta = await bcrypt.compare(
            password,
            usuario.senha
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                erro: 'Email ou senha inválidos'
            });
        }

        // gera token
        const token = jwt.sign(
            {
                id: usuario.id,
                tipo: usuario.tipo_usuario
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        return res.json({
            mensagem: 'Login realizado',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo_usuario
            }
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            erro: 'Erro interno'
        });
    }
});

module.exports = routes;