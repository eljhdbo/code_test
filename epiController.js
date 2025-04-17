const db = require('../models/db');

// Récupérer tous les EPI
exports.getAllEpi = (req, res) => {
  db.query('SELECT * FROM epi', (err, results) => {
    if (err) {
      res.status(500).send('Erreur lors de la récupération des EPI');
      return;
    }
    res.json(results);
  });
};

// Ajouter un nouvel EPI
exports.addEpi = (req, res) => {
  const { identifiant_custom, marque, modele, numero_serie } = req.body;
  const sql = 'INSERT INTO epi (identifiant_custom, marque, modele, numero_serie) VALUES (?, ?, ?, ?)';
  db.query(sql, [identifiant_custom, marque, modele, numero_serie], (err, result) => {
    if (err) {
      res.status(500).send('Erreur lors de l’ajout de l’EPI');
      return;
    }
    res.json({ message: 'EPI ajouté avec succès', id: result.insertId });
  });
};

// Mettre à jour un EPI existant
exports.updateEpi = (req, res) => {
  const { id } = req.params;
  const { marque, modele } = req.body;
  const sql = 'UPDATE epi SET marque = ?, modele = ? WHERE id = ?';
  db.query(sql, [marque, modele, id], (err, result) => {
    if (err) {
      res.status(500).send('Erreur lors de la mise à jour de l’EPI');
      return;
    }
    res.json({ message: 'EPI mis à jour avec succès' });
  });
};

// Supprimer un EPI
exports.deleteEpi = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM epi WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.status(500).send('Erreur lors de la suppression de l’EPI');
      return;
    }
    res.json({ message: 'EPI supprimé avec succès' });
  });
};
