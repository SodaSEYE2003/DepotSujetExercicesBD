const express = require("express")
const multer = require("multer")
const minioClient = require("../upload/minio") // Importation de la config MinIO
const db = require("../config/db") // Connexion MySQL
const { v4: uuidv4 } = require("uuid")

const router = express.Router()

// Configurer Multer avec des limites augmentées
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
})

// Fonction pour construire l'URL du fichier
function buildFileUrl(endpoint, bucket, fileName) {
  // Vérifier si l'endpoint contient déjà http:// ou https://
  if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
    // Ajouter http:// par défaut, ou https:// si useSSL est true
    const protocol = process.env.MINIO_USE_SSL === "true" ? "https://" : "http://"
    endpoint = protocol + endpoint
  }

  // Ajouter le port si ce n'est pas le port standard (80 pour HTTP, 443 pour HTTPS)
  if (
    process.env.MINIO_PORT &&
    !(
      (endpoint.startsWith("http://") && process.env.MINIO_PORT === "80") ||
      (endpoint.startsWith("https://") && process.env.MINIO_PORT === "443")
    )
  ) {
    // Vérifier si l'endpoint contient déjà un port
    if (!endpoint.includes(":", 8)) {
      // 8 est la position après http:// ou https://
      endpoint = `${endpoint}:${process.env.MINIO_PORT}`
    }
  }

  return `${endpoint}/${bucket}/${fileName}`
}

// Fonction pour vérifier si un bucket existe et le créer si nécessaire
const ensureBucketExists = async (bucketName) => {
  try {
    const exists = await minioClient.bucketExists(bucketName)
    if (!exists) {
      console.log(`Le bucket '${bucketName}' n'existe pas, tentative de création...`)
      await minioClient.makeBucket(bucketName, "us-east-1")
      console.log(`Bucket '${bucketName}' créé avec succès.`)

      // Définir une politique pour rendre le bucket public en lecture
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      }

      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy))
      console.log(`Politique publique appliquée au bucket '${bucketName}'.`)
    } else {
      console.log(`Bucket '${bucketName}' existe déjà.`)
    }
    return true
  } catch (err) {
    console.error(`Erreur lors de la vérification/création du bucket ${bucketName}:`, err)
    return false
  }
}

// Modifions la fonction getFileNameFromUrl pour gérer les cas où l'URL n'est pas une chaîne valide
function getFileNameFromUrl(url) {
  // Vérifier si l'URL est une chaîne valide
  if (!url || typeof url !== "string") {
    console.log("URL invalide ou non définie:", url)
    return null
  }

  try {
    const parts = url.split("/")
    return parts[parts.length - 1]
  } catch (error) {
    console.error("Erreur lors de l'extraction du nom de fichier:", error)
    return null
  }
}

