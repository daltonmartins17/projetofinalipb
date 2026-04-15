const database = require("../config/database");

const Comentario = database.sequelize.define(
  "comentario",
  {
    conteudo: {
      type: database.Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "O conteúdo do comentário não pode estar vazio",
        },
        len: {
          args: [10, 2000],
          msg: "O comentário deve ter entre 10 e 2000 caracteres",
        },
      },
    },
    nome: {
      type: database.Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "O nome não pode estar vazio",
        },
        len: {
          args: [2, 100],
          msg: "O nome deve ter entre 2 e 100 caracteres",
        },
      },
    },
    email: {
      type: database.Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Por favor, forneça um e-mail válido",
        },
        notEmpty: {
          msg: "O e-mail não pode estar vazio",
        },
      },
    },
    dataPublicacao: {
      type: database.Sequelize.DATE,
      defaultValue: database.Sequelize.NOW,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        fields: ["email"],
      },
      {
        fields: ["dataPublicacao"],
      },
    ],
  }
);

// Comentario.sync({ force: true }); // Cria a tabela, apagando se já existir
// Comentario.sync({ alter: true }); // Atualiza a tabela mantendo os dados

module.exports = Comentario;
