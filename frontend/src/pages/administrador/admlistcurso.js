import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom"; // Importando useNavigate

const AdmListCurso = () => {
  const [cursos, setCursos] = useState([]); // Estado para armazenar os cursos
  const [filtro, setFiltro] = useState(""); // Filtro para nome do curso
  const navigate = useNavigate(); // Hook para navegação

  // Função para buscar os cursos no backend
  const fetchCursos = async () => {
    try {
      const resposta = await fetch("http://localhost:5000/cursos");
      if (resposta.ok) {
        const dados = await resposta.json();
        setCursos(dados);
      } else {
        console.error("Erro ao buscar cursos");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  // Buscar cursos assim que o componente for montado
  useEffect(() => {
    fetchCursos();
  }, []);

  // Filtra os cursos com base no nome
  const cursosFiltrados = cursos.filter((curso) =>
    curso.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  // Remover curso do backend e atualizar a lista
  const removerCurso = async (id) => {
    try {
      const resposta = await fetch(`http://localhost:5000/cursos/${id}`, {
        method: "DELETE",
      });

      if (resposta.ok) {
        fetchCursos(); // Atualiza a lista após remover
      } else {
        console.error("Erro ao remover curso");
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
          <a className="nav-link active" href="">
            Cursos
          </a>
        </li>
        <li className="nav-item mx-2">
          <a className="nav-link" href="./admlistprof">
            Professores
          </a>
        </li>
        <li className="nav-item mx-2">
          <a className="nav-link" href="./admlistaluno">
            Alunos
          </a>
        </li>
      </ul>

      {/* Título "Cursos" à esquerda */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <h3>Cursos</h3>

        {/* Botão Adicionar - Azul Claro */}
        <button
          className="btn btn-info"
          onClick={() => navigate("/admaddcurso")} // Redireciona para a página de adicionar curso
        >
          Adicionar
        </button>
      </div>

      {/* Campo de filtro */}
      <div className="mt-3">
        <input
          type="text"
          className="form-control"
          placeholder="Filtrar cursos por nome"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <ul className="list-group mt-3">
        {cursosFiltrados.map((curso) => (
          <li
            key={curso.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span
              className="text-primary"
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate(`/adminfcurso/${curso.id}`)} // Redireciona para a página de informações do curso
            >
              {curso.nome}
            </span>
            <div>
              <button
                className="btn btn-outline-primary  btn-sm mx-2"
                onClick={() => navigate(`/admeditcurso/${curso.id}`)} // Redireciona para a página de editar curso
              >
                <i class="fas fa-pencil"></i> Editar
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => removerCurso(curso.id)} // Remove o curso
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

export default AdmListCurso;