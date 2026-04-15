const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Configuração do transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "daltonrafaprojetofinal@gmail.com",
    pass: process.env.EMAIL_PASS || "pqbwimagrkadinux",
  },
});

// Função para gerar certificado PDF
const generateCertificate = (alunoNome, cursoNome) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
      });

      // Criar buffer para o PDF
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Adicionar fundo branco
      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");

      // Caminho para o logo - ajuste para o caminho absoluto
      const logoPath = path.resolve(
        __dirname,
        "../../frontend/src/img/logotipo_educaweb_resized.png"
      );
      console.log("Tentando carregar logo de:", logoPath); // Debug

      // Adicionar logo (se existir)
      if (fs.existsSync(logoPath)) {
        console.log("Logo encontrado, adicionando ao PDF");
        doc.image(logoPath, 50, 50, { width: 150 });
      } else {
        console.log("Logo não encontrado no caminho:", logoPath);
        // Adiciona texto alternativo
        doc.fontSize(20).fillColor("#333333").text("EducaWeb", 50, 50);
      }

      // Configurar fonte padrão (importante para o texto aparecer)
      doc.font("Helvetica");

      // Adicionar título
      doc
        .fontSize(32)
        .fillColor("#2c3e50")
        .text("CERTIFICADO DE CONCLUSÃO", {
          align: "center",
          underline: true,
        })
        .moveDown(2);

      // Adicionar texto principal
      doc
        .fontSize(18)
        .fillColor("#000000")
        .text("Certificamos que", { align: "center" })
        .moveDown(0.5);

      doc
        .fontSize(28)
        .font("Helvetica-Bold")
        .text(alunoNome, { align: "center" })
        .moveDown(0.5);

      doc
        .fontSize(18)
        .font("Helvetica")
        .text("concluiu com êxito o curso de", { align: "center" })
        .moveDown(0.5);

      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text(cursoNome || "Nome do Curso", { align: "center" })
        .moveDown(2);

      doc
        .fontSize(14)
        .text(`Data de emissão: ${new Date().toLocaleDateString("pt-BR")}`, {
          align: "center",
        })
        .moveDown(3);

      // Adicionar assinaturas
      const lineY = doc.y;
      doc
        .moveTo(150, lineY)
        .lineTo(doc.page.width - 150, lineY)
        .stroke();

      doc.fontSize(12).text("Diretor EducaWeb", 150, lineY + 20, {
        width: 200,
        align: "center",
      });

      doc
        .fontSize(12)
        .text("Coordenador do Curso", doc.page.width - 350, lineY + 20, {
          width: 200,
          align: "center",
        });

      // Finalizar o documento
      doc.end();
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);
      reject(error);
    }
  });
};

// Rota para quando o aluno pede uma inscrição e o administrador recebe um email
router.post("/notificacao", async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
      return res
        .status(400)
        .json({ error: "Destinatário, assunto e texto são obrigatórios" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Notificação enviada com sucesso" });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    res.status(500).json({ error: "Erro ao enviar notificação" });
  }
});

// Rota para envio de certificados (com anexo)
router.post('/certificado', async (req, res) => {
  try {
    const { to, subject, text, alunoNome, cursoNome } = req.body;
    
    // Validação
    if (!to || !subject || !text || !alunoNome) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    // Gera o PDF do certificado
    const pdfBuffer = await generateCertificate(alunoNome, cursoNome);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments: [{
        filename: `Certificado_${alunoNome.replace(/\s/g, "_")}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      }]
    };

    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Certificado enviado com sucesso" });

  } catch (error) {
    console.error("Erro ao enviar certificado:", error);
    res.status(500).json({ error: "Erro ao enviar certificado" });
  }
});

// Rota para enviar avisos dos professores em massa para múltiplos alunos
router.post("/avisos", async (req, res) => {
  try {
    const { alunos, assunto, mensagem, remetenteEmail, remetenteNome } =
      req.body;

    // Validação dos dados
    if (!alunos || !Array.isArray(alunos) || alunos.length === 0) {
      return res
        .status(400)
        .json({ error: "Lista de alunos inválida ou vazia" });
    }

    if (!assunto || !mensagem) {
      return res
        .status(400)
        .json({ error: "Assunto e mensagem são obrigatórios" });
    }

    // Configurar o nome do remetente (se disponível)
    const from = remetenteNome
      ? `"${remetenteNome}" <${remetenteEmail || process.env.EMAIL_USER}>`
      : process.env.EMAIL_USER;

    const resultados = [];

    for (const aluno of alunos) {
      try {
        const mailOptions = {
          from: from, // Usa o remetente personalizado
          to: aluno.email,
          subject: assunto,
          text: `${mensagem}\n\n--\nEnviado por: ${
            remetenteNome || "Professor"
          } (${remetenteEmail || "não informado"})`,
          // Você pode adicionar html se quiser
        };

        const info = await transporter.sendMail(mailOptions);
        resultados.push({
          alunoId: aluno.id,
          email: aluno.email,
          status: "enviado",
          messageId: info.messageId,
        });
      } catch (error) {
        resultados.push({
          alunoId: aluno.id,
          email: aluno.email,
          status: "erro",
          error: error.message,
        });
      }
    }

    const enviadosComSucesso = resultados.filter((r) => r.status === "enviado");

    if (enviadosComSucesso.length === alunos.length) {
      return res.status(200).json({
        success: true,
        message: `Todos os ${alunos.length} avisos foram enviados com sucesso`,
        resultados,
      });
    } else {
      return res.status(207).json({
        success: false,
        message: `${enviadosComSucesso.length} de ${alunos.length} avisos enviados`,
        resultados,
      });
    }
  } catch (error) {
    console.error("Erro no servidor ao enviar avisos:", error);
    res.status(500).json({
      error: "Erro interno no servidor ao processar os avisos",
      details: error.message,
    });
  }
});

// rota para quando o administrador adiciona o aluno a um curso e o aluno recebe a confirmação por email
router.post('/confirmacao-inscricao', async (req, res) => {
  try {
    const { to, alunoNome, cursoNome } = req.body;
    
    if (!to || !alunoNome || !cursoNome) {
      return res.status(400).json({ error: "Destinatário, nome do aluno e nome do curso são obrigatórios" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `Confirmação de Inscrição no Curso ${cursoNome}`,
      text: `Olá ${alunoNome},\n\nSua inscrição no curso ${cursoNome} foi confirmada pelo administrador.\n\nAcesse sua conta para ver os detalhes.\n\nAtenciosamente,\nEquipe EducaWeb`
    };

    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email de confirmação enviado com sucesso" });
    
  } catch (error) {
    console.error("Erro ao enviar email de confirmação:", error);
    res.status(500).json({ error: "Erro ao enviar email de confirmação" });
  }
});

module.exports = router;
