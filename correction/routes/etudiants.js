const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Récupérer tous les professeurs
router.get("/", (req, res) => {
  db.query("SELECT * FROM Etudiant", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Ajouter un etudiant
router.post("/", (req, res) => {
    const { Num_Etudiant, nom, prenom, email } = req.body;
    db.query(
      "INSERT INTO Etudiant (Num_Etudiant, nom, prenom, email) VALUES (?, ?, ?, ?)",
      [Num_Etudiant, nom, prenom, email],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Etudiant ajouté avec succès !" });
      }
    );
  });
  // Mettre à jour un Etudiant
router.put("/:id", (req, res) => {
    const { nom, prenom, email } = req.body;
    db.query(
      "UPDATE Etudiant SET nom=?, prenom=?, email=? WHERE Num_Etudiant=?",
      [nom, prenom, email, req.params.id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Etudiant mis à jour avec succès !" });
      }
    );
  });

  //Supprimer un Etudiant 
  router.delete("/:id", (req, res) => {
    db.query(
      "DELETE FROM Etudiant WHERE Num_Etudiant=?",
      [req.params.id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Etudiant supprimé avec succès !" });
      }
    );
  });

module.exports = router;