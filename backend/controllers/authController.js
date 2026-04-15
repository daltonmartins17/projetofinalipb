const Utilizador = require("../models/Utilizador");
const Aluno = require("../models/Aluno");
const Professor = require("../models/Professor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se o usuário existe
    const user = await Utilizador.findOne({
      where: { email },
      attributes: ["id", "nome", "email", "senha", "tipo"],
      include: [
        {
          model: Aluno,
          as: "aluno",
          attributes: ["id"], // Inclui apenas o ID do aluno
          required: false, // Não é obrigatório ter aluno
        },
        {
          model: Professor,
          as: "professor",
          attributes: ["id"], // Inclui apenas o ID do professor
          required: false, // Não é obrigatório ter professor
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    // Verificar a senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    // Criar objeto de resposta do usuário
    const userResponse = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
    };

    // Adicionar IDs específicos com base no tipo
    if (user.tipo === "Aluno" && user.aluno) {
      userResponse.alunoId = user.aluno.id;
    } else if (user.tipo === "Professor" && user.professor) {
      userResponse.professorId = user.professor.id;
    }

    // Criar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        tipo: user.tipo,
        alunoId: user.tipo === "Aluno" ? user.aluno?.id : null,
        professorId: user.tipo === "Professor" ? user.professor?.id : null,
      },
      process.env.JWT_SECRET || "segredo_default_em_desenvolvimento",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login bem-sucedido",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Erro detalhado:", error);
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
};
