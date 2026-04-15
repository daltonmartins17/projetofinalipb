const database = require("../config/database");
const Curso = require("./Curso");
const Aula = require("./Aula"); // Certifique-se de que o modelo Aula existe

const Material = database.sequelize.define("material", {
  nome: {
    type: database.Sequelize.STRING,
    allowNull: false,
  },
  arquivoUrl: {
    type: database.Sequelize.STRING,
    allowNull: false,
  },
  cursoId: {
    type: database.Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Curso,
      key: "id",
    },
  },
  aulaId: {
    type: database.Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: Aula,
      key: "id",
    },
  },
  tipo: {
    type: database.Sequelize.ENUM("pdf", "doc", "ppt", "link", "outro"),
    allowNull: true,
  },
  dataUpload: {
    type: database.Sequelize.DATE,
    defaultValue: database.Sequelize.NOW,
  },
});

// Relacionamentos
Material.belongsTo(Curso, {
  foreignKey: "cursoId",
  as: "curso",
});

Curso.hasMany(Material, {
  foreignKey: "cursoId",
  as: "materiais",
});

Material.belongsTo(Aula, {
  foreignKey: "aulaId",
  as: "aula",
});

Aula.hasMany(Material, {
  foreignKey: "aulaId",
  as: "materiais",
});

//Material.sync({ force: true }); // Use apenas para desenvolvimento
//Material.sync({alter: true}) //para fazer alteracao de alugum campo outra mudança na tabela

module.exports = Material;


