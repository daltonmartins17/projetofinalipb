const User = require("../models/Utilizador");

exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    res.json({ message: "Usuário criado com sucesso!", user });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
};