import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/password-reset/request-reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          data.message || "E-mail de recuperação enviado com sucesso!"
        );
      } else {
        setMessage(data.message || "Erro ao enviar e-mail de recuperação");
      }
    } catch (error) {
      console.error("Erro:", error);
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
        <h2 className="text-center">Recuperar Palavra-passe</h2>
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
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Introduza o seu e-mail registado"
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
                A enviar...
              </>
            ) : (
              "Enviar Link de Recuperação"
            )}
          </button>
        </form>
        <p className="text-center mt-3">
          Lembrou-se da sua palavra-passe? <a href="/login">Inicie sessão</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;