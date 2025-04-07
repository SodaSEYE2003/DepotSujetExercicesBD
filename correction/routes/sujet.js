const express = require("express")
const multer = require("multer")
const minioClient = require("../upload/minio") // Importation de la config MinIO
const db = require("../config/db") // Connexion MySQL
const { v4: uuidv4 } = require("uuid")
const util = require("util")

const router = express.Router()

// Configurer Multer avec des limites augmentées
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
})

// Promisify MinIO putObject pour utiliser async/await
const putObjectPromise = util.promisify((bucket, fileName, buffer, size, mimetype, callback) => {
  minioClient.putObject(bucket, fileName, buffer, size, mimetype, callback)
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

// Route pour téléverser un PDF
router.post("/upload", upload.single("fichier"), async (req, res) => {
  console.log("=== DÉBUT DE LA REQUÊTE D'UPLOAD ===")

  // Vérifier si un fichier a été envoyé
  if (!req.file) {
    console.log("Erreur: Aucun fichier envoyé")
    return res.status(400).json({ error: "Aucun fichier envoyé" })
  }

  try {
    console.log("Requête reçue:", {
      body: req.body,
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    })

    // Vérification des paramètres requis
    const { id_Sujet, TypeDeSujet, DateDeDepot, Delai } = req.body

    if (!id_Sujet) {
      console.log("Erreur: id_Sujet manquant")
      return res.status(400).json({ error: "Paramètre manquant: id_Sujet" })
    }

    if (!TypeDeSujet) {
      console.log("Erreur: TypeDeSujet manquant")
      return res.status(400).json({ error: "Paramètre manquant: TypeDeSujet" })
    }

    if (!DateDeDepot) {
      console.log("Erreur: DateDeDepot manquant")
      return res.status(400).json({ error: "Paramètre manquant: DateDeDepot" })
    }

    if (!Delai) {
      console.log("Erreur: Delai manquant")
      return res.status(400).json({ error: "Paramètre manquant: Delai" })
    }

    const bucketName = process.env.MINIO_BUCKET_NAME || "sujets"
    const fileName = `sujets/${uuidv4()}_${req.file.originalname}`
    console.log("Nom du fichier généré:", fileName)
    console.log("Bucket cible:", bucketName)

    // Vérifier si le bucket existe
    console.log("Vérification de l'existence du bucket...")
    const bucketExists = await minioClient.bucketExists(bucketName).catch((err) => {
      console.error("Erreur lors de la vérification du bucket:", err)
      throw new Error(`Erreur MinIO: ${err.message}`)
    })

    if (!bucketExists) {
      console.log(`Le bucket '${bucketName}' n'existe pas, tentative de création...`)
      await minioClient.makeBucket(bucketName, "us-east-1").catch((err) => {
        console.error("Erreur lors de la création du bucket:", err)
        throw new Error(`Impossible de créer le bucket: ${err.message}`)
      })
      console.log(`Bucket '${bucketName}' créé avec succès.`)
    } else {
      console.log(`Bucket '${bucketName}' existe déjà.`)
    }

    // Upload du fichier sur MinIO
    console.log("Tentative d'upload sur MinIO...")
    try {
      await new Promise((resolve, reject) => {
        minioClient.putObject(bucketName, fileName, req.file.buffer, req.file.size, req.file.mimetype, (err, etag) => {
          if (err) {
            console.error("Erreur upload MinIO:", err)
            return reject(err)
          }
          console.log("Upload MinIO réussi, etag:", etag)
          resolve(etag)
        })
      })
    } catch (err) {
      console.error("Erreur lors de l'upload du fichier sur MinIO:", err)
      return res.status(500).json({
        error: "Erreur lors de l'upload du fichier",
        details: err.message,
      })
    }

    // Générer l'URL du fichier
    const fileUrl = buildFileUrl(process.env.MINIO_ENDPOINT || "localhost", bucketName, fileName)

    console.log("URL du fichier générée:", fileUrl)

    // Enregistrer l'URL dans la base de données
    console.log("Tentative d'insertion dans la base de données...")
    try {
      const result = await new Promise((resolve, reject) => {
        db.query(
          "INSERT INTO Sujet (id_Sujet, TypeDeSujet, DateDeDepot, Delai, fichier_pdf) VALUES (?, ?, ?, ?, ?)",
          [id_Sujet, TypeDeSujet, DateDeDepot, Delai, fileUrl],
          (err, result) => {
            if (err) {
              console.error("Erreur SQL lors de l'ajout du sujet:", err)
              return reject(err)
            }
            console.log("Insertion dans la base de données réussie, résultat:", result)
            resolve(result)
          },
        )
      })

      console.log("=== FIN DE LA REQUÊTE D'UPLOAD (SUCCÈS) ===")
      return res.json({
        message: "Sujet ajouté avec succès !",
        pdfUrl: fileUrl,
        id: id_Sujet,
      })
    } catch (err) {
      console.error("Erreur lors de l'insertion dans la base de données:", err)
      return res.status(500).json({
        error: "Erreur lors de l'ajout du sujet dans la base de données",
        details: err.message,
      })
    }
  } catch (error) {
    console.error("Erreur serveur:", error)
    console.log("=== FIN DE LA REQUÊTE D'UPLOAD (ÉCHEC) ===")
    return res.status(500).json({
      error: "Erreur serveur",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Route pour récupérer un sujet par ID
router.get("/:id", (req, res) => {
  console.log(`Récupération du sujet avec ID: ${req.params.id}`)

  db.query("SELECT * FROM Sujet WHERE id_Sujet = ?", [req.params.id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la récupération du sujet:", err)
      return res.status(500).json({ error: "Erreur serveur", details: err.message })
    }

    if (result.length === 0) {
      console.log(`Sujet avec ID ${req.params.id} non trouvé`)
      return res.status(404).json({ error: "Sujet non trouvé" })
    }

    console.log(`Sujet avec ID ${req.params.id} trouvé:`, result[0])
    res.json(result[0]) // Retourne l'objet complet, y compris le lien PDF
  })
})

// Route pour récupérer tous les sujets
router.get("/", (req, res) => {
  console.log("Récupération de tous les sujets")

  db.query("SELECT * FROM Sujet", (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des sujets:", err)
      return res.status(500).json({ error: "Erreur serveur", details: err.message })
    }

    console.log(`${results.length} sujets trouvés`)
    res.json(results)
  })
})

module.exports = router

