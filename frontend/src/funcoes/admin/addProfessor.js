import private_api from "../../server/private_api";

const addProfessor = async (e, professor, navigate) => {
 
    e.preventDefault();

  try {

    const resposta = await private_api.post("/professores", {
        nome: professor.nome,
        email: professor.email,
        telefone: professor.telefone,
        senha: professor.senha,
        morada: professor.morada,
        contacto: professor.contacto
    });

    if (resposta.status === 200) {
      alert("Professor cadastrado com sucesso!");
      navigate("/admlistprof");
    } else {
      const erro = await resposta.json();
      alert(erro.error);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
};

export default addProfessor
