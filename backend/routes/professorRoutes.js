const express = require("express");
const router = express.Router();
const Utilizador = require("../models/Utilizador");
const Professor = require("../models/Professor");
const Curso = require("../models/Curso");
//ADM


// Rota para listar todos os professores
router.get("/professores", async (req, res) => {
  try {
    const professores = await Utilizador.findAll({
      where: { tipo: "Professor" },
      include: [{ model: Professor, as: "professor" }],
    });

    res.status(200).json(professores);
  } catch (error) {
    console.error("Erro ao listar professores:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para buscar um único professor pelo ID (NOVA ROTA)
router.get("/professores/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const professor = await Professor.findByPk(id, {
      include: [{ model: Utilizador, as: "utilizador" }],
    });

    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    res.status(200).json(professor);
  } catch (error) {
    console.error("Erro ao buscar professor:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para criar um novo professor
router.post("/professores", async (req, res) => {
  const { nome, email, senha, morada, contacto } = req.body;

  console.log(req.body);

  if (!nome || !email || !senha || !morada || !contacto) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const novoUtilizador = await Utilizador.create({
      nome,
      email,
      senha,
      tipo: "Professor",
      morada,
      contacto,
      
    });

    const novoProfessor = await Professor.create({
      Utilizador_ID: novoUtilizador.id,
    });

    res.status(200).json({
      message: "Professor criado com sucesso",
      utilizador: novoUtilizador,
      professor: novoProfessor,
    });
  } catch (error) {
    console.error("Erro ao criar professor:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


// Rota para editar as informações de um professor
router.put("/professores/:id", async (req, res) => {
  const { id } = req.params;
  const { utilizador } = req.body;

  if (!utilizador || !utilizador.nome || !utilizador.email || !utilizador.morada || !utilizador.contacto) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const professor = await Professor.findByPk(id);

    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    const utilizadorAtualizado = await Utilizador.update(
      {
        nome: utilizador.nome,
        email: utilizador.email,
        morada: utilizador.morada,
        contacto: utilizador.contacto,
      },
      {
        where: { id: professor.Utilizador_ID },
      }
    );

    res.status(200).json({ message: "Informações do professor atualizadas com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar professor:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});



// Rota para listar cursos de um professor
router.get("/professores/:id/listacursos", async (req, res) => {
  const { id } = req.params;

  try {
    const professor = await Professor.findByPk(id, {
      include: [{ model: Curso, as: "cursos" }],
    });

    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    console.log(professor.cursos);
    res.status(200).json(professor.cursos);

  } catch (error) {
    console.error("Erro ao buscar cursos do professor:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


// Rota para adicionar um curso a um professor
router.put("/professores/:id/cursos", async (req, res) => {
  const { id } = req.params; // id do UTILIZADOR
  const { cursoId } = req.body;

  console.log(cursoId);

  try {
    const professor = await Professor.findOne({
      where: { Utilizador_ID: id },
    });

    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    const [updatedRows] = await Curso.update(
      { professorId: professor.id },
      { where: { id: cursoId } }
    );

    if (updatedRows === 0) {
      return res
        .status(200)
        .json({ error: "Curso não encontrado ou não atualizado" });
    }

    console.log(updatedRows);

    res.status(200).json({ message: "Curso atribuído ao professor" });
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para editar curso atribuído a um professor
router.put("/professores/:id/cursos/:cursoRelacaoId", async (req, res) => {
  const { cursoRelacaoId } = req.params;
  const { novoCursoId } = req.body;

  try {
    const relacao = await ProfessorCurso.findByPk(cursoRelacaoId);
    if (!relacao) {
      return res.status(404).json({ error: "Relação não encontrada" });
    }

    const curso = await Curso.findByPk(novoCursoId);
    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    relacao.cursoId = novoCursoId;
    await relacao.save();

    res
      .status(200)
      .json({ message: "Curso atualizado para o professor", relacao });
  } catch (error) {
    console.error("Erro ao atualizar curso do professor:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para remover curso de um professor (ATUALIZADA)
router.delete("/professores/:professorId/cursos/:cursoId", async (req, res) => {
  const { professorId, cursoId } = req.params;

  try {
    const curso = await Curso.findByPk(cursoId);
    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    // Verifica se o curso realmente pertence ao professor
    if (curso.professorId != professorId) {
      return res.status(400).json({ error: "Este curso não está associado ao professor" });
    }

    // Remove a associação definindo professorId como null
    await curso.update({ professorId: null });

    res.status(200).json({ message: "Curso removido do professor com sucesso" });
  } catch (error) {
    console.error("Erro ao remover curso do professor:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para excluir um professor e seu utilizador
router.delete("/professores/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const professor = await Utilizador.destroy({
      where: { id: id },
    });

    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    res
      .status(200)
      .json({ message: "Professor e utilizador removidos com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir professor:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

module.exports = router;
