const express = require('express');
const AlunoController = require('../controllers/AlunoController');
const { autenticado, apenasPersonal } = require('../auth');

const router = express.Router();

router.post('/alunos', autenticado, apenasPersonal, AlunoController.cadastrar);
router.get('/alunos', autenticado, AlunoController.listar);
router.get('/alunos/:id', autenticado, AlunoController.buscarPorId);

module.exports = router;