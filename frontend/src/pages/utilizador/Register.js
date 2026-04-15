import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    morada: "",
    contacto: "",
    senha: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resposta = await fetch("http://localhost:5000/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          morada: formData.morada,
          contacto: formData.contacto,
          senha: formData.senha,
          tipo: "Aluno", // Definindo o tipo como "Aluno"
        }),
      });

      if (resposta.ok) {
        setMessage("Registo realizado com sucesso!"); // Mensagem de sucesso
        setTimeout(() => {
          navigate("/login"); // Redireciona para a página de login após o registo
        }, 2000);
      } else {
        console.error("Erro ao registar utilizador");
        setMessage(
          "Este email já está registado. Por favor, utilize outro email."
        );
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setMessage("Erro no servidor");
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#F8F9FA", minHeight: "100vh" }}
    >
      <div className="card p-4 shadow" style={{ width: "350px" }}>
        <h2 className="text-center">Registo</h2>
        {message && <div className="alert alert-info">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nome</label>
            <input
              type="text"
              name="nome"
              className="form-control"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Digite seu nome"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Morada</label>
            <input
              type="text"
              name="morada"
              className="form-control"
              value={formData.morada}
              onChange={handleChange}
              placeholder="Digite sua morada"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contacto</label>
            <input
              type="text"
              name="contacto"
              className="form-control"
              value={formData.contacto}
              onChange={handleChange}
              placeholder="Digite seu contacto"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu email"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Palavra-Passe</label>
            <input
              type="password"
              name="senha"
              className="form-control"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Digite sua palavra-passe"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Registar
          </button>
        </form>
        <p className="text-center mt-3">
          Já tem uma conta? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
