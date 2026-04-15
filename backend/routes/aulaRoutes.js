const express = require("express");
const router = express.Router();
const Aula = require("../models/Aula");
const Material = require("../models/Material");
const Curso = require("../models/Curso");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Sanitiza o nome do arquivo
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, Date.now() + "-" + sanitizedName);
  },
});

const upload = multer({ storage: storage });

// Rotas para Aulas
router.post("/aulas", upload.single("video"), async (req, res) => {
  try {
    const { titulo, cursoId, professorId } = req.body;
    const videoUrl = `uploads/${req.file.filename}`;

    const aula = await Aula.create({
      titulo,
      videoUrl,
      cursoId,
      professorId, // Certifique-se que está incluído aqui
    });

    res.status(201).json(aula);
  } catch (error) {
    console.error("Erro ao criar aula:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

//Rota para listar as aulas gravadas
router.get("/aulas/curso/:cursoId", async (req, res) => {
  try {
    const aulas = await Aula.findAll({
      where: {
        cursoId: req.params.cursoId,
        isLive: false, // ou isLive: null, dependendo de como você está armazenando
      },
    });
    res.status(200).json(aulas);
  } catch (error) {
    console.error("Erro ao buscar aulas:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


//rota para fazer download da aula gravada
router.get("/aulas/download/:id", async (req, res) => {
  try {
    const aula = await Aula.findByPk(req.params.id);
    if (!aula) {
      return res.status(404).json({ error: "Aula não encontrada" });
    }

    const filePath = path.join(__dirname, "../", aula.videoUrl);
    const fileName = aula.titulo || path.basename(aula.videoUrl);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}.mp4"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    res.sendFile(filePath);
  } catch (error) {
    console.error("Erro ao baixar aula:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


//rota para apagar as aulas 
router.delete("/aulas/:id", async (req, res) => {
  try {
    const aula = await Aula.findByPk(req.params.id);

    if (!aula) {
      return res.status(404).json({ error: "Aula não encontrada" });
    }

    // Se for aula ao vivo, apenas remove do banco (não tem arquivo para deletar)
    if (aula.isLive) {
      await aula.destroy();
      return res
        .status(200)
        .json({ message: "Aula ao vivo cancelada com sucesso" });
    }

    // Se for aula gravada, remove o arquivo de vídeo
    if (aula.videoUrl) {
      const filePath = path.join(__dirname, "../", aula.videoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await aula.destroy();
    res.status(200).json({ message: "Aula removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover aula:", error);
    res.status(500).json({
      error: "Erro ao remover aula",
      details: error.message,
    });
  }
});


// Rotas para Materiais
router.post("/materiais", upload.single("arquivo"), async (req, res) => {
  try {
    const { nome, cursoId, aulaId } = req.body;
    const arquivoUrl = `/uploads/${req.file.filename}`;

    const material = await Material.create({
      nome,
      arquivoUrl,
      cursoId,
      aulaId: aulaId || null,
    });

    res.status(201).json({
      ...material.toJSON(),
      // Adicione esta propriedade para o frontend saber o nome original do arquivo
      nomeArquivo: req.file.originalname,
    });
  } catch (error) {
    console.error("Erro ao criar material:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota para forçar download de material
router.get("/materiais/download/:id", async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({ error: "Material não encontrado" });
    }

    const filePath = path.join(__dirname, "../", material.arquivoUrl);
    const fileName = material.nome || path.basename(material.arquivoUrl);

    // Configura headers para forçar download
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    res.sendFile(filePath);
  } catch (error) {
    console.error("Erro ao baixar material:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


//Rota para listar os materiais
router.get("/materiais/curso/:cursoId", async (req, res) => {
  try {
    const materiais = await Material.findAll({
      where: { cursoId: req.params.cursoId },
    });
    res.status(200).json(materiais);
  } catch (error) {
    console.error("Erro ao buscar materiais:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


//Rota para apagar os materiais
router.delete("/materiais/:id", async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({ error: "Material não encontrado" });
    }

    // Remove o arquivo físico
    const filePath = path.join(__dirname, "../", material.arquivoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await material.destroy();
    res.status(200).json({ message: "Material removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover material:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Obter cursos de um professor específico
router.get("/professores/:professorId/cursos", async (req, res) => {
  console.log("Professor ID recebido:", req.params.professorId); // Verifique se está chegando
  try {
    const cursos = await Curso.findAll({
      where: { professorId: req.params.professorId },
      attributes: ["id", "nome"],
    });
    console.log("Cursos encontrados:", cursos); // Verifique o que está sendo buscado
    res.json(cursos);
  } catch (error) {
    console.error("Erro completo:", error);
    res.status(500).json({ error: error.message });
  }
});

// Para atualizar aulas
router.put("/aulas/:id", async (req, res) => {
  try {
    const { titulo } = req.body;
    const aula = await Aula.findByPk(req.params.id);

    if (!aula) {
      return res.status(404).json({ error: "Aula não encontrada" });
    }

    aula.titulo = titulo;
    await aula.save();

    res.status(200).json(aula);
  } catch (error) {
    console.error("Erro ao atualizar aula:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Para atualizar materiais
router.put("/materiais/:id", async (req, res) => {
  try {
    const { nome } = req.body;
    const material = await Material.findByPk(req.params.id);

    if (!material) {
      return res.status(404).json({ error: "Material não encontrado" });
    }

    material.nome = nome;
    await material.save();

    res.status(200).json(material);
  } catch (error) {
    console.error("Erro ao atualizar material:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// rota para buscar os dados de um aluno específico, que esteja no curso que tem a aula
router.get("/alunos/:id", async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }
    res.json(aluno);
  } catch (error) {
    console.error("Erro ao buscar aluno:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rotas para Aulas Ao Vivo
router.post("/aulas/live", async (req, res) => {
  try {
    const { titulo, cursoId, professorId } = req.body;

    // Gera um nome de sala único
    const roomName = `aula-${cursoId}-${Date.now()}`;
    const liveUrl = `https://meet.jit.si/${roomName}`;

    const aula = await Aula.create({
      titulo,
      cursoId,
      professorId,
      isLive: true,
      liveUrl,
      videoUrl: null,
    });

    res.status(201).json(aula);
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({
      error: "Erro ao criar sala",
      details: error.message,
    });
  }
});

//Rota para visualizar a aula ao vivo
router.get("/aulas/live/curso/:cursoId", async (req, res) => {
  try {
    const aulas = await Aula.findAll({
      where: {
        cursoId: req.params.cursoId,
        isLive: true,
      },
    });
    res.status(200).json(aulas);
  } catch (error) {
    console.error("Erro ao buscar aulas ao vivo:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


//apagar à aula ao vivo
router.delete("/aulas/live/:id", async (req, res) => {
  try {
    const aula = await Aula.findByPk(req.params.id);

    if (!aula) {
      return res.status(404).json({ error: "Aula ao vivo não encontrada" });
    }

    if (!aula.isLive) {
      return res.status(400).json({ error: "Esta não é uma aula ao vivo" });
    }

    await aula.destroy();
    res.status(200).json({ message: "Aula ao vivo cancelada com sucesso" });
  } catch (error) {
    console.error("Erro ao cancelar aula ao vivo:", error);
    res.status(500).json({
      error: "Erro ao cancelar aula ao vivo",
      details: error.message,
    });
  }
});

module.exports = router;
