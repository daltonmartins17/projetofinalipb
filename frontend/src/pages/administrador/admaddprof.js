import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import addProfessor from "../../funcoes/admin/addProfessor";

const AdmAddProf = () => {
  const navigate = useNavigate();
  const [professor, setProfessor] = useState({
    nome: "",
    email: "",
    morada: "",
    contacto: "",
  });

  const handleChange = (e) => {
    setProfessor({ ...professor, [e.target.name]: e.target.value });
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
          <a className="nav-link active" href="#">
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
        <form className="bg-white p-4 rounded shadow" style={{ width: "400px" }}  onSubmit={(e) => addProfessor(e, professor, navigate)}
        >
          <input
            type="text"
            name="nome"
            className="form-control mb-3"
            placeholder="Nome"
            value={professor.nome}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            className="form-control mb-3"
            placeholder="Email"
            value={professor.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="morada"
            className="form-control mb-3"
            placeholder="Morada"
            value={professor.morada}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="senha"
            className="form-control mb-3"
            placeholder="Palavra-Passe"
            value={professor.senha}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="contacto"
            className="form-control mb-3"
            placeholder="Contacto"
            value={professor.contacto}
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
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdmAddProf;
