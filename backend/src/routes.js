const express = require('express');
const authRoutes = require('./routes/auth.routes');
const alunoRoutes = require('./routes/aluno.routes');
const exercicioRoutes = require('./routes/exercicio.routes');
const treinoRoutes = require('./routes/treino.routes');

const routes = express.Router();

routes.use(authRoutes);
routes.use(alunoRoutes);
routes.use(exercicioRoutes);
routes.use(treinoRoutes);

module.exports = routes;