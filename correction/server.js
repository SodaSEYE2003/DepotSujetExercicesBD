require("dotenv").config()
const express = require("express")
const db = require("./config/db")
const cors = require("cors")

const app = express()

// Configuration CORS plus permissive pour le développement
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Utilise la variable d'environnement ou autorise toutes les origines
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Disposition"],
  }),
)

// Middleware pour parser le JSON avec une limite augmentée
app.use(express.json({ limit: "50mb" }))

// Middleware pour les données de formulaire avec une limite augmentée
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

app.get("/", (req, res) => {
  res.send("API de correction est en marche !")
})

// Routes
const professeurRoutes = require("./routes/professeurs")
app.use("/professeurs", professeurRoutes)

const etudiantRoutes = require("./routes/etudiants")
app.use("/etudiants", etudiantRoutes)

const sujetRoutes = require("./routes/sujet")
app.use("/sujets", sujetRoutes)

// Route de test pour vérifier la connexion à la base de données
app.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS result", (err, results) => {
    if (err) {
      console.error("Erreur de connexion à la base de données:", err)
      return res.status(500).json({ error: "Erreur de connexion à la base de données", details: err.message })
    }
    res.json({ message: "Connexion à la base de données réussie", result: results[0].result })
  })
})

// Route de test pour vérifier la connexion à MinIO
app.get("/test-minio", async (req, res) => {
  const minioClient = require("./upload/minio")
  const bucketName = process.env.MINIO_BUCKET_NAME || "sujets"

  try {
    const exists = await minioClient.bucketExists(bucketName)
    res.json({
      message: exists ? `Bucket '${bucketName}' existe` : `Bucket '${bucketName}' n'existe pas`,
      config: {
        endpoint: process.env.MINIO_ENDPOINT,
        port: process.env.MINIO_PORT,
        useSSL: process.env.MINIO_USE_SSL === "true",
        bucketName: bucketName,
      },
    })
  } catch (err) {
    console.error("Erreur de connexion à MinIO:", err)
    res.status(500).json({ error: "Erreur de connexion à MinIO", details: err.message })
  }
})

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur non gérée:", err)
  res.status(500).json({
    error: "Une erreur est survenue sur le serveur",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
})

// Middleware pour gérer les routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`)
  console.log(`Variables d'environnement chargées:
    - DB_HOST: ${process.env.DB_HOST ? "défini" : "non défini"}
    - MINIO_ENDPOINT: ${process.env.MINIO_ENDPOINT ? "défini" : "non défini"}
    - MINIO_BUCKET_NAME: ${process.env.MINIO_BUCKET_NAME ? "défini" : "non défini"}
  `)
})

