const express = require("express")
const router = express.Router()
const db = require("../config/db")

// Récupérer tous les étudiants (utilisateurs avec role_id = 1)
router.get("/", (req, res) => {
  const query = `
    SELECT u.id, u.email, u.nom, u.prenom, u.Num_Etudiant 
    FROM utilisateur u
    JOIN utilisateurrole ur ON u.id = ur.utilisateur_id
    WHERE ur.role_id = 1
  `

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur SQL:", err)
      return res.status(500).json({
        error: "Erreur serveur",
        details: err.message,
      })
    }
    res.json(results)
  })
})

// Ajouter un étudiant
router.post("/", (req, res) => {
  const { Num_Etudiant, nom, prenom, email } = req.body

  // Générer un mot de passe temporaire
  const tempPassword = Math.random().toString(36).slice(-8)

  // Transaction pour ajouter l'utilisateur et son rôle
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: "Erreur de transaction", details: err.message })

    // 1. Insérer l'utilisateur
    db.query(
      "INSERT INTO utilisateur (email, password, nom, prenom, Num_Etudiant) VALUES (?, ?, ?, ?, ?)",
      [email, tempPassword, nom, prenom, Num_Etudiant],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: "Erreur d'insertion", details: err.message })
          })
        }

        const userId = result.insertId

        // 2. Ajouter le rôle étudiant (role_id = 1)
        db.query("INSERT INTO utilisateurrole (utilisateur_id, role_id) VALUES (?, 1)", [userId], (err, result) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: "Erreur d'insertion du rôle", details: err.message })
            })
          }

          // Valider la transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: "Erreur de validation", details: err.message })
              })
            }
            res.json({
              message: "Étudiant ajouté avec succès !",
              tempPassword: tempPassword, // En production, envoyer par email plutôt que de retourner
            })
          })
        })
      },
    )
  })
})

// Mettre à jour un étudiant
router.put("/:id", (req, res) => {
  const { nom, prenom, email } = req.body
  db.query(
    "UPDATE utilisateur SET nom=?, prenom=?, email=? WHERE Num_Etudiant=?",
    [nom, prenom, email, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur de mise à jour", details: err.message })
      res.json({ message: "Étudiant mis à jour avec succès !" })
    },
  )
})

// Supprimer un étudiant
router.delete("/:id", (req, res) => {
  // Transaction pour supprimer l'utilisateur et ses rôles
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: "Erreur de transaction", details: err.message })

    // 1. Récupérer l'ID de l'utilisateur
    db.query("SELECT id FROM utilisateur WHERE Num_Etudiant=?", [req.params.id], (err, results) => {
      if (err || results.length === 0) {
        return db.rollback(() => {
          res.status(err ? 500 : 404).json({
            error: err ? "Erreur serveur" : "Étudiant non trouvé",
            details: err ? err.message : "Aucun étudiant avec ce numéro",
          })
        })
      }

      const userId = results[0].id

      // 2. Supprimer les rôles de l'utilisateur
      db.query("DELETE FROM utilisateurrole WHERE utilisateur_id=?", [userId], (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: "Erreur de suppression des rôles", details: err.message })
          })
        }

        // 3. Supprimer l'utilisateur
        db.query("DELETE FROM utilisateur WHERE id=?", [userId], (err, result) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: "Erreur de suppression", details: err.message })
            })
          }

          // Valider la transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: "Erreur de validation", details: err.message })
              })
            }
            res.json({ message: "Étudiant supprimé avec succès !" })
          })
        })
      })
    })
  })
})

// Obtenir les statistiques des étudiants
router.get("/stats", (req, res) => {
  // Récupération du nombre total d'étudiants
  db.query("SELECT COUNT(*) AS totalStudents FROM utilisateurrole WHERE role_id = 1", (err, totalResults) => {
    if (err) return res.status(500).json({ error: "Erreur de statistiques", details: err.message })

    const totalStudents = totalResults[0].totalStudents

    // Pour les besoins de cet exemple, nous allons supposer que
    // le nombre d'étudiants de la semaine dernière est 80% du total actuel
    const lastWeekStudents = Math.floor(totalStudents * 0.8)

    // Calcul du pourcentage d'évolution
    let percentChange = 0
    if (lastWeekStudents > 0) {
      percentChange = Math.round(((totalStudents - lastWeekStudents) / lastWeekStudents) * 100)
    }

    res.json({
      totalStudents,
      percentChange,
      lastWeekStudents,
    })
  })
})

module.exports = router
