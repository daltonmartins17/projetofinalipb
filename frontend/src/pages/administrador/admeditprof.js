import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const AdmEditProf = () => {
  const { id } = useParams();
  const navigate = useNavigate();

const [professor, setProfessor] = useState({
  utilizador: {
    nome: "",
    email: "",
    morada: "",
    contacto: "",
  },
});

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfessor = async () => {
      if (!id) return;

      try {
        const resposta = await fetch(`http://localhost:5000/professores/${id}`);

        if (!resposta.ok) {
          throw new Error("Erro ao buscar professor");
        }

        const dados = await resposta.json();
        setProfessor(dados);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro na requisição:", error);
        setIsLoading(false);
      }
    };

    fetchProfessor();
  }, [id]);

  const handleChange = (e) => {
    setProfessor({
      ...professor,
      utilizador: {
        ...professor.utilizador,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resposta = await fetch(`http://localhost:5000/professores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(professor),
      });

      if (resposta.ok) {
        alert("Professor atualizado com sucesso!");
        navigate("/admlistprof");
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
          <a className="nav-link" onClick={() => navigate("/admlistcurso")}>
            Cursos
          </a>
        </li>
        <li className="nav-item mx-2">
          <a className="nav-link active" href="#">
            Professores
          </a>
        </li>
        <li className="nav-item mx-2">
          <a className="nav-link" onClick={() => navigate("/admlistaluno")}>
            Alunos
          </a>
        </li>
      </ul>

      <div className="d-flex justify-content-center mt-4">
        {isLoading ? (
          <h4>Carregando professor...</h4>
        ) : (
          <form
            className="bg-white p-4 rounded shadow"
            style={{ width: "400px" }}
            onSubmit={handleSubmit}
          >
            <h3 className="text-center">Editar Professor</h3>

            <input
              type="text"
              name="nome"
              className="form-control mb-3"
              placeholder="Nome"
              value={professor.utilizador.nome}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              className="form-control mb-3"
              placeholder="Email"
              value={professor.utilizador.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="morada"
              className="form-control mb-3"
              placeholder="Morada"
              value={professor.utilizador.morada}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="contacto"
              className="form-control mb-3"
              placeholder="Contacto"
              value={professor.utilizador.contacto}
              onChange={handleChange}
              required
            />

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => navigate("/admlistprof")}
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

export default AdmEditProf;
