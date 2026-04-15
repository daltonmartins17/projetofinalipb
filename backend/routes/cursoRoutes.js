const express = require("express");
const router = express.Router();
const Curso = require("../models/Curso");
const Aluno = require("../models/Aluno");
const Utilizador = require("../models/Utilizador");



// Rota para adicionar um curso
router.post("/cursos", async (req, res) => {
  try {
    const { nome, nivel, periodo, area, dataInicio, dataFim } = req.body;

    if (!nome || !nivel || !periodo || !area || !dataInicio || !dataFim) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const novoCurso = await Curso.create({
      nome,
      nivel,
      periodo,
      area,
      dataInicio,
      dataFim,
    });

    res.status(201).json(novoCurso);
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para listar todos os cursos
router.get("/cursos", async (req, res) => {
  try {
    const cursos = await Curso.findAll({
      order: [["dataInicio", "ASC"]], // Ordena por data de início
    });

    if (cursos.length === 0) {
      return res.status(404).json({ message: "Nenhum curso encontrado" });
    }

    res.status(200).json(cursos);
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para buscar um único curso pelo ID
router.get("/cursos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const curso = await Curso.findByPk(id);

    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    res.status(200).json(curso);
  } catch (error) {
    console.error("Erro ao buscar curso:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para editar um curso
router.put("/cursos/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, nivel, periodo, area, dataInicio, dataFim } = req.body;

  try {
    const curso = await Curso.findByPk(id);

    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    // Atualiza apenas os campos que foram enviados
    curso.nome = nome || curso.nome;
    curso.nivel = nivel || curso.nivel;
    curso.periodo = periodo || curso.periodo;
    curso.area = area || curso.area;
    curso.dataInicio = dataInicio || curso.dataInicio;
    curso.dataFim = dataFim || curso.dataFim;

    await curso.save();

    res.status(200).json(curso);
  } catch (error) {
    console.error("Erro ao editar curso:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para remover um curso
router.delete("/cursos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const curso = await Curso.findByPk(id);

    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    await curso.destroy();

    res.status(200).json({ message: "Curso removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover curso:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});



// Rota para listar alunos de um curso específico
router.get("/cursos/:id/alunos", async (req, res) => {
  const { id } = req.params;

  try {
    const curso = await Curso.findByPk(id, {
      include: [
        {
          model: Aluno,
          as: "alunos",
          include: [
            {
              model: Utilizador,
              as: "utilizador"
            }
          ]
        }
      ]
    });

    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    res.status(200).json(curso.alunos);
  } catch (error) {
    console.error("Erro ao buscar alunos do curso:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


module.exports = router;