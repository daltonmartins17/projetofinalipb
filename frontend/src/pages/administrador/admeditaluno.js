import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const AdmEditAluno = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aluno, setAluno] = useState({
    utilizador: {
      nome: "",
      email: "",
      morada: "",
      contacto: "",
    },
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAluno = async () => {
      if (!id) return;

      try {
        const resposta = await fetch(`http://localhost:5000/alunos/${id}`);

        if (!resposta.ok) {
          throw new Error("Erro ao buscar aluno");
        }

        const dados = await resposta.json();
        setAluno(dados);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro na requisição:", error);
        setIsLoading(false);
      }
    };

    fetchAluno();
  }, [id]);

  const handleChange = (e) => {
    setAluno({
      ...aluno,
      utilizador: {
        ...aluno.utilizador,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resposta = await fetch(`http://localhost:5000/alunos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aluno),
      });

      if (resposta.ok) {
        alert("Aluno atualizado com sucesso!");
        navigate("/admlistaluno");
      } else {
        const erro = await resposta.json();
        alert(erro.error);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-primary text-center">EducaWeb</h1>
      <ul className="nav nav-tabs justify-content-center mt-3">
        <li className="nav-item mx-2">
          <a
            className="nav-link"
            onClick={() => navigate("/admlistcurso")}
            style={{ cursor: "pointer" }}
          >
            Cursos
          </a>
        </li>
        <li className="nav-item mx-2">
          <a
            className="nav-link"
            onClick={() => navigate("/admlistprof")}
            style={{ cursor: "pointer" }}
          >
            Professores
          </a>
        </li>
        <li className="nav-item mx-2">
          <a className="nav-link active" href="#">
            Alunos
          </a>
        </li>
      </ul>

      <div className="d-flex justify-content-center mt-4">
        {isLoading ? (
          <h4>Carregando aluno...</h4>
        ) : (
          <form
            className="bg-white p-4 rounded shadow"
            style={{ width: "400px" }}
            onSubmit={handleSubmit}
          >
            <h3 className="text-center">Editar Aluno</h3>

            <input
              type="text"
              name="nome"
              className="form-control mb-3"
              placeholder="Nome"
              value={aluno.utilizador.nome}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              className="form-control mb-3"
              placeholder="Email"
              value={aluno.utilizador.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="morada"
              className="form-control mb-3"
              placeholder="Morada"
              value={aluno.utilizador.morada}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="contacto"
              className="form-control mb-3"
              placeholder="Contacto"
              value={aluno.utilizador.contacto}
              onChange={handleChange}
              required
            />

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => navigate("/admlistaluno")}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar Alterações
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdmEditAluno;
