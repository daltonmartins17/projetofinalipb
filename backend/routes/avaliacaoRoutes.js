const express = require("express");
const router = express.Router();
const Avaliacao = require("../models/Avaliacao");
const Submissao = require("../models/Submissao");
const Curso = require("../models/Curso");
const Aluno = require("../models/Aluno");
const Professor = require("../models/Professor");
const Utilizador = require("../models/Utilizador");
const { Op } = require("sequelize"); // Importe o operador do Sequelize


// Criar avaliação
router.post("/avaliacoes", async (req, res) => {
  try {
    const avaliacao = await Avaliacao.create(req.body);
    res.status(201).json(avaliacao);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// Obter uma avaliação específica pelo ID
router.get("/avaliacoes/:id", async (req, res) => {
  try {
    const avaliacao = await Avaliacao.findByPk(req.params.id);
    if (!avaliacao) {
      return res.status(404).json({ error: "Avaliação não encontrada" });
    }

    // Certifique-se de que perguntas seja um array
    const avaliacaoFormatada = {
      ...avaliacao.toJSON(),
      perguntas: avaliacao.perguntas ? JSON.parse(avaliacao.perguntas) : [],
    };

    res.json(avaliacaoFormatada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Listar avaliações de um curso (apenas as disponíveis - dentro do período de início e fim)
router.get("/cursos/:cursoId/avaliacoes", async (req, res) => {
  try {
    const agora = new Date(); // Pega a data/hora atual

    const avaliacoes = await Avaliacao.findAll({
      where: { 
        cursoId: req.params.cursoId,
        dataInicio: { [Op.lte]: agora }, // Data de início <= agora
        dataFim: { [Op.gte]: agora },    // Data de fim >= agora
      },
    });

    res.json(avaliacoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Submeter resposta com cálculo de pontuação
router.post("/avaliacoes/:id/submissoes", async (req, res) => {
  try {
    // Primeiro, obtenha a avaliação para verificar as respostas corretas
    const avaliacao = await Avaliacao.findByPk(req.params.id);
    if (!avaliacao) {
      return res.status(404).json({ error: "Avaliação não encontrada" });
    }

    const perguntas = avaliacao.perguntas ? JSON.parse(avaliacao.perguntas) : [];
    const respostasSubmetidas = req.body.respostas;
    
    // Calcular pontuação
    let pontuacao = 0;
    perguntas.forEach((pergunta, index) => {
      if (respostasSubmetidas[index] && 
          respostasSubmetidas[index].resposta === pergunta.respostaCorreta) {
        pontuacao += pergunta.pontuacao || 1; // Assume 1 ponto se não especificado
      }
    });

    // Criar submissão com pontuação calculada
    const submissao = await Submissao.create({
      ...req.body,
      avaliacaoId: req.params.id,
      pontuacao: pontuacao,
      dataSubmissao: new Date()
    });

    res.status(201).json({
      ...submissao.toJSON(),
      avaliacao: {
        titulo: avaliacao.titulo,
        pontuacaoMaxima: avaliacao.pontuacaoMaxima
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// Obter todas as submissões de um aluno específico
router.get("/alunos/:alunoId/submissoes", async (req, res) => {
  try {
    const submissoes = await Submissao.findAll({
      where: { alunoId: req.params.alunoId },
      include: [{
        model: Avaliacao,
        attributes: ['titulo', 'pontuacaoMaxima']
      }]
    });
    
    res.json(submissoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Obter todas as submissões dos alunos de um professor

router.get("/professores/:professorId/avaliacoes", async (req, res) => {
  try {
    const avaliacoes = await Avaliacao.findAll({
      where: { professorId: req.params.professorId },
      include: [
        {
          model: Curso,
          as: "curso",
          attributes: ["nome"],
        },
      ],
    });

    const avaliacoesComSubmissoes = await Promise.all(
      avaliacoes.map(async (avaliacao) => {
        try {
          const submissoes = await Submissao.findAll({
            where: { avaliacaoId: avaliacao.id },
            include: [
              {
                model: Aluno,
                as: "aluno", // Use o mesmo alias definido na associação
                include: [
                  {
                    model: Utilizador,
                    as: "utilizador",
                    attributes: ["nome"],
                    required: false,
                  },
                ],
                required: false,
              },
            ],
          });

          return {
            ...avaliacao.toJSON(),
            cursoNome: avaliacao.curso?.nome,
            perguntas: avaliacao.perguntas
              ? JSON.parse(avaliacao.perguntas)
              : [],
            submissoes: submissoes.map((submissao) => ({
              id: submissao.id,
              alunoId: submissao.alunoId,
              // Acesse através do alias correto
              nomeAluno:
                submissao.aluno?.utilizador?.nome || "Aluno desconhecido",
              pontuacao: submissao.pontuacao,
              tempo: submissao.tempo,
              entregue:
                submissao.dataSubmissao?.toLocaleString() || "Data inválida",
            })),
          };
        } catch (error) {
          console.error(
            `Erro ao carregar submissões da avaliação ${avaliacao.id}:`,
            error
          );
          return {
            ...avaliacao.toJSON(),
            submissoes: [],
          };
        }
      })
    );

    res.json(avaliacoesComSubmissoes);
  } catch (error) {
    console.error("Erro detalhado:", error);
    res.status(500).json({
      error: "Erro ao carregar avaliações",
      details: error.message,
    });
  }
});

module.exports = router;
