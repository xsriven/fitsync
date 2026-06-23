const express = require('express');
const ExercicioController = require('../controllers/ExercicioController');
const { autenticado, apenasPersonal } = require('../config/auth');

const router = express.Router();

router.get('/exercicios', autenticado, apenasPersonal, ExercicioController.listar);
router.post('/exercicios', autenticado, apenasPersonal, ExercicioController.cadastrar);
router.delete('/exercicios/:id', autenticado, apenasPersonal, ExercicioController.deletar);

module.exports = router;