import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams, useNavigate } from "react-router-dom";
import private_api from "../../server/private_api";

const AdmInfAluno = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [aluno, setAluno] = useState(null);
  const [cursosDisponiveis, setCursosDisponiveis] = useState([]);
  const [cursosAluno, setCursosAluno] = useState([]);
  const [cursoId, setCursoId] = useState("");

  const fetchCursosAluno = async () => {
    try {
      const resposta = await private_api.get(`/alunos/${id}/listacursos`);
      if (resposta.status === 200) {
        // A resposta será um array com um único curso ou vazio
        setCursosAluno(resposta.data);
      }
    } catch (error) {
      console.error("Erro na requisição para buscar cursos do aluno:", error);
    }
  };

  useEffect(() => {
    const fetchAluno = async () => {
      try {
        const resposta = await fetch(`http://localhost:5000/alunos/${id}`);
        if (resposta.ok) {
          const dados = await resposta.json();
          setAluno(dados);
        } else {
          console.error("Erro ao buscar aluno");
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

    fetchAluno();
    fetchCursosDisponiveis();
    fetchCursosAluno();
  }, [id]);

  const handleEditClick = () => setEditMode(true);
  const handleCancelClick = () => setEditMode(false);
  const handleCursoChange = (e) => setCursoId(e.target.value);

  const handleAddCurso = async () => {
    try {
      const resposta = await private_api.put(`/alunos/${aluno.id}/cursos`, {
        cursoId,
      });

      if (resposta.status === 200) {
        // Buscar o nome do curso adicionado
        const cursoAdicionado = cursosDisponiveis.find(
          (c) => c.id === parseInt(cursoId)
        );

        // Enviar email de confirmação usando a nova rota
        try {
          await private_api.post("/email/confirmacao-inscricao", {
            to: aluno.utilizador.email,
            alunoNome: aluno.utilizador.nome,
            cursoNome: cursoAdicionado.nome,
          });
        } catch (emailError) {
          console.error("Erro ao enviar email:", emailError);
          // Não interrompe o fluxo principal se o email falhar
        }

        await fetchCursosAluno();
        setCursoId("");
      } else {
        console.error("Erro ao adicionar curso ao aluno");
      }
    } catch (error) {
      console.error("Erro na requisição para adicionar curso:", error);
    }
  };

  const handleRemoveCurso = async () => {
    try {
      const resposta = await private_api.delete(
        `/alunos/${aluno.id}/cursos` // Usando aluno.id (ID da tabela Aluno)
      );

      if (resposta.status === 200) {
        await fetchCursosAluno();
      } else {
        console.error("Erro ao remover curso do aluno");
      }
    } catch (error) {
      console.error("Erro na requisição para remover curso:", error);
    }
  };

  if (!aluno) {
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
          <button className="nav-link" onClick={() => navigate("/admlistprof")}>
            Professores
          </button>
        </li>
        <li className="nav-item mx-2">
          <button
            className="nav-link active"
            onClick={() => navigate("/admlistaluno")}
          >
            Alunos
          </button>
        </li>
      </ul>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <h2>{aluno.utilizador.nome}</h2>
        {!editMode && (
          <button className="btn btn-primary" onClick={handleEditClick}>
            Editar
          </button>
        )}
      </div>

      <div className="d-flex bg-white p-4 rounded shadow mt-3">
        <div className="w-50 pe-4 border-end">
          <h4 className="fw-bold">Informação do aluno</h4>
          <p>
            <strong>{aluno.utilizador.nome}</strong>
          </p>
          <p>{aluno.utilizador.email}</p>
          <p>{aluno.utilizador.morada}</p>
          <p>{aluno.utilizador.contacto}</p>
        </div>

        <div className="w-50 ps-4">
          <label className="fw-bold">Curso Inscrito</label>
          {cursosAluno.length > 0 ? (
            cursosAluno.map((curso, index) => (
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
                    onClick={handleRemoveCurso}
                  >
                    Remover
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>Este aluno não está inscrito em nenhum curso no momento.</p>
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

export default AdmInfAluno;
