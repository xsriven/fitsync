const express = require('express');
const authRoutes = require('./auth.routes');
const alunoRoutes = require('./aluno.routes');
const exercicioRoutes = require('./exercicio.routes');
const treinoRoutes = require('./treino.routes');

const routes = express.Router();

routes.use(authRoutes);
routes.use(exercicioRoutes);
routes.use(treinoRoutes);
routes.use(alunoRoutes);

module.exports = routes;