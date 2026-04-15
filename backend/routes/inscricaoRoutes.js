const express = require("express");
const router = express.Router();
const Inscricao = require("../models/Inscricao");
const Aluno = require("../models/Aluno");
const Curso = require("../models/Curso");
const Utilizador = require("../models/Utilizador");

// Criar nova inscrição
router.post("/", async (req, res) => {
  try {
    const { alunoId, cursoId, nivel, periodo, status = "pendente" } = req.body;

    // Verificar se o aluno existe
    const aluno = await Aluno.findByPk(alunoId, {
      include: [{ model: Utilizador, as: "utilizador" }],
    });
    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    // Verificar se o curso existe
    const curso = await Curso.findByPk(cursoId);
    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    // Criar a inscrição
    const inscricao = await Inscricao.create({
      alunoId,
      cursoId,
      nivel,
      periodo,
    });

    // Retornar a inscrição com informações relacionadas
    const inscricaoCompleta = await Inscricao.findByPk(inscricao.id, {
      include: [
        {
          model: Aluno,
          as: "aluno",
          include: [{ model: Utilizador, as: "utilizador" }],
        },
        { model: Curso, as: "curso" },
      ],
    });

    res.status(201).json(inscricaoCompleta);
  } catch (error) {
    console.error("Erro ao criar inscrição:", error);
    res.status(500).json({ error: "Erro ao processar a inscrição" });
  }
});

// Listar todas as inscrições (opcional)
router.get("/", async (req, res) => {
  try {
    const inscricoes = await Inscricao.findAll({
      include: [
        {
          model: Aluno,
          as: "aluno",
          include: [{ model: Utilizador, as: "utilizador" }],
        },
        { model: Curso, as: "curso" },
      ],
    });
    res.json(inscricoes);
  } catch (error) {
    console.error("Erro ao buscar inscrições:", error);
    res.status(500).json({ error: "Erro ao buscar inscrições" });
  }
});

// Listar inscrições de um aluno específico
router.get("/aluno/:alunoId", async (req, res) => {
  try {
    const { alunoId } = req.params;
    const inscricoes = await Inscricao.findAll({
      where: { alunoId },
      include: [{ model: Curso, as: "curso" }],
    });
    res.json(inscricoes);
  } catch (error) {
    console.error("Erro ao buscar inscrições do aluno:", error);
    res.status(500).json({ error: "Erro ao buscar inscrições do aluno" });
  }
});

module.exports = router;
