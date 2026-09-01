// app.js
require("dotenv").config();
const express = require("express");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
app.use(express.json());

app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
