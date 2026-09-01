// routes/aiRoutes.js
const express = require("express");
const sanitizeData = require("../middleware/sanitizeData");
const { llamarAPIdeIA } = require("../services/aiService");
const desanitizar = require("../utils/desanitizar");

const router = express.Router();

router.post("/chat", sanitizeData, async (req, res) => {
  try {
    
    const respuestaIA = await llamarAPIdeIA(req.sanitizedPrompt);
    //Devolvemos respuesta que es la sanitizacion del prompt
    return res.json({ respuesta: respuestaIA });
  } catch (error) {
    console.error("[aiRoutes] Error:", error.message);
    return res.status(502).json({ error: "Error al obtener respuesta de la IA." });
  }
});

module.exports = router;
