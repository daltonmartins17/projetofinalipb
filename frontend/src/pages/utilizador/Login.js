import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/auth/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Credenciais padrão do administrador (deveriam vir do .env em produção)
  const ADMIN_EMAIL = "daltonrafaprojetofinal@gmail.com";
  const ADMIN_PASSWORD = "projeto178";
  const ADMIN_TOKEN = "admin-token"; // Token simbólico para o admin

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Verificação do login do administrador localmente
    if (formData.email === ADMIN_EMAIL && formData.senha === ADMIN_PASSWORD) {
      const adminUser = {
        tipo: "Administrador",
        role: "Administrador",
        email: ADMIN_EMAIL,
        nome: "Administrador",
        // Adicione outros campos necessários para o admin
      };

      login(adminUser, ADMIN_TOKEN);
      setMessage("Login administrativo realizado com sucesso!");
      setTimeout(() => navigate("/admlistcurso"), 1000);
      setLoading(false);
      return;
    }

    // Login normal para outros utilizadores
    try {
      const resposta = await fetch("http://localhost:5000/utilizador/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await resposta.json();

      if (resposta.ok) {
        // Padronizando o objeto do utilizador
        const userData = {
          ...data.user,
          role: data.user.tipo, // Garantindo compatibilidade
          nome: data.user.nome || "Utilizador", // Campo padrão se não existir
          // Inclua todos os campos necessários do seu utilizador
        };

        // Chamada correta para login com userData e token
        login(userData, data.token);
        setMessage("Login realizado com sucesso!");

        // Redirecionamento baseado no tipo de utilizador
        switch (data.user.tipo) {
          case "Aluno":
            setTimeout(
              () => navigate(`/listacurso/${data.user.alunoId}`),
              1000
            );
            break;
          case "Professor":
            setTimeout(
              () => navigate(`/lecionalista/${data.user.professorId}`),
              1000
            );
            break;
          case "Administrador":
            setTimeout(() => navigate("/admlistcurso"), 1000);
            break;
          default:
            setTimeout(() => navigate("/"), 1000);
        }
      } else {
        setMessage(data.message || "Erro ao realizar login");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setMessage("Erro no servidor. Por favor, tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="card p-4 shadow" style={{ width: "350px" }}>
        <h2 className="text-center">Login</h2>
        {message && (
          <div
            className={`alert ${
              message.includes("sucesso") ? "alert-success" : "alert-danger"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Introduza o seu e-mail"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Palavra-passe</label>
            <input
              type="password"
              name="senha"
              className="form-control"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Introduza a sua palavra-passe"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                A processar...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <p className="text-center">
          <a href="/forgot-password">Esqueceu-se da sua palavra-passe?</a>
        </p>
        <p className="text-center mt-3">
          Não tem uma conta? <a href="/register">Registe-se</a>
        </p>
      </div>
    </div>
  );
};

export default Login;