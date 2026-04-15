const database = require("../config/database");
const Curso = require("./Curso");
const Professor = require("./Professor");

const Avaliacao = database.sequelize.define("avaliacao", {
  titulo: { type: database.Sequelize.STRING, allowNull: false },
  descricao: { type: database.Sequelize.TEXT },
  dataInicio: { type: database.Sequelize.DATE, allowNull: false },
  dataFim: { type: database.Sequelize.DATE, allowNull: false },
  pontuacaoMaxima: { type: database.Sequelize.INTEGER, defaultValue: 20 },
  tipo: {
    type: database.Sequelize.ENUM("escolha_multipla", "desenvolvimento"),
    defaultValue: "escolha_multipla",
  },
  perguntas: { type: database.Sequelize.JSON }, // Armazena as perguntas como JSON

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

// Relações
Avaliacao.belongsTo(Curso, { foreignKey: "cursoId", as: 'curso' });
Avaliacao.belongsTo(Professor, { foreignKey: "professorId", as: 'professor' });
Professor.hasMany(Avaliacao, {foreignKey: "professorId", as: 'avaliacoes'});
Curso.hasMany(Avaliacao, { foreignKey: "cursoId" , as:'avaliacoes'});

//Avaliacao.sync({force: true}) //para forçar criacao de tabela
//Avaliacao.sync({alter: true}) //para fazer alteracao de alugum campo outra mudança na tabela


module.exports = Avaliacao;