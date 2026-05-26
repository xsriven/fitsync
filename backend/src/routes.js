const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('./database');

// Importa os middlewares desestruturados do arquivo de autenticação
const { autenticado, apenasPersonal } = require('./auth');

const routes = express.Router();

// Login: valida credenciais e retorna token JWT
routes.post('/login', async (req, res) => {
    try {
        // Dados do login (email, senha, tipo de usuário opcional)
        const { email, password, tipo_usuario } = req.body;

        // Procura usuário pelo email
        const [rows] = await connection.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        // Usuário não existe
        if (rows.length === 0) {
            return res.status(401).json({
                erro: 'Email ou senha inválidos'
            });
        }

        const usuario = rows[0];

        // Compara o hash da senha
        const senhaCorreta = await bcrypt.compare(password, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({
                erro: 'Email ou senha inválidos'
            });
        }

        // Verifica se o tipo de usuário corresponde ao portal acessado
        if (tipo_usuario && usuario.tipo_usuario !== tipo_usuario.toUpperCase()) {
            return res.status(403).json({
                erro: `Acesso negado. Esta conta está registrada como ${usuario.tipo_usuario} e não tem permissão para acessar este portal.`
            });
        }

        // Gera token incluindo o id e o tipo correspondente do banco (ALUNO ou PERSONAL)
            // Emite token JWT com id e tipo do usuário
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
        console.log(error);
        return res.status(500).json({
            erro: 'Erro interno no servidor'
        });
    }
});

// Cadastro: Personal Trainer
routes.post('/personal-trainers', async (req, res) => {
    try {
        const { nome, email, password, registro_profissional } = req.body;

        if (!registro_profissional) {
            return res.status(400).json({
                erro: 'O registro profissional é obrigatório para Personal Trainers.'
            });
        }

        // Verifica se o email já está em uso (RN-010)
        const [emailExiste] = await connection.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (emailExiste.length > 0) {
            return res.status(400).json({
                erro: 'Email já cadastrado'
            });
        }

        // Criptografa a senha
        const senhaHash = await bcrypt.hash(password, 10);

        // 1. Salva na tabela pai (usuarios) forçando Caixa Alta para o ENUM
        const [usuarioResult] = await connection.execute(
            `
            INSERT INTO usuarios (nome, email, senha, tipo_usuario)
            VALUES (?, ?, ?, ?)
            `,
            [nome, email, senhaHash, 'PERSONAL']
        );

        const usuarioId = usuarioResult.insertId;

        // 2. Salva os dados específicos na tabela filha (personal_trainers)
        await connection.execute(
            `
            INSERT INTO personal_trainers (id_usuario, registro_profissional)
            VALUES (?, ?)
            `,
            [usuarioId, registro_profissional]
        );

        return res.status(201).json({
            mensagem: 'Personal Trainer cadastrado com sucesso!',
            id: usuarioId
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            erro: 'Erro ao cadastrar Personal Trainer'
        });
    }
});

