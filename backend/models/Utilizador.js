const database = require("../config/database");
const bcrypt = require("bcrypt");

const Utilizador = database.sequelize.define(
  "utilizador",
  {
    nome: {
      type: database.Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: database.Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    morada: {
      type: database.Sequelize.STRING,
      allowNull: false,
    },
    senha: {
      type: database.Sequelize.STRING,
      allowNull: false,
    },
    contacto: {
      type: database.Sequelize.STRING,
    },
    tipo: {
      type: database.Sequelize.STRING,
      allowNull: false,
      defaultValue: "aluno",
    },
    resetToken: {
      type: database.Sequelize.STRING,
      allowNull: true,
    },
    resetTokenExpires: {
      type: database.Sequelize.DATE,
      allowNull: true,
    },
    isVerified: {
      type: database.Sequelize.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    hooks: {
      beforeCreate: (user) => {
        user.senha = bcrypt.hashSync(user.senha, bcrypt.genSaltSync(10));
      },
      beforeUpdate: (user) => {
        if (user.changed("senha")) {
          user.senha = bcrypt.hashSync(user.senha, bcrypt.genSaltSync(10));
        }
      },
    },
  }
);

// Método para comparar senhas
Utilizador.prototype.validPassword = function (password) {
  return bcrypt.compareSync(password, this.senha);
};

// Método para gerar token de reset
Utilizador.prototype.generateResetToken = function () {
  this.resetToken = crypto.randomBytes(20).toString("hex");
  this.resetTokenExpires = Date.now() + 3600000; // 1 hora de expiração
  return this.resetToken;
};

// Utilizador.sync({ force: true }); // Cria a tabela
// Utilizador.sync({ alter: true }); // Atualiza a tabela se houver mudanças)

module.exports = Utilizador;
