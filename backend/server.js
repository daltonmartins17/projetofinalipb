require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/utilizadorRoutes");
const cursoRoutes = require("./routes/cursoRoutes");
const professorRoutes = require("./routes/professorRoutes");
const alunoRoutes = require("./routes/alunoRoutes");
const comentarioRoutes = require("./routes/comentarioRoutes")
const avaliacaoRoutes = require("./routes/avaliacaoRoutes");
const aulaRoutes = require("./routes/aulaRoutes");
const path = require('path');  // Importe o módulo path
const inscricaoRoutes = require("./routes/inscricaoRoutes");
const emailRoutes = require("./routes/emailRoutes");
const contactRoutes = require("./routes/contactRoutes");
const passwordResetRoutes = require("./routes/passwordReset");
//const fs = require('fs');      // Importe o módulo fs (se estiver usando)
//const router = express.Router();
//const nodemailer = require("nodemailer");
//const sequelize = require("./config/database"); // Configuração do banco de dados

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
// Configuração do Nodemailer para envio de e-mails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Função para enviar e-mail de confirmação
const sendConfirmationEmail = async (name, email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Registo Concluído",
    text: `Olá ${name},\n\nSeu registo foi concluído com sucesso!\n\n Por favor aguarde pelo email de ativação.\n\nObrigado!\nEducaWeb`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail enviado para ${email}`);
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
};

// Rota de registo com envio de e-mail
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Aqui você deve salvar o usuário no banco de dados antes de enviar o e-mail
    // Exemplo fictício:
    // await User.create({ name, email, password });

    // Enviar e-mail de confirmação
    await sendConfirmationEmail(name, email);

    res.status(200).json({ message: "registo concluído e e-mail enviado!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao registrar usuário.", error });
  }
}); 

*/

// Usando as rotas
app.use("/utilizador", userRoutes);
app.use(cursoRoutes);
app.use(professorRoutes);
app.use(alunoRoutes);
app.use(avaliacaoRoutes);
app.use(aulaRoutes);
app.use("/comentarios", comentarioRoutes);
app.use("/inscricoes", inscricaoRoutes);
app.use("/email", emailRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/password-reset", passwordResetRoutes);

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log("Servidor iniciado na porta", PORT);
});
