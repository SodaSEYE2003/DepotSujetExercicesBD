const express = require("express")
const multer = require("multer")
const minioClient = require("../upload/minio") // Chemin correct vers la config MinIO
const db = require("../config/db") // Chemin correct vers la connexion MySQL
const { v4: uuidv4 } = require("uuid")

const router = express.Router()

// Configurer Multer (stockage en mémoire avant upload)
const upload = multer({ storage: multer.memoryStorage() })

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

// Modifier la fonction uploadToMinio pour ajouter des logs détaillés
const uploadToMinio = (bucketName, fileName, fileBuffer, fileType) => {
  return new Promise((resolve, reject) => {
    console.log("=== DÉBUT UPLOAD MINIO ===")
    console.log(`Bucket: ${bucketName}, Nom du fichier: ${fileName}`)

    minioClient.putObject(bucketName, fileName, fileBuffer, fileBuffer.length, fileType, (err, etag) => {
      if (err) {
        console.error(`Erreur upload MinIO (${bucketName}):`, err)
        reject(err)
      } else {
        // Construire le chemin d'accès au fichier en texte brut
        const minioEndpoint = process.env.MINIO_ENDPOINT || "http://localhost:9000"
        const fileUrl = `${minioEndpoint}/${bucketName}/${fileName}`

        console.log(`Fichier uploadé avec succès dans ${bucketName}:`, fileName)
        console.log(`URL du fichier générée: ${fileUrl}`)
        console.log("=== FIN UPLOAD MINIO ===")

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

      // Modifier la requête d'insertion pour s'assurer que les URLs sont stockées en texte brut
      // Dans la route POST "/"
      // Remplacer la partie de la requête d'insertion par:

      // Insérer les données dans la base de données
      const insertQuery = `
  INSERT INTO Sujet (
    id, TypeDeSujet, DateDeDepot, Delai, 
    file, Titre, correctionUrl, Description, sousTitre, status
  ) VALUES (NULL, ?, CURDATE(), ?, CAST(? AS CHAR), ?, CAST(? AS CHAR), ?, ?, ?)
`

      // Modifier la partie de la requête d'insertion dans la route POST "/"
      // Ajouter des logs avant l'insertion dans la base de données
      db.query(
        insertQuery,
        [
          categorie || "SQL",
          dateLimite ? new Date(dateLimite) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
          exerciseFileUrl || "", // Forcer le type CHAR
          titre,
          correctionFileUrl || "", // Forcer le type CHAR
          description || null,
          sousTitre || null,
          statut || "Publié",
        ],
        (err, result) => {
          if (err) {
            console.error("Erreur SQL lors de l'ajout du sujet:", err)
            return res.status(500).json({
              error: "Erreur lors de l'ajout du sujet dans la base de données",
              details: err.message,
            })
          }

          console.log("Valeurs insérées dans la base de données:")
          console.log("- exerciseFileUrl:", exerciseFileUrl)
          console.log("- correctionFileUrl:", correctionFileUrl)
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

    console.log("Sujets récupérés:", results) // Log pour déboguer
    res.json(results)
  })
})

// Route pour récupérer un sujet par ID
router.get("/:id", (req, res) => {
  const sujetId = req.params.id
  console.log(`Récupération du sujet avec ID: ${sujetId}`) // Log pour déboguer

  db.query("SELECT * FROM Sujet WHERE id = ?", [sujetId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la récupération du sujet:", err)
      return res.status(500).json({ error: "Erreur serveur" })
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Sujet non trouvé" })
    }

    console.log("Sujet récupéré:", result[0]) // Log pour déboguer
    res.json(result[0])
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
    console.log(`Mise à jour du sujet avec ID: ${sujetId}`) // Log pour déboguer

    try {
      // Récupérer le sujet existant
      db.query("SELECT * FROM Sujet WHERE id = ?", [sujetId], async (err, results) => {
        if (err) {
          console.error("Erreur lors de la récupération du sujet:", err)
          return res.status(500).json({ error: "Erreur lors de la récupération du sujet" })
        }
        if (results.length === 0) {
          return res.status(404).json({ error: "Sujet non trouvé" })
        }

        const existingSujet = results[0]
        console.log("Sujet existant:", existingSujet) // Log pour déboguer

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

        // Modifier la requête de mise à jour dans la route PUT "/:id"
        // Remplacer la partie de la requête de mise à jour par:

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
          WHERE id = ?
        `

        db.query(
          updateQuery,
          [
            categorie || existingSujet.TypeDeSujet,
            dateLimite ? new Date(dateLimite) : existingSujet.Delai,
            exerciseFileUrl, // URL directe en texte brut
            titre || existingSujet.Titre,
            correctionFileUrl, // URL directe en texte brut
            description || existingSujet.Description,
            sousTitre || existingSujet.sousTitre,
            statut || existingSujet.status,
            sujetId,
          ],
          (updateErr, updateResult) => {
            if (updateErr) {
              console.error("Erreur lors de la mise à jour du sujet:", updateErr)
              return res.status(500).json({
                error: "Erreur lors de la mise à jour du sujet",
                details: updateErr.message,
              })
            }

            console.log("Sujet mis à jour avec succès:", updateResult) // Log pour déboguer
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
  console.log(`Suppression du sujet avec ID: ${sujetId}`) // Log pour déboguer

  // Récupérer d'abord les URLs des fichiers pour pouvoir les supprimer de MinIO
  db.query("SELECT file, correctionUrl FROM Sujet WHERE id = ?", [sujetId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération du sujet:", err)
      return res.status(500).json({ error: "Erreur lors de la récupération du sujet" })
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Sujet non trouvé" })
    }

    // Supprimer le sujet de la base de données
    db.query("DELETE FROM Sujet WHERE id = ?", [sujetId], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error("Erreur lors de la suppression du sujet:", deleteErr)
        return res.status(500).json({ error: "Erreur lors de la suppression du sujet" })
      }

      console.log("Sujet supprimé avec succès:", deleteResult) // Log pour déboguer
      res.json({ message: "Sujet supprimé avec succès" })

      // Optionnel: supprimer les fichiers de MinIO
      // Note: Cela peut être fait de manière asynchrone après avoir envoyé la réponse
      const sujet = results[0]

      try {
        // Décoder les URLs des fichiers
        const fileUrl = sujet.file
        const correctionUrl = sujet.correctionUrl

        // Supprimer le fichier d'exercice
        if (fileUrl && typeof fileUrl === "string") {
          try {
            const urlParts = new URL(fileUrl)
            const bucketAndObjectPath = urlParts.pathname.substring(1) // Enlever le premier slash
            const [bucket, ...objectPathParts] = bucketAndObjectPath.split("/")
            const objectPath = objectPathParts.join("/")

            minioClient.removeObject(bucket, objectPath, (removeErr) => {
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
            const urlParts = new URL(correctionUrl)
            const bucketAndObjectPath = urlParts.pathname.substring(1) // Enlever le premier slash
            const [bucket, ...objectPathParts] = bucketAndObjectPath.split("/")
            const objectPath = objectPathParts.join("/")

            minioClient.removeObject(bucket, objectPath, (removeErr) => {
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

// Route pour obtenir les statistiques
router.get("/stats", (req, res) => {
  try {
    // Date d'il y a une semaine
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Nombre total de sujets
    db.query("SELECT COUNT(*) AS total FROM Sujet", (err, totalResult) => {
      if (err) {
        console.error("Erreur lors de la récupération du nombre total de sujets:", err)
        return res.status(500).json({ error: "Erreur serveur" })
      }

      const totalSubjects = totalResult[0].total

      // Nombre de sujets créés la semaine dernière
      db.query("SELECT COUNT(*) AS weekly FROM Sujet WHERE DateDeDepot >= ?", [oneWeekAgo], (err, weeklyResult) => {
        if (err) {
          console.error("Erreur lors de la récupération du nombre de sujets de la semaine dernière:", err)
          return res.status(500).json({ error: "Erreur serveur" })
        }

        const weeklySubjects = weeklyResult[0].weekly

        res.json({
          totalSubjects: totalSubjects,
          weeklySubjects: weeklySubjects,
        })
      })
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    res.status(500).json({ error: "Erreur serveur", message: error.message })
  }
})

module.exports = router
