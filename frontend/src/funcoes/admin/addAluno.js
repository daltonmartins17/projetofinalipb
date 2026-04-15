import private_api from "../../server/private_api";

const addAluno = async (e, aluno, navigate) => {
  e.preventDefault();

  try {
    const resposta = await private_api.post("/alunos", {
      nome: aluno.nome,
      email: aluno.email,
      senha: aluno.senha,
      morada: aluno.morada,
      contacto: aluno.contacto,
    });

    if (resposta.status === 200 || resposta.status === 201) {
      alert("Aluno cadastrado com sucesso!");
      navigate("/admlistaluno");
    } else {
      const erro = await resposta.json();
      alert(erro.error || "Erro ao cadastrar aluno");
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Ocorreu um erro ao cadastrar o aluno. Por favor, tente novamente.");
  }
};

export default addAluno;
