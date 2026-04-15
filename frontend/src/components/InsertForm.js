import React, { useState } from "react";

// Componente InsertForm
function InsertForm() {
  // Estado para armazenar os dados inseridos no formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
  });

  // Função para capturar as mudanças nos campos de entrada
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, // Atualiza o campo correspondente
    });
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    // Exemplo de envio de dados via fetch (substitua pela sua URL de API)
    fetch("http://localhost:5000/usuarios", {
      // Ajuste a URL conforme necessário
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData), // Envia os dados como JSON
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Dados enviados com sucesso:", data);
        // Limpa o formulário após o envio
        setFormData({ nome: "", email: "" });
      })
      .catch((error) => {
        console.error("Erro ao enviar os dados:", error);
      });
  };

  return (
    <div className="form-container">
      <h2>Formulário de Inscrição</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default InsertForm;
