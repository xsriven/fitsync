const express = require('express');
const ExercicioController = require('../controllers/ExercicioController');
const { autenticado, apenasPersonal } = require('../auth');

const router = express.Router();

router.get('/exercicios', autenticado, apenasPersonal, ExercicioController.listar);
router.post('/exercicios', autenticado, apenasPersonal, ExercicioController.cadastrar);

module.exports = router;