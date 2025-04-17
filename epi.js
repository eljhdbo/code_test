const express = require('express');
const router = express.Router();
const epiController = require('../controllers/epiController');

// Route pour récupérer tous les EPI
router.get('/', epiController.getAllEpi);

// Route pour ajouter un nouvel EPI
router.post('/', epiController.addEpi);

// Route pour mettre à jour un EPI existant
router.put('/:id', epiController.updateEpi);

// Route pour supprimer un EPI
router.delete('/:id', epiController.deleteEpi);

module.exports = router;
