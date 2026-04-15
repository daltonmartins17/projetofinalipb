const database = require("../config/database");
const Avaliacao = require("./Avaliacao");
const Aluno = require("./Aluno");

const Submissao = database.sequelize.define("submissao", {
  respostas: { type: database.Sequelize.JSON }, // Respostas do aluno
  pontuacao: { type: database.Sequelize.INTEGER },
  tempo: { type: database.Sequelize.STRING }, // Tempo gasto
  dataSubmissao: {
    type: database.Sequelize.DATE,
    defaultValue: database.Sequelize.NOW,
  },
});

// Relações
Submissao.belongsTo(Avaliacao, { foreignKey: "avaliacaoId" });
// No arquivo Submissao.js
Submissao.belongsTo(Aluno, { 
  foreignKey: "alunoId",
  as: "aluno" // Adicione esta linha para definir o alias consistentemente
});

//Submissao.sync({force: true}) //para forçar criacao de tabela
//Submissao.sync({alter: true}) //para fazer alteracao de alugum campo outra mudança na tabela

module.exports = Submissao;
