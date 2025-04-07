const Minio = require("minio")
const dotenv = require("dotenv")

dotenv.config()

// Fonction pour nettoyer l'endpoint (supprimer http:// ou https://)
function cleanEndpoint(endpoint) {
  if (!endpoint) return "localhost"

  // Supprimer le protocole s'il existe
  return endpoint.replace(/^https?:\/\//, "")
}

// Afficher les informations de configuration
console.log("Configuration MinIO:")
console.log(`- MINIO_ENDPOINT: ${process.env.MINIO_ENDPOINT || "non défini (utilisation de localhost)"}`)
console.log(`- MINIO_PORT: ${process.env.MINIO_PORT || "non défini (utilisation de 9000)"}`)
console.log(`- MINIO_USE_SSL: ${process.env.MINIO_USE_SSL || "non défini (utilisation de false)"}`)
console.log(`- MINIO_BUCKET_NAME: ${process.env.MINIO_BUCKET_NAME || "non défini (utilisation de sujets)"}`)

// Configuration de MinIO avec des valeurs par défaut si les variables d'environnement ne sont pas définies
const minioClient = new Minio.Client({
  endPoint: cleanEndpoint(process.env.MINIO_ENDPOINT) || "localhost",
  port: Number.parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
})

const bucketName = process.env.MINIO_BUCKET_NAME || "sujets"

// Fonction pour initialiser le bucket
async function initializeBucket() {
  try {
    console.log(`Vérification de l'existence du bucket '${bucketName}'...`)
    const exists = await minioClient.bucketExists(bucketName)

    if (!exists) {
      console.log(`Le bucket '${bucketName}' n'existe pas, création en cours...`)
      await minioClient.makeBucket(bucketName, "us-east-1")
      console.log(`✅ Bucket '${bucketName}' créé avec succès.`)

      // Définir une politique pour rendre les objets publiquement accessibles
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
      console.log(`✅ Politique du bucket '${bucketName}' définie avec succès.`)
    } else {
      console.log(`✅ Bucket '${bucketName}' existe déjà.`)
    }

    return true
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation du bucket MinIO:", err)
    return false
  }
}

// Initialiser le bucket au démarrage
initializeBucket().then((success) => {
  if (success) {
    console.log("✅ Initialisation de MinIO réussie.")
  } else {
    console.error("❌ Échec de l'initialisation de MinIO.")
  }
})

module.exports = minioClient

