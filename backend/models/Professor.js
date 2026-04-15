const database = require("./../config/database");
const Utilizador = require("./Utilizador")

const Professor = database.sequelize.define("professor", {

  Utilizador_ID: {

    type: database.Sequelize.INTEGER,

    references: {
      model: Utilizador,
      key: "id",
    },

    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    unique: true,
  }

});

Professor.belongsTo(Utilizador, {
  foreignKey: "Utilizador_ID",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "utilizador",
});

Utilizador.hasOne(Professor, {
  foreignKey: "Utilizador_ID",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "professor",
});

//Professor.sync({ force: true });
//Professor.sync({alter: true}) //para fazer alteracao de alugum campo outra mudança na tabela


module.exports = Professor
