const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Contact = require("../models/contact");


// Configuração do transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "daltonrafaprojetofinal@gmail.com",
    pass: process.env.EMAIL_PASS || "pqbwimagrkadinux",
  },
});

// Verifica conexão com o servidor de email
transporter.verify(function (error, success) {
  if (error) {
    console.log("Erro na conexão com o servidor de email:", error);
  } else {
    console.log("Servidor de email pronto para enviar mensagens");
  }
});

// Rota para salvar contato e enviar email
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validação dos dados
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    // Salva no banco de dados
    const contact = await Contact.create({
      name,
      email,
      message,
    });

    // Configura o email
    const mailOptions = {
      from: process.env.EMAIL_USER || "daltonrafaprojetofinal@gmail.com",
      to: "daltonrafaprojetofinal@gmail.com", // Email de destino fixo
      subject: `Nova mensagem de contato de ${name}`,
      text: `
        Nome: ${name}
        Email: ${email}
        Mensagem: ${message}
        
        Data: ${contact.date}
      `,
    };

    // Envia o email
    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Mensagem enviada com sucesso!",
      contact,
    });
  } catch (error) {
    console.error("Erro ao processar contato:", error);
    res.status(500).json({
      error: "Erro ao processar contato",
      details: error.message,
    });
  }
});

// Rota para listar todos os contatos (opcional, para administração), porém não usarei
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      order: [["date", "DESC"]],
    });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Erro ao buscar contatos:", error);
    res.status(500).json({
      error: "Erro ao buscar contatos",
      details: error.message,
    });
  }
});

module.exports = router;
