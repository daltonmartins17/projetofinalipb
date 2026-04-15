import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import private_api from "../../server/private_api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validação adicional no frontend
    if (formData.message.length < 10) {
      setError("A mensagem deve ter pelo menos 10 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await private_api.post("/api/contact", formData);

      if (response.status >= 200 && response.status < 300) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" }); // Limpa o formulário
      } else {
        setError(
          "Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Erro ao enviar mensagem. Tente novamente mais tarde."
      );
      console.error("Erro:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container-fluid"
      style={{
        backgroundColor: "#F8F9FA",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1>Contato</h1>
      <p className="mt-3">
        Entre em contato conosco através dos seguintes meios:
      </p>
      <ul>
        <li>Email: daltonrafaprojetofinal@gmail.com</li>
        <li>Telefone: (00351) 926119288</li>
        <li>Endereço: Estrada do Turismo nº 21</li>
      </ul>

      <h2 className="mt-4">Envie uma Mensagem</h2>

      {submitted ? (
        <div>
          <div className="alert alert-success mt-3">
            Mensagem enviada com sucesso! Entraremos em contato em breve.
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setSubmitted(false)}
          >
            Enviar nova mensagem
          </button>
        </div>
      ) : (
        <form className="mt-3" onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label className="form-label">Nome</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Digite seu nome"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu email"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mensagem</label>
            <textarea
              className="form-control"
              rows="4"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Digite sua mensagem (mínimo 10 caracteres)"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default Contact;
