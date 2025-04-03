const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Récupérer tous les professeurs
router.get("/", (req, res) => {
  db.query("SELECT * FROM Professeur", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Ajouter un professeur
router.post("/", (req, res) => {
  const { Matricule, nom, prenom, email } = req.body;
  db.query(
    "INSERT INTO Professeur (Matricule, nom, prenom, email) VALUES (?, ?, ?, ?)",
    [Matricule, nom, prenom, email],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Professeur ajouté avec succès !" });
    }
  );
});

// Mettre à jour un professeur
router.put("/:id", (req, res) => {
  const { nom, prenom, email } = req.body;
  db.query(
    "UPDATE Professeur SET nom=?, prenom=?, email=? WHERE Matricule=?",
    [nom, prenom, email, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Professeur mis à jour avec succès !" });
    }
  );
});

// Supprimer un professeur
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM Professeur WHERE Matricule=?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Professeur supprimé avec succès !" });
    }
  );
});

module.exports = router;
