const jwt = require('jsonwebtoken');

// Autenticação: valida token JWT e anexa dados do usuário na requisição
function autenticado(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            erro: 'Token não enviado'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Guarda os dados decodificados (id e tipo) para os próximos middlewares ou rotas [cite: 42]
        req.usuario = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            erro: 'Token inválido'
        });
    }
}

// Autorização: permite somente Personal Trainers
function apenasPersonal(req, res, next) {
    const userRole = req.usuario && (req.usuario.tipo || req.usuario.tipo_usuario);
    if (userRole === 'PERSONAL') return next();
    return res.status(403).json({ erro: 'Acesso negado. Recurso exclusivo para Personal Trainers.' });
}

// Autorização: permite somente Alunos
function apenasAluno(req, res, next) {
    const userRole = req.usuario && (req.usuario.tipo || req.usuario.tipo_usuario);
    if (userRole === 'ALUNO') return next();
    return res.status(403).json({ erro: 'Acesso negado. Recurso exclusivo para Alunos.' });
}

module.exports = {
    autenticado,
    apenasPersonal,
    apenasAluno
};