// Modifions la route POST pour vérifier si une soumission existe déjà
router.post("/", upload.single("fichier"), async (req, res) => {
  console.log("=== DÉBUT DE LA REQUÊTE DE SOUMISSION ===")
  console.log("Headers:", req.headers)
  console.log("Body:", req.body)
  console.log("File:", req.file ? "Fichier reçu" : "Aucun fichier")

  // Vérifier si un fichier a été envoyé
  if (!req.file) {
    console.log("Erreur: Aucun fichier de soumission envoyé")
    return res.status(400).json({ error: "Aucun fichier de soumission envoyé" })
  }

  try {
    // Extraire les données du formulaire
    const { id_sujet, etudiant_id, commentaire } = req.body
    const id_etudiant = etudiant_id // Pour compatibilité avec le code existant

    if (!id_sujet) {
      return res.status(400).json({ error: "L'identifiant du sujet est requis" })
    }

    if (!id_etudiant) {
      console.error("Erreur: ID étudiant manquant dans la requête")
      return res.status(400).json({ error: "L'identifiant de l'étudiant est requis" })
    }

    console.log("ID étudiant reçu:", id_etudiant)

    // Vérifier si l'étudiant a déjà soumis une réponse pour cet exercice
    // Utiliser les noms de colonnes corrects
    db.query(
      "SELECT * FROM soumission WHERE sujet_id = ? AND etudiant_id = ?",
      [id_sujet, id_etudiant],
      async (err, results) => {
        if (err) {
          console.error("Erreur lors de la vérification des soumissions existantes:", err)
          return res.status(500).json({
            error: "Erreur lors de la vérification des soumissions existantes",
            details: err.message,
          })
        }

        // Si une soumission existe déjà, renvoyer une erreur
        if (results.length > 0) {
          console.log(`L'étudiant ${id_etudiant} a déjà soumis une réponse pour le sujet ${id_sujet}`)
          return res.status(400).json({
            error: "Vous avez déjà soumis une réponse pour cet exercice",
            existingSubmission: results[0],
          })
        }

        // Continuer avec le processus de soumission si aucune soumission existante n'est trouvée
        // Vérifier que le bucket existe
        const soumissionBucketName = "soumission"
        await ensureBucketExists(soumissionBucketName)

        // Générer un nom de fichier unique
        const submissionFileName = `${uuidv4()}_${req.file.originalname}`

        // Upload du fichier sur MinIO
        try {
          await new Promise((resolve, reject) => {
            minioClient.putObject(
              soumissionBucketName,
              submissionFileName,
              req.file.buffer,
              req.file.size,
              req.file.mimetype,
              (err, etag) => {
                if (err) {
                  console.error("Erreur upload MinIO:", err)
                  return reject(err)
                }
                console.log("Upload MinIO réussi, etag:", etag)
                resolve(etag)
              },
            )
          })

          // Générer l'URL du fichier
          const submissionFileUrl = buildFileUrl(
            process.env.MINIO_ENDPOINT || "localhost",
            soumissionBucketName,
            submissionFileName,
          )
          console.log("URL du fichier de soumission générée:", submissionFileUrl)

          // Insérer les données dans la base de données
          // Utiliser les noms de colonnes exacts de la table soumission
          // Vérifier que l'ID étudiant est bien fourni
          if (!id_etudiant) {
            console.error("Erreur: ID étudiant manquant")
            return res.status(400).json({ error: "L'identifiant de l'étudiant est requis" })
          }

          const insertQuery = `
            INSERT INTO soumission (
              sujet_id, etudiant_id, fichier, commentaire
            ) VALUES (?, ?, ?, ?)
          `

          db.query(
            insertQuery,
            [
              id_sujet,
              id_etudiant, // L'ID étudiant est obligatoire
              submissionFileUrl,
              commentaire || null,
            ],
            (err, result) => {
              if (err) {
                console.error("Erreur SQL lors de l'ajout de la soumission:", err)
                return res.status(500).json({
                  error: "Erreur lors de l'ajout de la soumission dans la base de données",
                  details: err.message,
                })
              }

              console.log("Soumission ajoutée avec succès, ID:", result.insertId)
              console.log("=== FIN DE LA REQUÊTE DE SOUMISSION (SUCCÈS) ===")
              res.status(201).json({
                message: "Soumission ajoutée avec succès !",
                id: result.insertId,
                fichierUrl: submissionFileUrl,
              })
            },
          )
        } catch (err) {
          console.error("Erreur lors de l'upload du fichier de soumission sur MinIO:", err)
          return res.status(500).json({
            error: "Erreur lors de l'upload du fichier de soumission",
            details: err.message,
          })
        }
      },
    )
  } catch (error) {
    console.error("Erreur serveur:", error)
    console.log("=== FIN DE LA REQUÊTE DE SOUMISSION (ÉCHEC) ===")
    res.status(500).json({
      error: "Erreur serveur",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Nouvelle route pour récupérer les soumissions d'un professeur spécifique
router.get("/professeur/:idProfesseur", (req, res) => {
  const idProfesseur = req.params.idProfesseur
  console.log(`Récupération des soumissions pour le professeur avec ID: ${idProfesseur}`)

  // Requête SQL pour récupérer uniquement les soumissions liées aux exercices créés par ce professeur
  // Utiliser les tables utilisateur et utilisateurrole au lieu de Etudiant
  const query = `
    SELECT s.*, sj.Titre as sujet_titre, u.nom as etudiant_nom, u.prenom as etudiant_prenom 
    FROM soumission s 
    LEFT JOIN sujet sj ON s.sujet_id = sj.id 
    LEFT JOIN utilisateur u ON s.etudiant_id = u.id 
    LEFT JOIN utilisateurrole ur ON u.id = ur.utilisateur_id 
    WHERE sj.idProfesseur = ? 
    AND ur.role_id = 2  -- Supposons que role_id = 2 correspond au rôle étudiant
    ORDER BY s.dateSoumission DESC
  `

  db.query(query, [idProfesseur], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des soumissions du professeur:", err)
      console.error("Détails de l'erreur:", err.message, err.sql)
      return res.status(500).json({ error: "Erreur serveur", details: err.message })
    }

    console.log(`${results.length} soumissions trouvées pour le professeur ${idProfesseur}`)
    res.json(results)
  })
})

// Route pour récupérer toutes les soumissions
router.get("/", (req, res) => {
  console.log("Récupération de toutes les soumissions")

  db.query(
    `SELECT s.*, sj.Titre as sujet_titre, u.nom as etudiant_nom, u.prenom as etudiant_prenom 
     FROM soumission s 
     LEFT JOIN sujet sj ON s.sujet_id = sj.id 
     LEFT JOIN utilisateur u ON s.etudiant_id = u.id 
     LEFT JOIN utilisateurrole ur ON u.id = ur.utilisateur_id 
     WHERE ur.role_id = 2  -- Supposons que role_id = 2 correspond au rôle étudiant
     ORDER BY s.dateSoumission DESC`,
    (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des soumissions:", err)
        return res.status(500).json({ error: "Erreur serveur", details: err.message })
      }

      console.log(`${results.length} soumissions trouvées`)
      res.json(results)
    },
  )
})

// Route pour récupérer une soumission par ID
router.get("/:id", (req, res) => {
  console.log(`Récupération de la soumission avec ID: ${req.params.id}`)

  db.query(
    `SELECT s.*, sj.Titre as sujet_titre, u.nom as etudiant_nom, u.prenom as etudiant_prenom 
     FROM soumission s 
     LEFT JOIN sujet sj ON s.sujet_id = sj.id 
     LEFT JOIN utilisateur u ON s.etudiant_id = u.id 
     WHERE s.id = ?`,
    [req.params.id],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de la récupération de la soumission:", err)
        return res.status(500).json({ error: "Erreur serveur", details: err.message })
      }

      if (result.length === 0) {
        console.log(`Soumission avec ID ${req.params.id} non trouvée`)
        return res.status(404).json({ error: "Soumission non trouvée" })
      }

      console.log(`Soumission avec ID ${req.params.id} trouvée:`, result[0])
      res.json(result[0])
    },
  )
})

