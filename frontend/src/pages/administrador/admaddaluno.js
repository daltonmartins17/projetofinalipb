import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const AdmAddAluno = () => {
  const [aluno, setAluno] = useState({
    nome: "",
    email: "",
    senha: "",
    morada: "",
    contacto: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setAluno({ ...aluno, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resposta = await fetch("http://localhost:5000/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aluno),
      });

      if (resposta.ok) {
        navigate("/admlistaluno"); // Redirecionar para a lista de alunos após adicionar
      } else {
        console.error("Erro ao adicionar aluno");
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
          <a className="nav-link" href="#">
            Cursos
          </a>
        </li>
        <li className="nav-item mx-2">
          <a className="nav-link" href="#">
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
            value={aluno.nome}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            className="form-control mb-3"
            placeholder="Email"
            value={aluno.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="senha"
            className="form-control mb-3"
            placeholder="Palavra-Passe"
            value={aluno.senha}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="morada"
            className="form-control mb-3"
            placeholder="Morada"
            value={aluno.morada}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="contacto"
            className="form-control mb-3"
            placeholder="Contacto"
            value={aluno.contacto}
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
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdmAddAluno;
