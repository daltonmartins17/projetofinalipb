import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage("As palavras-passe não coincidem!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/password-reset/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Palavra-passe redefinida com sucesso!");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setMessage(data.message || "Erro ao redefinir a palavra-passe");
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
        <h2 className="text-center">Redefinir Palavra-passe</h2>
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
            <label className="form-label">Nova Palavra-passe</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="5"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirmar Nova Palavra-passe</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="5"
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
                  aria-hidden="true"
                ></span>
                A redefinir...
              </>
            ) : (
              "Redefinir Palavra-passe"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