// Route pour évaluer une soumission (ajouter une note et un feedback)
router.put("/:id/evaluer", (req, res) => {
  const soumissionId = req.params.id
  const { note, feedback } = req.body

  if (note === undefined) {
    return res.status(400).json({ error: "La note est requise" })
  }

  console.log(`Évaluation de la soumission avec ID: ${soumissionId}`)

  db.query(
    "UPDATE soumission SET note = ?, feedback = ? WHERE id = ?",
    [note, feedback || null, soumissionId],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de l'évaluation de la soumission:", err)
        return res.status(500).json({ error: "Erreur serveur", details: err.message })
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Soumission non trouvée" })
      }

      console.log(`Soumission avec ID ${soumissionId} évaluée avec succès`)
      res.json({ message: "Soumission évaluée avec succès" })
    },
  )
})

// Route pour vérifier si une soumission existe déjà pour un étudiant et un exercice
router.get("/check/:idSujet/:idEtudiant", (req, res) => {
  const { idSujet, idEtudiant } = req.params

  console.log(`Vérification de soumission existante pour sujet ${idSujet} et étudiant ${idEtudiant}`)

  db.query("SELECT * FROM soumission WHERE sujet_id = ? AND etudiant_id = ?", [idSujet, idEtudiant], (err, results) => {
    if (err) {
      console.error("Erreur lors de la vérification des soumissions:", err)
      return res.status(500).json({
        error: "Erreur lors de la vérification des soumissions",
        details: err.message,
      })
    }

    if (results.length > 0) {
      console.log("Soumission existante trouvée")
      return res.json({
        exists: true,
        submission: results[0],
      })
    }

    console.log("Aucune soumission existante trouvée")
    res.json({ exists: false })
  })
})

// Nouvelle route pour supprimer une soumission
router.delete("/:id", async (req, res) => {
  const soumissionId = req.params.id

  console.log(`Suppression de la soumission avec ID: ${soumissionId}`)

  // D'abord, récupérer les informations de la soumission pour obtenir l'URL du fichier
  db.query("SELECT * FROM soumission WHERE id = ?", [soumissionId], async (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération de la soumission:", err)
      return res.status(500).json({ error: "Erreur serveur", details: err.message })
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Soumission non trouvée" })
    }

    const soumission = results[0]

    try {
      // Supprimer le fichier de MinIO si l'URL existe
      if (soumission.fichier) {
        const fileName = getFileNameFromUrl(soumission.fichier)
        if (fileName) {
          const bucketName = "soumission"

          try {
            await minioClient.removeObject(bucketName, fileName)
            console.log(`Fichier ${fileName} supprimé du bucket ${bucketName}`)
          } catch (minioErr) {
            console.error("Erreur lors de la suppression du fichier de MinIO:", minioErr)
            // Continuer même si la suppression du fichier échoue
          }
        } else {
          console.log("Impossible d'extraire le nom du fichier, aucune suppression effectuée")
        }
      }

      // Supprimer l'entrée de la base de données
      db.query("DELETE FROM soumission WHERE id = ?", [soumissionId], (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error("Erreur lors de la suppression de la soumission:", deleteErr)
          return res.status(500).json({ error: "Erreur serveur", details: deleteErr.message })
        }

        if (deleteResult.affectedRows === 0) {
          return res.status(404).json({ error: "Soumission non trouvée" })
        }

        console.log(`Soumission avec ID ${soumissionId} supprimée avec succès`)
        res.json({ message: "Soumission supprimée avec succès" })
      })
    } catch (error) {
      console.error("Erreur lors de la suppression de la soumission:", error)
      res.status(500).json({ error: "Erreur serveur", details: error.message })
    }
  })
})

