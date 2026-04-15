import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const AdmListProf = () => {
  const [professores, setProfessores] = useState([]);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();

  const fetchProfessores = async () => {
    try {
      const resposta = await fetch("http://localhost:5000/professores");
      if (resposta.ok) {
        const dados = await resposta.json();
        setProfessores(dados);  
      } else {
        console.error("Erro ao buscar professores");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, []);

  const professoresFiltrados = professores.filter((professor) =>
    professor.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const removerProfessor = async (id) => {
    try {
      const resposta = await fetch(`http://localhost:5000/professores/${id}`, {
        method: "DELETE",
      });
      if (resposta.ok) {
        fetchProfessores();
      } else {
        console.error("Erro ao remover professor");
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
          <a className="nav-link" href="./admlistcurso">
            Cursos
          </a>
        </li>
        <li className="nav-item mx-2">
          <a className="nav-link active" href="">
            Professores
          </a>
        </li>
        <li className="nav-item mx-2">
          <a className="nav-link" href="./admlistaluno">
            Alunos
          </a>
        </li>
      </ul>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <h3>Professores</h3>
        <button
          className="btn btn-info"
          onClick={() => navigate("/admaddprof")}
        >
          Adicionar
        </button>
      </div>

      <div className="mt-3">
        <input
          type="text"
          className="form-control"
          placeholder="Filtrar professores por nome"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <ul className="list-group mt-3">
        {professoresFiltrados.map((professor) => (
          <li
            key={professor.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span
              className="text-primary"
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate(`/adminfprof/${professor.professor.id}`)}
            >
              {professor.nome}
            </span>

            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-primary  btn-sm mx-2"
                onClick={() =>
                  navigate(`/admeditprof/${professor.professor.id}`)
                }
              >
                <i class="fas fa-pencil"></i> Editar
              </button>

              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => removerProfessor(professor.id)}
              >
                <i class="fas fa-trash"></i> Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdmListProf;
