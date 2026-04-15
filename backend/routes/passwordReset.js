const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { Sequelize } = require("sequelize");
const Utilizador = require("../models/Utilizador");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Configuração do transporter (deve ser igual ao do seu server.js)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Rota para solicitar redefinição de palavra-passe
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Verificar se o utilizador existe
    const user = await Utilizador.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "E-mail não encontrado." });
    }

    // 2. Gerar token e definir expiração
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // 1 hora

    // 3. Atualizar utilizador com o token
    await user.update({
      resetToken,
      resetTokenExpires,
    });

    // 4. Enviar e-mail
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Recuperação de Palavra-passe - EducaWeb",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Redefinição de Palavra-passe</h2>
            <p>Olá,</p>
            <p>Solicitou a redefinição da palavra-passe para a sua conta no EducaWeb.</p>
            <p>Clique no botão abaixo para redefinir a sua palavra-passe:</p>
            <a href="http://localhost:3000/reset-password/${resetToken}" 
               style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px;">
              Redefinir Palavra-passe
            </a>
            <p>Se não solicitou esta redefinição, por favor ignore este e-mail.</p>
            <p>O link expirará dentro de 1 hora.</p>
            <p>Atenciosamente,<br>Equipa EducaWeb</p>
          </div>
        `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "E-mail de recuperação enviado com sucesso!" });
  } catch (error) {
    console.error("Erro no passwordReset:", error);
    res
      .status(500)
      .json({ message: "Erro ao solicitar redefinição de palavra-passe" });
  }
});

// Rota para redefinir a palavra-passe
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 1. Encontrar utilizador pelo token válido
    const user = await Utilizador.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: { [Sequelize.Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido ou expirado" });
    }

    // 2. Atualizar palavra-passe e limpar token
    user.senha = newPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;

    // O hook beforeUpdate vai fazer hash da palavra-passe automaticamente
    await user.save();

    res.json({ message: "Palavra-passe redefinida com sucesso!" });
  } catch (error) {
    console.error("Erro ao redefinir palavra-passe:", error);
    res.status(500).json({ message: "Erro ao redefinir palavra-passe" });
  }
});

module.exports = router;