// Nouvelle route pour mettre à jour une soumission existante
router.put("/:id", upload.single("fichier"), async (req, res) => {
  const soumissionId = req.params.id
  const { commentaire } = req.body

  console.log(`Mise à jour de la soumission avec ID: ${soumissionId}`)
  console.log("Body:", req.body)
  console.log("File:", req.file ? "Fichier reçu" : "Aucun fichier")

  // D'abord, récupérer les informations de la soumission existante
  db.query("SELECT * FROM soumission WHERE id = ?", [soumissionId], async (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération de la soumission:", err)
      return res.status(500).json({ error: "Erreur serveur", details: err.message })
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Soumission non trouvée" })
    }

    const soumission = results[0]

    try {
      let submissionFileUrl = soumission.fichier

      // Si un nouveau fichier est fourni, le télécharger et mettre à jour l'URL
      if (req.file) {
        // Supprimer l'ancien fichier de MinIO si l'URL existe
        if (soumission.fichier) {
          const fileName = getFileNameFromUrl(soumission.fichier)
          if (fileName) {
            const bucketName = "soumission"

            try {
              await minioClient.removeObject(bucketName, fileName)
              console.log(`Ancien fichier ${fileName} supprimé du bucket ${bucketName}`)
            } catch (minioErr) {
              console.error("Erreur lors de la suppression de l'ancien fichier de MinIO:", minioErr)
              // Continuer même si la suppression du fichier échoue
            }
          } else {
            console.log("Impossible d'extraire le nom de l'ancien fichier, aucune suppression effectuée")
          }
        }

        // Vérifier que le bucket existe
        const soumissionBucketName = "soumission"
        await ensureBucketExists(soumissionBucketName)

        // Générer un nom de fichier unique
        const submissionFileName = `${uuidv4()}_${req.file.originalname}`

        // Upload du nouveau fichier sur MinIO
        await new Promise((resolve, reject) => {
          minioClient.putObject(
            soumissionBucketName,
            submissionFileName,
            req.file.buffer,
            req.file.size,
            req.file.mimetype,
            (err, etag) => {
              if (err) {
                console.error("Erreur upload MinIO:", err)
                return reject(err)
              }
              console.log("Upload MinIO réussi, etag:", etag)
              resolve(etag)
            },
          )
        })

        // Générer la nouvelle URL du fichier
        submissionFileUrl = buildFileUrl(
          process.env.MINIO_ENDPOINT || "localhost",
          soumissionBucketName,
          submissionFileName,
        )
        console.log("Nouvelle URL du fichier de soumission générée:", submissionFileUrl)
      }

      // Mettre à jour la soumission dans la base de données
      const updateQuery = `
        UPDATE soumission 
        SET fichier = ?, commentaire = ?, dateSoumission = NOW() 
        WHERE id = ?
      `

      db.query(
        updateQuery,
        [submissionFileUrl, commentaire !== undefined ? commentaire : soumission.commentaire, soumissionId],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Erreur SQL lors de la mise à jour de la soumission:", updateErr)
            return res.status(500).json({
              error: "Erreur lors de la mise à jour de la soumission dans la base de données",
              details: updateErr.message,
            })
          }

          if (updateResult.affectedRows === 0) {
            return res.status(404).json({ error: "Soumission non trouvée" })
          }

          console.log(`Soumission avec ID ${soumissionId} mise à jour avec succès`)
          res.json({
            message: "Soumission mise à jour avec succès !",
            id: soumissionId,
            fichierUrl: submissionFileUrl,
          })
        },
      )
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la soumission:", error)
      res.status(500).json({ error: "Erreur serveur", details: error.message })
    }
  })
})

module.exports = router
