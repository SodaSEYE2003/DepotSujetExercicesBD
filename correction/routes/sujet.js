const express = require("express")
const multer = require("multer")
const minioClient = require("../upload/minio") // Chemin correct vers la config MinIO
const db = require("../config/db") // Chemin correct vers la connexion MySQL
const { v4: uuidv4 } = require("uuid")

const router = express.Router()

// Configurer Multer (stockage en mémoire avant upload)
const upload = multer({ storage: multer.memoryStorage() })

// Fonction pour décoder les URLs hexadécimales
function decodeHexString(hexString) {
  try {
    // Vérifier si c'est une chaîne hexadécimale (commence par 0x)
    if (typeof hexString === "string" && hexString.startsWith("0x")) {
      // Supprimer le préfixe 0x et convertir en chaîne de caractères
      const hex = hexString.substring(2)
      let str = ""
      for (let i = 0; i < hex.length; i += 2) {
        const charCode = Number.parseInt(hex.substr(i, 2), 16)
        str += String.fromCharCode(charCode)
      }
      return str
    }
    return hexString // Retourner la valeur d'origine si ce n'est pas une chaîne hexadécimale
  } catch (error) {
    console.error("Erreur lors du décodage de l'URL hexadécimale:", error)
    return hexString // En cas d'erreur, retourner la valeur d'origine
  }
}

// Fonction pour vérifier si un bucket existe et le créer si nécessaire
const ensureBucketExists = async (bucketName) => {
  try {
    const exists = await minioClient.bucketExists(bucketName)
    if (!exists) {
      console.log(`Le bucket ${bucketName} n'existe pas, création...`)
      await minioClient.makeBucket(bucketName, "us-east-1")
      console.log(`Bucket ${bucketName} créé avec succès`)
    } else {
      console.log(`Bucket ${bucketName} existe déjà`)
    }
    return true
  } catch (err) {
    console.error(`Erreur lors de la vérification/création du bucket ${bucketName}:`, err)
    return false
  }
}

// Fonction pour uploader un fichier vers MinIO
const uploadToMinio = (bucketName, fileName, fileBuffer, fileType) => {
  return new Promise((resolve, reject) => {
    minioClient.putObject(bucketName, fileName, fileBuffer, fileType, (err, etag) => {
      if (err) {
        console.error(`Erreur upload MinIO (${bucketName}):`, err)
        reject(err)
      } else {
        const fileUrl = `${process.env.MINIO_ENDPOINT || "http://localhost"}/${bucketName}/${fileName}`
        console.log(`Fichier uploadé avec succès dans ${bucketName}:`, fileName)
        resolve(fileUrl)
      }
    })
  })
}

