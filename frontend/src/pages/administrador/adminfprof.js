import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams, useNavigate } from "react-router-dom";
import private_api from "../../server/private_api";

const AdmInfProf = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [professor, setProfessor] = useState(null);
  const [cursosDisponiveis, setCursosDisponiveis] = useState([]);
  const [cursosProf, setCursosProf] = useState([]);
  const [cursoId, setCursoId] = useState("");

  const fetchCursosProfessor = async () => {
    try {
      const resposta = await private_api.get(`/professores/${id}/listacursos`);
      if (resposta.status === 200) {
        setCursosProf(resposta.data);
      }
    } catch (error) {
      console.error("Erro ao buscar cursos do professor:", error);
    }
  };

  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        const resposta = await fetch(`http://localhost:5000/professores/${id}`);
        if (resposta.ok) {
          const dados = await resposta.json();
          setProfessor(dados);
        } else {
          console.error("Erro ao buscar professor");
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    };

    const fetchCursosDisponiveis = async () => {
      try {
        const resposta = await fetch("http://localhost:5000/cursos");
        if (resposta.ok) {
          const cursos = await resposta.json();
          setCursosDisponiveis(cursos);
        } else {
          console.error("Erro ao buscar cursos");
        }
      } catch (error) {
        console.error("Erro na requisição de cursos:", error);
      }
    };

    fetchProfessor();
    fetchCursosDisponiveis();
    fetchCursosProfessor();
  }, [id]);

  const handleEditClick = () => setEditMode(true);
  const handleCancelClick = () => setEditMode(false);
  const handleCursoChange = (e) => setCursoId(e.target.value);

  const handleAddCurso = async () => {
    try {
      const resposta = await private_api.put(
        `/professores/${professor.utilizador.id}/cursos`,
        { cursoId }
      );

      if (resposta.status === 200) {
        await fetchCursosProfessor();
        setCursoId("");
      } else {
        console.error("Erro ao adicionar curso ao professor");
      }
    } catch (error) {
      console.error("Erro na requisição para adicionar curso:", error);
    }
  };

  const handleRemoveCurso = async (cursoId) => {
    try {
      const resposta = await private_api.delete(
        `/professores/${professor.id}/cursos/${cursoId}`
      );

      if (resposta.status === 200) {
        await fetchCursosProfessor();
      } else {
        console.error("Erro ao remover curso do professor");
      }
    } catch (error) {
      console.error("Erro na requisição para remover curso:", error);
    }
  };

  if (!professor) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="text-primary text-center">EducaWeb</h1>
      <ul className="nav nav-tabs justify-content-center mt-3">
        <li className="nav-item mx-2">
          <button
            className="nav-link"
            onClick={() => navigate("/admlistcurso")}
          >
            Cursos
          </button>
        </li>
        <li className="nav-item mx-2">
          <button
            className="nav-link active"
            onClick={() => navigate("/admlistprof")}
          >
            Professores
          </button>
        </li>
        <li className="nav-item mx-2">
          <button
            className="nav-link"
            onClick={() => navigate("/admlistaluno")}
          >
            Alunos
          </button>
        </li>
      </ul>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <h2>{professor.utilizador.nome}</h2>
        {!editMode && (
          <button className="btn btn-primary" onClick={handleEditClick}>
            Editar
          </button>
        )}
      </div>

      <div className="d-flex bg-white p-4 rounded shadow mt-3">
        <div className="w-50 pe-4 border-end">
          <h4 className="fw-bold">Informação do professor</h4>
          <p>
            <strong>{professor.utilizador.nome}</strong>
          </p>
          <p>{professor.utilizador.email}</p>
          <p>{professor.utilizador.morada}</p>
          <p>{professor.utilizador.contacto}</p>
        </div>

        <div className="w-50 ps-4">
          <label className="fw-bold">Cursos que Leciona</label>
          {cursosProf.length > 0 ? (
            cursosProf.map((curso, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  value={curso.nome}
                  disabled={!editMode}
                />
                {editMode && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleRemoveCurso(curso.id)}
                  >
                    Remover
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>Este professor não leciona cursos no momento.</p>
          )}

          {editMode && (
            <>
              <div className="mb-3">
                <select
                  className="form-select"
                  value={cursoId}
                  onChange={handleCursoChange}
                >
                  <option value="">Selecione um curso</option>
                  {cursosDisponiveis.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nome}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-outline-secondary mt-2"
                onClick={handleAddCurso}
              >
                Adicionar Curso
              </button>
            </>
          )}

          {editMode && (
            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-danger" onClick={handleCancelClick}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setEditMode(false)}
              >
                Salvar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdmInfProf;
