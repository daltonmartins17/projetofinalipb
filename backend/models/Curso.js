const database = require("../config/database");
const Professor = require("./Professor");

const Curso = database.sequelize.define("cursos", {
  nome: {
    type: database.Sequelize.STRING,
    allowNull: false,
  },

  nivel: {
    type: database.Sequelize.INTEGER,
    allowNull: false,
  },

  periodo: {
    type: database.Sequelize.STRING,
    allowNull: false,
  },

  area: {
    type: database.Sequelize.STRING,
    allowNull: false,
  },

  dataInicio: {
    type: database.Sequelize.DATEONLY,
    allowNull: false,
    field: "data_inicio", // Opcional: para usar snake_case no banco de dados
  },

  dataFim: {
    type: database.Sequelize.DATEONLY,
    allowNull: false,
    field: "data_fim", // Opcional: para usar snake_case no banco de dados
  },

  professorId: {
    type: database.Sequelize.INTEGER,
    references: {
      model: Professor,
      key: "id",
    },
    allowNull: true,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  },
});

Professor.hasMany(Curso, {
  foreignKey: "professorId",
  as: "cursos",
  onDelete: "CASCADE",
});

Curso.belongsTo(Professor, {
  foreignKey: "professorId",
  as: "professor",
});

//Curso.sync({ force: true }); // Use apenas para desenvolvimento

//Curso.sync({alter: true}) // Descomente esta linha para atualizar o banco de dados

module.exports = Curso;
