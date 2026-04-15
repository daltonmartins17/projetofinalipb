const database = require("../config/database");
const Utilizador = require("./Utilizador");
const Curso = require("./Curso"); // Importe o modelo Curso
//const Aula = require("./Aula");




const Aluno = database.sequelize.define("aluno", {

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
  },

  cursoId: {
    type: database.Sequelize.INTEGER,
    references: {
      model: Curso,
      key: "id",
    },
    allowNull: true,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  },
});

// Relação com Utilizador
Aluno.belongsTo(Utilizador, {
  foreignKey: "Utilizador_ID",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "utilizador",
});

Utilizador.hasOne(Aluno, {
  foreignKey: "Utilizador_ID",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "aluno",
});

// Relação com Curso
Aluno.belongsTo(Curso, {
  foreignKey: "cursoId",
  as: "curso",
});

Curso.hasMany(Aluno, {
  foreignKey: "cursoId",
  as: "alunos",
  onDelete: "CASCADE",
});





//Aluno.sync({alter: true}) //para fazer alteracao de alugum campo outra mudança na tabela
//Aluno.sync({force: true}) //para forçar criacao de tabela



module.exports = Aluno;