// Route pour téléverser les fichiers
router.post(
  "/",
  upload.fields([
    { name: "fichier", maxCount: 1 },
    { name: "correction", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log("=== DÉBUT DE LA REQUÊTE D'UPLOAD ===")
    console.log("Files reçus:", req.files)
    console.log("Body reçu:", req.body)

    if (!req.files || !req.files.fichier) {
      return res.status(400).json({ error: "Aucun fichier d'exercice envoyé" })
    }

    const exerciseFile = req.files.fichier[0]
    const correctionFile = req.files.correction ? req.files.correction[0] : null

    try {
      // Vérifier que les buckets existent
      const sujetsBucketName = "sujets"
      const correctionBucketName = "modele"

      const sujetBucketExists = await ensureBucketExists(sujetsBucketName)
      if (!sujetBucketExists) {
        return res.status(500).json({ error: "Impossible de créer ou vérifier le bucket des sujets" })
      }

      if (correctionFile) {
        const correctionBucketExists = await ensureBucketExists(correctionBucketName)
        if (!correctionBucketExists) {
          return res.status(500).json({ error: "Impossible de créer ou vérifier le bucket des corrections" })
        }
      }

      // Extraire les données du formulaire
      const { titre, sousTitre, categorie, statut, description, dateLimite } = req.body

      // Générer des noms de fichiers uniques
      const exerciseFileName = `${uuidv4()}_${exerciseFile.originalname}`

      // Upload du fichier d'exercice
      let exerciseFileUrl
      try {
        exerciseFileUrl = await uploadToMinio(
          sujetsBucketName,
          exerciseFileName,
          exerciseFile.buffer,
          exerciseFile.mimetype,
        )
      } catch (err) {
        return res.status(500).json({
          error: "Erreur lors de l'upload du fichier d'exercice",
          details: err.message,
        })
      }

      // Upload du fichier de correction si présent
      let correctionFileUrl = null
      if (correctionFile) {
        const correctionFileName = `${uuidv4()}_${correctionFile.originalname}`
        try {
          correctionFileUrl = await uploadToMinio(
            correctionBucketName,
            correctionFileName,
            correctionFile.buffer,
            correctionFile.mimetype,
          )
        } catch (err) {
          return res.status(500).json({
            error: "Erreur lors de l'upload du fichier de correction",
            details: err.message,
          })
        }
      }

      // Insérer les données dans la base de données
      const insertQuery = `
      INSERT INTO Sujet (
        id_Sujet, TypeDeSujet, DateDeDepot, Delai, 
        file, Titre, correctionUrl, Description, sousTitre, status
      ) VALUES (NULL, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?)
    `

      db.query(
        insertQuery,
        [
          categorie || "SQL",
          dateLimite ? new Date(dateLimite) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
          exerciseFileUrl,
          titre,
          correctionFileUrl,
          description || null,
          sousTitre || null,
          statut || "brouillon",
        ],
        (err, result) => {
          if (err) {
            console.error("Erreur SQL lors de l'ajout du sujet:", err)
            return res.status(500).json({
              error: "Erreur lors de l'ajout du sujet dans la base de données",
              details: err.message,
            })
          }

          console.log("Sujet ajouté avec succès, ID:", result.insertId)
          res.status(201).json({
            message: "Sujet ajouté avec succès !",
            id: result.insertId,
            fichierUrl: exerciseFileUrl,
            correctionUrl: correctionFileUrl,
          })
        },
      )
    } catch (error) {
      console.error("Erreur serveur:", error)
      res.status(500).json({
        error: "Erreur serveur",
        message: error.message,
      })
    }
  },
)

// Route pour récupérer tous les sujets
router.get("/", (req, res) => {
  db.query("SELECT * FROM Sujet ORDER BY DateDeDepot DESC", (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des sujets:", err)
      return res.status(500).json({ error: "Erreur serveur" })
    }

    try {
      // Décoder les URLs des fichiers
      const decodedResults = results.map((sujet) => ({
        ...sujet,
        file: decodeHexString(sujet.file),
        correctionUrl: decodeHexString(sujet.correctionUrl),
      }))

      res.json(decodedResults)
    } catch (error) {
      console.error("Erreur lors du décodage des URLs:", error)
      // En cas d'erreur, renvoyer les résultats sans décodage
      res.json(results)
    }
  })
})

// Route pour récupérer un sujet par ID
router.get("/:id", (req, res) => {
  db.query("SELECT * FROM Sujet WHERE id_Sujet = ?", [req.params.id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la récupération du sujet:", err)
      return res.status(500).json({ error: "Erreur serveur" })
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Sujet non trouvé" })
    }

    try {
      // Décoder les URLs des fichiers
      const sujet = result[0]
      sujet.file = decodeHexString(sujet.file)
      sujet.correctionUrl = decodeHexString(sujet.correctionUrl)

      res.json(sujet)
    } catch (error) {
      console.error("Erreur lors du décodage des URLs:", error)
      // En cas d'erreur, renvoyer le résultat sans décodage
      res.json(result[0])
    }
  })
})

// Route pour mettre à jour un sujet
router.put(
  "/:id",
  upload.fields([
    { name: "fichier", maxCount: 1 },
    { name: "correction", maxCount: 1 },
  ]),
  async (req, res) => {
    const sujetId = req.params.id

    try {
      // Récupérer le sujet existant
      db.query("SELECT * FROM Sujet WHERE id_Sujet = ?", [sujetId], async (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Erreur lors de la récupération du sujet" })
        }
        if (results.length === 0) {
          return res.status(404).json({ error: "Sujet non trouvé" })
        }

        const existingSujet = results[0]
        // Décoder les URLs des fichiers existants
        try {
          existingSujet.file = decodeHexString(existingSujet.file)
          existingSujet.correctionUrl = decodeHexString(existingSujet.correctionUrl)
        } catch (error) {
          console.error("Erreur lors du décodage des URLs existantes:", error)
          // Continuer avec les URLs non décodées en cas d'erreur
        }

        const { titre, sousTitre, categorie, statut, description, dateLimite } = req.body

        // Gérer les uploads de fichiers si présents
        let exerciseFileUrl = existingSujet.file
        let correctionFileUrl = existingSujet.correctionUrl

        if (req.files && req.files.fichier) {
          const exerciseFile = req.files.fichier[0]
          const exerciseFileName = `${uuidv4()}_${exerciseFile.originalname}`
          try {
            exerciseFileUrl = await uploadToMinio(
              "sujets",
              exerciseFileName,
              exerciseFile.buffer,
              exerciseFile.mimetype,
            )
          } catch (err) {
            return res.status(500).json({
              error: "Erreur lors de l'upload du nouveau fichier d'exercice",
              details: err.message,
            })
          }
        }

        if (req.files && req.files.correction) {
          const correctionFile = req.files.correction[0]
          const correctionFileName = `${uuidv4()}_${correctionFile.originalname}`
          try {
            correctionFileUrl = await uploadToMinio(
              "modele",
              correctionFileName,
              correctionFile.buffer,
              correctionFile.mimetype,
            )
          } catch (err) {
            return res.status(500).json({
              error: "Erreur lors de l'upload du nouveau fichier de correction",
              details: err.message,
            })
          }
        }

        // Mettre à jour la base de données
        const updateQuery = `
        UPDATE Sujet SET 
          TypeDeSujet = ?, 
          Delai = ?, 
          file = ?, 
          Titre = ?, 
          correctionUrl = ?,
          Description = ?, 
          sousTitre = ?,
          status = ?
        WHERE id_Sujet = ?
      `

        db.query(
          updateQuery,
          [
            categorie || existingSujet.TypeDeSujet,
            dateLimite ? new Date(dateLimite) : existingSujet.Delai,
            exerciseFileUrl,
            titre || existingSujet.Titre,
            correctionFileUrl,
            description || existingSujet.Description,
            sousTitre || existingSujet.sousTitre,
            statut || existingSujet.status,
            sujetId,
          ],
          (updateErr) => {
            if (updateErr) {
              console.error("Erreur lors de la mise à jour du sujet:", updateErr)
              return res.status(500).json({
                error: "Erreur lors de la mise à jour du sujet",
                details: updateErr.message,
              })
            }

            res.json({
              message: "Sujet mis à jour avec succès",
              id: sujetId,
              fichierUrl: exerciseFileUrl,
              correctionUrl: correctionFileUrl,
            })
          },
        )
      })
    } catch (error) {
      console.error("Erreur serveur:", error)
      res.status(500).json({ error: "Erreur serveur", message: error.message })
    }
  },
)

