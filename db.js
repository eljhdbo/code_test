const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',           // Utilisez '127.0.0.1' pour éviter les problèmes d'IPv6
  user: 'root',                // Remplacez par votre utilisateur MySQL
  password: '',                // Remplacez par votre mot de passe MySQL, s'il y en a un
  database: 'gestepi_db',      // Le nom de votre base de données
  port: 3306                   // Port par défaut
});

connection.connect(err => {
  if (err) {
    console.error('Erreur de connexion : ', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

module.exports = connection;
