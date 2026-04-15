const express = require("express");
const router = express.Router();
const Comentario = require("../models/Comentario");

// Obter todos os comentários
router.get("/", async (req, res) => {
  try {
    const comentarios = await Comentario.findAll({
      order: [["dataPublicacao", "DESC"]],
    });
    res.json(comentarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criar novo comentário
router.post("/", async (req, res) => {
  try {
    const { conteudo, nome, email } = req.body;

    if (!conteudo || !nome || !email) {
      return res.status(400).json({
        message: "Todos os campos são obrigatórios",
        requires: {
          conteudo: "string",
          nome: "string",
          email: "string (email válido)",
        },
      });
    }

    // Validação básica de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ message: "Por favor, forneça um e-mail válido" });
    }

    const novoComentario = await Comentario.create({
      conteudo,
      nome,
      email,
      dataPublicacao: new Date(),
    });

    res.status(201).json(novoComentario);
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    res.status(400).json({
      message: "Erro ao criar comentário",
      error: error.message,
    });
  }
});

module.exports = router;
