import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const AdmAddCurso = () => {
  const navigate = useNavigate();
  const [curso, setCurso] = useState({
    nome: "",
    nivel: "",
    periodo: "",
    area: "",
    dataInicio: "",
    dataFim: "",
  });

  const handleChange = (e) => {
    setCurso({ ...curso, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação das datas
    const dataInicio = new Date(curso.dataInicio);
    const dataFim = new Date(curso.dataFim);

    if (dataInicio > dataFim) {
      alert("A data de início não pode ser posterior à data de término!");
      return;
    }

    const cursoData = {
      ...curso,
      nivel: parseInt(curso.nivel, 10),
      dataInicio: dataInicio.toISOString().split("T")[0],
      dataFim: dataFim.toISOString().split("T")[0],
    };

    try {
      const resposta = await fetch("http://localhost:5000/cursos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cursoData),
      });

      if (resposta.ok) {
        alert("Curso cadastrado com sucesso!");
        navigate("/admlistcurso");
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
          <a className="nav-link active" href="#">
            Cursos
          </a>
        </li>
        <li className="nav-item mx-2">
          <a className="nav-link" href="#">
            Professores
          </a>
        </li>
        <li className="nav-item mx-2">
          <a className="nav-link" href="#">
            Alunos
          </a>
        </li>
      </ul>

      <div className="d-flex justify-content-center mt-4">
        <form
          className="bg-white p-4 rounded shadow"
          style={{ width: "400px" }}
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="nome"
            className="form-control mb-3"
            placeholder="Nome"
            value={curso.nome}
            onChange={handleChange}
            required
          />

          <select
            name="nivel"
            className="form-control mb-3"
            value={curso.nivel}
            onChange={handleChange}
            required
          >
            <option value="">Selecione o nível</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>

          <select
            name="periodo"
            className="form-control mb-3"
            value={curso.periodo}
            onChange={handleChange}
            required
          >
            <option value="">Selecione o período</option>
            <option value="Manha">Manhã</option>
            <option value="Tarde">Tarde</option>
          </select>

          <select
            name="area"
            className="form-control mb-3"
            value={curso.area}
            onChange={handleChange}
            required
          >
            <option value="">Selecione a área</option>
            <option value="Ciências_da_Computação">Ciências da Computação</option>
            <option value="Contabilidade_Economia_e_Gestão">Contabilidade, Economia e Gestão</option>
            <option value="Engenharia_de_Computadores">Engenharia de Computadores</option>
            <option value="Matemática">Matemática</option>
            <option value="Sistemas_de_Informação">Sistemas de Informação</option>
            <option value="Línguas_Estrangeiras">Línguas Estrangeiras</option>
          </select>

          <div className="mb-3">
            <label htmlFor="dataInicio" className="form-label">
              Data de Início
            </label>
            <input
              type="date"
              name="dataInicio"
              id="dataInicio"
              className="form-control"
              value={curso.dataInicio}
              onChange={handleChange}
              max={curso.dataFim || undefined}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="dataFim" className="form-label">
              Data de Fim
            </label>
            <input
              type="date"
              name="dataFim"
              id="dataFim"
              className="form-control"
              value={curso.dataFim}
              onChange={handleChange}
              min={curso.dataInicio || undefined}
              required
            />
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => navigate("/admlistcurso")}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdmAddCurso;
