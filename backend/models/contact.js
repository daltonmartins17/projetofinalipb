const database = require("../config/database");

const Contact = database.sequelize.define(
  "contact",
  {
    name: {
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
    message: {
      type: database.Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "A mensagem não pode estar vazia",
        },
        len: {
          args: [10, 5000],
          msg: "A mensagem deve ter entre 10 e 5000 caracteres",
        },
      },
    },
    date: {
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
        fields: ["date"],
      },
    ],
  }
);

// Contact.sync({ force: true }); // Cria a tabela, apagando se já existir
// Contact.sync({ alter: true }); // Atualiza a tabela mantendo os dados

module.exports = Contact;
