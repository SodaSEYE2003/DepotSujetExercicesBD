require("dotenv").config();
const express = require("express");
const db = require("./config/db");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de correction est en marche !");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
//routes
const professeurRoutes = require("./routes/professeurs");
app.use("/professeurs", professeurRoutes);

const etudiantRoutes = require("./routes/etudiants");
app.use("/etudiants", etudiantRoutes);