// Cadastro: Alunos (recurso protegido - apenas Personal)
routes.post('/alunos', autenticado, apenasPersonal, async (req, res) => {
    try {
        // ID do Personal cadastrador (do token)
        const personalId = req.usuario.id;

        const { 
            nome, 
            email, 
            senha, 
            objetivo, 
            data_nascimento,
            peso,
            altura,
            historico_lesoes,
            restricoes_fisicas,
            condicoes_medicas
        } = req.body;

        // Verifica email duplicado
        const [emailExiste] = await connection.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (emailExiste.length > 0) {
            return res.status(400).json({
                erro: 'Email já cadastrado'
            });
        }

        // Valida valores básicos de peso/altura
        if (peso < 20 || peso > 300 || altura < 1.00 || altura > 2.50) {
            return res.status(400).json({
                erro: 'Valores corporais fora dos limites permitidos (Peso: 20-300kg, Altura: 1.00-2.50m).'
            });
        }

        // Criptografa senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // 1) Cria registro em `usuarios`
        const [usuarioResult] = await connection.execute(
            `
            INSERT INTO usuarios (nome, email, senha, tipo_usuario)
            VALUES (?, ?, ?, ?)
            `,
            [nome, email, senhaHash, 'ALUNO']
        );

        const usuarioId = usuarioResult.insertId;

        // 2) Insere dados específicos em `alunos`
        await connection.execute(
            `
            INSERT INTO alunos (id_usuario, data_nascimento, objetivo, personal_id)
            VALUES (?, ?, ?, ?)
            `,
            [usuarioId, data_nascimento, objetivo, personalId]
        );

        // 3) Registra avaliação física inicial
        await connection.execute(
            `
            INSERT INTO evolucao_fisica (aluno_id, peso, altura)
            VALUES (?, ?, ?)
            `,
            [usuarioId, peso, altura]
        );

        // 4) Insere anamnese vinculada ao aluno
        await connection.execute(
            `
            INSERT INTO anamneses (aluno_id, historico_lesoes, restricoes_fisicas, condicoes_medicas)
            VALUES (?, ?, ?, ?)
            `,
            [usuarioId, historico_lesoes, restricoes_fisicas, condicoes_medicas]
        );

        return res.status(201).json({
            mensagem: 'Aluno, Avaliação Corporal e Ficha de Anamnese cadastrados com sucesso!'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            erro: 'Erro interno ao processar cadastro transacional do aluno.'
        });
    }
});

// Listagem de alunos (acesso conforme papel)
routes.get('/alunos', autenticado, async (req, res) => {
    try {
        let query = `
            SELECT
                usuarios.id,
                usuarios.nome,
                usuarios.email,
                alunos.objetivo,
                alunos.data_nascimento
            FROM usuarios
            INNER JOIN alunos
                ON usuarios.id = alunos.id_usuario
        `;
        let params = [];

        const userRole = req.usuario.tipo || req.usuario.tipo_usuario;

        // Se for ALUNO, só retorna próprio perfil
        if (userRole === 'ALUNO') {
            query += ' WHERE usuarios.id = ?';
            params.push(req.usuario.id);
        }
        // Se for PERSONAL, retorna alunos vinculados ao personal
        else if (userRole === 'PERSONAL') {
            query += ' WHERE alunos.personal_id = ?';
            params.push(req.usuario.id);
        }

        const [rows] = await connection.execute(query, params);
        return res.json(rows);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            erro: 'Erro ao buscar alunos'
        });
    }
});

// Detalhes de um aluno (inclui anamnese)
routes.get('/alunos/:id', autenticado, async (req, res) => {
    try {
        const alunoId = req.params.id;
        const userRole = req.usuario.tipo || req.usuario.tipo_usuario;
        const logadoId = req.usuario.id;

        // Consulta básica juntando `usuarios`, `alunos` e `anamneses`
        const query = `
            SELECT 
                u.id,
                u.nome,
                u.email,
                a.objetivo,
                a.data_nascimento,
                a.personal_id,
                an.historico_lesoes,
                an.restricoes_fisicas,
                an.condicoes_medicas
            FROM usuarios u
            INNER JOIN alunos a ON u.id = a.id_usuario
            LEFT JOIN anamneses an ON u.id = an.aluno_id
            WHERE u.id = ?
        `;

        const [rows] = await connection.execute(query, [alunoId]);

        // Se não encontrado, retorna 404
        if (rows.length === 0) {
            return res.status(404).json({
                erro: 'Aluno não encontrado no ecossistema FitSync.'
            });
        }

        const aluno = rows[0];

        // Se Personal tentar acessar aluno de outro Personal, bloqueia
        if (userRole === 'PERSONAL' && aluno.personal_id !== logadoId) {
            return res.status(403).json({
                erro: 'Acesso negado. Este aluno pertence à carteira de outro Personal Trainer.'
            });
        }

        // Retorna dados do aluno
        return res.json(aluno);

    } catch (error) {
        console.error("Erro ao buscar prontuário detalhado:", error);
        return res.status(500).json({
            erro: 'Erro interno ao processar a busca do prontuário médico.'
        });
    }
});

module.exports = routes;