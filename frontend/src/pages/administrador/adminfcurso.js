import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const AdmInfCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState({
    nome: "",
    nivel: "",
    periodo: "",
    area: "",
    dataInicio: "",
    dataFim: "",
    professor: null,
    alunos: [],
  });
  const [alunos, setAlunos] = useState([]);
  const [professor, setProfessor] = useState(null);

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const resposta = await fetch(`http://localhost:5000/cursos/${id}`);
        if (resposta.ok) {
          const dados = await resposta.json();
          setCurso(dados);

          if (dados.professorId) {
            const profResposta = await fetch(
              `http://localhost:5000/professores/${dados.professorId}`
            );
            if (profResposta.ok) {
              const profData = await profResposta.json();
              setProfessor(profData.utilizador);
            }
          }
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    };

    const fetchAlunos = async () => {
      try {
        const resposta = await fetch(
          `http://localhost:5000/cursos/${id}/alunos`
        );
        if (resposta.ok) {
          const dados = await resposta.json();
          setAlunos(dados);
        }
      } catch (error) {
        console.error("Erro na requisição de alunos:", error);
      }
    };

    fetchCurso();
    fetchAlunos();
  }, [id]);

  const formatarData = (dataISO) => {
    if (!dataISO) return "-";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  if (!curso.nome) return <p className="text-center mt-4">Carregando...</p>;

  return (
    <div className="container mt-4">
      <h1 className="text-primary text-center">EducaWeb</h1>
      <ul className="nav nav-tabs justify-content-center mt-3">
        <li className="nav-item mx-2">
          <button
            className="nav-link active"
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
            className="nav-link"
            onClick={() => navigate("/admlistaluno")}
          >
            Alunos
          </button>
        </li>
      </ul>

      <div className="bg-white p-4 rounded shadow mt-3">
        <h2 className="mb-4">{curso.nome}</h2>

        <div className="row">
          <div className="col-md-6">
            <h4 className="fw-bold">Informações do Curso</h4>
            <p>
              <strong>Nível:</strong> {curso.nivel}
            </p>
            <p>
              <strong>Período:</strong> {curso.periodo}
            </p>
            <p>
              <strong>Área:</strong> {curso.area}
            </p>
            <p>
              <strong>Data de Início:</strong> {formatarData(curso.dataInicio)}
            </p>
            <p>
              <strong>Data de Término:</strong> {formatarData(curso.dataFim)}
            </p>
          </div>

          <div className="col-md-6">
            <h4 className="fw-bold">Professor</h4>
            {professor ? (
              <div>
                <p>
                  <strong>Nome:</strong> {professor.nome}
                </p>
              </div>
            ) : (
              <p>Nenhum professor associado</p>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmInfCurso;
