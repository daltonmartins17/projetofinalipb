const express = require("express");
const router = express.Router();
const Utilizador = require("../models/Utilizador");
const Aluno = require("../models/Aluno");
const Curso = require("../models/Curso");


// Rota para listar todos os alunos
router.get("/alunos", async (req, res) => {
  try {
    const alunos = await Utilizador.findAll({
      where: { tipo: "Aluno" },
      include: [
        { 
          model: Aluno, 
          as: "aluno",
          include: [{
            model: Curso,
            as: "curso"
          }]
        }
      ],
    });

    res.status(200).json(alunos);
  } catch (error) {
    console.error("Erro ao listar alunos:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


// Rota para buscar um único aluno pelo ID (NOVA ROTA)
router.get("/alunos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const aluno = await Aluno.findByPk(id, {
      include: [{ model: Utilizador, as: "utilizador" }],
    });

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    res.status(200).json(aluno);
  } catch (error) {
    console.error("Erro ao buscar aluno:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});




// Rota para criar um novo aluno
router.post("/alunos", async (req, res) => {
 
    const { nome, email, senha, morada, contacto } = req.body;

      console.log(req.body);


    if (!nome || !email || !senha || !morada || !contacto) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    // 1. Criar utilizador
     try {
       const novoUtilizador = await Utilizador.create({
         nome,
         email,
         senha,
         tipo: "Aluno", // Tipo 'Aluno'
         morada,
         contacto,
       });

       // 2. Criar a entrada na tabela Aluno com o id do utilizador
       const novoAluno = await Aluno.create({
         Utilizador_ID: novoUtilizador.id, // Aqui o utilizador_Id se refere ao id do Utilizador criado
       });

       res.status(201).json({
         message: "Aluno criado com sucesso",
         utilizador: novoUtilizador,
         aluno: novoAluno,
       });
     } catch (error) {
       console.error("Erro ao criar aluno:", error);
       res.status(500).json({ error: "Erro no servidor" });
     }
});


//rota para editar em aluno
router.put("/alunos/:id", async (req, res) => {
  const { id } = req.params;
  const { utilizador } = req.body;

  if (
    !utilizador ||
    !utilizador.nome ||
    !utilizador.email ||
    !utilizador.morada ||
    !utilizador.contacto
  ) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const aluno = await Aluno.findByPk(id);

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    await Utilizador.update(
      {
        nome: utilizador.nome,
        email: utilizador.email,
        morada: utilizador.morada,
        contacto: utilizador.contacto,
      },
      { where: { id: aluno.Utilizador_ID } }
    );

    res
      .status(200)
      .json({ message: "Informações do aluno atualizadas com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});



// Rota para excluir um aluno e seu utilizador
router.delete("/alunos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const aluno = await Utilizador.destroy({
      where: { id: id },
    });

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    res
      .status(200)
      .json({ message: "Aluno e utilizador removidos com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para listar cursos de um aluno
router.get("/alunos/:id/listacursos", async (req, res) => {
  const { id } = req.params;

  try {
    const aluno = await Aluno.findByPk(id, {
      include: [{ model: Curso, as: "curso" }],
    });

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    // Se o aluno tem um curso, retornamos como array
    const cursos = aluno.curso ? [aluno.curso] : [];
    res.status(200).json(cursos);

  } catch (error) {
    console.error("Erro ao buscar cursos do aluno:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para adicionar/atualizar curso de um aluno
router.put("/alunos/:id/cursos", async (req, res) => {
  const { id } = req.params; // id do aluno (tabela Aluno)
  const { cursoId } = req.body;

  try {
    const aluno = await Aluno.findByPk(id);
    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    // Verificar se o curso existe
    const curso = await Curso.findByPk(cursoId);
    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    // Atualizar o curso do aluno
    await aluno.update({ cursoId });

    res.status(200).json({ message: "Curso atribuído ao aluno com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar curso do aluno:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para remover curso de um aluno
router.delete("/alunos/:id/cursos", async (req, res) => {
  const { id } = req.params; // id do aluno (tabela Aluno)

  try {
    const aluno = await Aluno.findByPk(id);
    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    // Remover a associação do curso
    await aluno.update({ cursoId: null });

    res.status(200).json({ message: "Curso removido do aluno com sucesso" });
  } catch (error) {
    console.error("Erro ao remover curso do aluno:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});




module.exports = router;