// Route pour supprimer un sujet
router.delete("/:id", (req, res) => {
  const sujetId = req.params.id

  // Récupérer d'abord les URLs des fichiers pour pouvoir les supprimer de MinIO
  db.query("SELECT file, correctionUrl FROM Sujet WHERE id_Sujet = ?", [sujetId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la récupération du sujet" })
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Sujet non trouvé" })
    }

    // Supprimer le sujet de la base de données
    db.query("DELETE FROM Sujet WHERE id_Sujet = ?", [sujetId], (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ error: "Erreur lors de la suppression du sujet" })
      }

      res.json({ message: "Sujet supprimé avec succès" })

      // Optionnel: supprimer les fichiers de MinIO
      // Note: Cela peut être fait de manière asynchrone après avoir envoyé la réponse
      const sujet = results[0]

      try {
        // Décoder les URLs des fichiers
        const fileUrl = decodeHexString(sujet.file)
        const correctionUrl = decodeHexString(sujet.correctionUrl)

        // Supprimer le fichier d'exercice
        if (fileUrl && typeof fileUrl === "string") {
          try {
            const fichierPath = fileUrl.split("/").slice(3).join("/")
            minioClient.removeObject("sujets", fichierPath, (removeErr) => {
              if (removeErr) {
                console.error("Erreur lors de la suppression du fichier d'exercice:", removeErr)
              }
            })
          } catch (error) {
            console.error("Erreur lors du traitement du chemin du fichier d'exercice:", error)
          }
        }

        // Supprimer le fichier de correction
        if (correctionUrl && typeof correctionUrl === "string") {
          try {
            const correctionPath = correctionUrl.split("/").slice(3).join("/")
            minioClient.removeObject("modele", correctionPath, (removeErr) => {
              if (removeErr) {
                console.error("Erreur lors de la suppression du fichier de correction:", removeErr)
              }
            })
          } catch (error) {
            console.error("Erreur lors du traitement du chemin du fichier de correction:", error)
          }
        }
      } catch (error) {
        console.error("Erreur lors du décodage des URLs pour la suppression:", error)
      }
    })
  })
})

router.get("/", (req, res) => {
  try {
    // Date d'il y a une semaine
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const formattedDate = oneWeekAgo.toISOString().split('T')[0]; // Format YYYY-MM-DD

    // Récupérer les statistiques actuelles et de la semaine dernière
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM Sujet) AS total_exercises,
        (SELECT COUNT(*) FROM Sujet WHERE DateDeDepot < ?) AS last_week_exercises,
        (SELECT COUNT(*) FROM User WHERE role = 'student') AS total_students,
        (SELECT COUNT(DISTINCT id_User) FROM Rendu WHERE date < ?) AS last_week_active_students,
        (SELECT AVG(Note) FROM Rendu) AS average_grade,
        (SELECT AVG(Note) FROM Rendu WHERE date < ?) AS last_week_average_grade
    `;

    db.query(query, [formattedDate, formattedDate, formattedDate], (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des statistiques:", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      const stats = results[0];
      
      // Calculer les pourcentages de variation
      const exercisePercent = stats.last_week_exercises > 0 
        ? Math.round(((stats.total_exercises - stats.last_week_exercises) / stats.last_week_exercises) * 100)
        : 0;
      
      const studentsPercent = stats.last_week_active_students > 0 
        ? Math.round(((stats.total_students - stats.last_week_active_students) / stats.last_week_active_students) * 100)
        : 0;
      
      const gradePercent = stats.last_week_average_grade > 0 
        ? Math.round(((stats.average_grade - stats.last_week_average_grade) / stats.last_week_average_grade) * 100)
        : 0;

      res.json({
        totalExercises: stats.total_exercises || 0,
        totalActiveStudents: stats.total_students || 0,
        averageGrade: stats.average_grade ? parseFloat(stats.average_grade).toFixed(1) : 0,
        exercisesLastWeek: exercisePercent,
        studentsLastWeek: studentsPercent,
        gradeLastWeek: gradePercent
      });
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({ error: "Erreur serveur", message: error.message });
  }
});

module.exports = router

