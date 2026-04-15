const database = require("../config/database");
const Aluno = require("./Aluno");
const Curso = require("./Curso");

const Inscricao = database.sequelize.define("inscricoes", {
  alunoId: {
    type: database.Sequelize.INTEGER,
    references: {
      model: Aluno,
      key: "id",
    },
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  cursoId: {
    type: database.Sequelize.INTEGER,
    references: {
      model: Curso,
      key: "id",
    },
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  nivel: {
    type: database.Sequelize.STRING,
    allowNull: false,
  },
  periodo: {
    type: database.Sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: [["manha", "tarde"]],
    },
  },
  
});

// Relações
Inscricao.belongsTo(Aluno, {
  foreignKey: "alunoId",
  as: "aluno",
});

Aluno.hasMany(Inscricao, {
  foreignKey: "alunoId",
  as: "inscricoes",
});

Inscricao.belongsTo(Curso, {
  foreignKey: "cursoId",
  as: "curso",
});

Curso.hasMany(Inscricao, {
  foreignKey: "cursoId",
  as: "inscricoes",
});

// Inscricao.sync({ force: true }); // Use apenas para desenvolvimento
//Inscricao.sync({ alter: true }); // Para atualizar o esquema

module.exports = Inscricao;
