const database = require("../config/database");
const Curso = require("./Curso");
const Professor = require("./Professor"); // Certifique-se de que esse modelo existe

const Aula = database.sequelize.define("aula", {
  titulo: {
    type: database.Sequelize.STRING,
    allowNull: false,
  },
  descricao: {
    type: database.Sequelize.TEXT,
    allowNull: true,
  },
  videoUrl: {
    type: database.Sequelize.STRING,
    allowNull: function () {
      return this.isLive; // Permite nulo se for aula ao vivo
    },
  },
  cursoId: {
    type: database.Sequelize.INTEGER,
    references: {
      model: Curso,
      key: "id",
    },
    allowNull: false,
  },
  professorId: {
    type: database.Sequelize.INTEGER,
    references: {
      model: Professor,
      key: "id",
    },
    allowNull: false,
  },
  duracao: {
    type: database.Sequelize.INTEGER, // em minutos
    allowNull: true,
  },
  dataPublicacao: {
    type: database.Sequelize.DATE,
    defaultValue: database.Sequelize.NOW,
  },
  ordem: {
    type: database.Sequelize.INTEGER,
    allowNull: true,
  },
  isLive: {
    type: database.Sequelize.BOOLEAN,
    defaultValue: false,
  },
  liveUrl: {
    type: database.Sequelize.STRING,
    allowNull: true,
  },
});

// Relacionamentos
Aula.belongsTo(Curso, {
  foreignKey: "cursoId",
  as: "curso",
});

Curso.hasMany(Aula, {
  foreignKey: "cursoId",
  as: "aulas",
});

Aula.belongsTo(Professor, {
  foreignKey: "professorId",
  as: "professor",
});

Professor.hasMany(Aula, {
  foreignKey: "professorId",
  as: "aulas",
});

//Aula.sync({alter: true}) //para fazer alteracao de alugum campo outra mudança na tabela
//Aula.sync({ force: true }); // Use apenas para desenvolvimento

module.exports = Aula;
