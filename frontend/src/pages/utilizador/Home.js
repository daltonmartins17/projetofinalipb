import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [showComentarioModal, setShowComentarioModal] = useState(false);
  const [novoComentario, setNovoComentario] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      alert(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }

    const fetchCursos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/cursos");
        setCursos(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchComentarios = async () => {
      try {
        const response = await axios.get("http://localhost:5000/comentarios");
        setComentarios(response.data);
      } catch (err) {
        console.error("Erro ao carregar comentários:", err);
      }
    };

    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(userData);
        setNome(userData.nome || "");
        setEmail(userData.email || "");
      }
    };

    fetchCursos();
    fetchComentarios();
    checkAuth();
  }, [navigate, location]);

  const handleProtectedLink = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate("/login", {
        state: {
          from: path,
          message: "Por favor, faça login para acessar esta página",
        },
      });
    }
  };

  const handleComentarioClick = () => {
    setShowComentarioModal(true);
  };

  const handleSubmitComentario = async () => {
    if (!novoComentario.trim()) {
      alert("Por favor, escreva um comentário antes de enviar.");
      return;
    }

    if (!isAuthenticated && (!nome.trim() || !email.trim())) {
      alert("Por favor, preencha seu nome e e-mail.");
      return;
    }

    try {
      const comentarioData = {
        conteudo: novoComentario,
        nome,
        email,
      };

      const response = await axios.post(
        "http://localhost:5000/comentarios",
        comentarioData
      );

      setComentarios([response.data, ...comentarios]);
      setNovoComentario("");
      if (!isAuthenticated) {
        setNome("");
        setEmail("");
      }
      setShowComentarioModal(false);
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
      alert("Erro ao enviar comentário. Por favor, tente novamente.");
    }
  };

  //Ordenar os cursos por área
  const cursosPorArea = cursos.reduce((acc, curso) => {
    if (!acc[curso.area]) {
      acc[curso.area] = [];
    }
    acc[curso.area].push(curso);
    return acc;
  }, {});

  // Ordenar os cursos dentro de cada área por nome
  Object.keys(cursosPorArea).forEach((area) => {
    cursosPorArea[area].sort((a, b) => a.nome.localeCompare(b.nome));
  });

  if (loading) {
    return (
      <div className="container-fluid text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid text-center mt-5">
        <div className="alert alert-danger">
          Erro ao carregar cursos: {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-fluid"
      style={{
        backgroundColor: "#F8F9FA",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1
        className="text-center mb-4"
        style={{ color: "#2c3e50", fontWeight: "bold" }}
      >
        EducaWeb
      </h1>

      <div className="row mt-4">
        {Object.entries(cursosPorArea).map(([area, cursosDaArea]) => (
          <div className="col-md-6 mb-4" key={area}>
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h2 className="card-title" style={{ color: "#3498db" }}>
                  {formatAreaName(area)} {getEmojiForArea(area)}
                </h2>
                <ul className="list-group list-group-flush">
                  {cursosDaArea.map((curso) => (
                    <li
                      className="list-group-item border-0 py-3"
                      key={curso.id}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <strong>{curso.nome}</strong>
                      <div className="text-muted small mt-1">
                        {curso.periodo} | Nível {curso.nivel}
                      </div>
                      <div className="text-muted small">
                        {formatDate(curso.dataInicio)} -{" "}
                        {formatDate(curso.dataFim)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-5 justify-content-center">
        <div className="col-12">
          <h4
            className="mb-4 text-center"
            style={{
              color: "#2c3e50",
              borderBottom: "2px solid #f0f0f0",
              paddingBottom: "10px",
            }}
          >
            Testemunhos dos utilizadores:
          </h4>

          {comentarios.length > 0 ? (
            <div className="row">
              {comentarios.map((comentario) => (
                <div className="col-md-6 mb-4" key={comentario.id}>
                  <div
                    className="h-100 p-3 rounded"
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderLeft: "4px solid #3498db",
                      height: "100%",
                    }}
                  >
                    <h5 style={{ color: "#3498db" }}>{comentario.nome}:</h5>
                    <p className="mb-2">{comentario.conteudo}</p>
                    <small className="text-muted">
                      {new Date(comentario.dataPublicacao).toLocaleDateString(
                        "pt-PT",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">
                Nenhum comentário ainda.{" "}
                {isAuthenticated
                  ? "Seja o primeiro a comentar!"
                  : "Faça login para comentar."}
              </p>
            </div>
          )}

          {isAuthenticated && (
            <div className="mt-4 text-center">
              <button
                className="btn btn-primary"
                onClick={handleComentarioClick}
                style={{
                  backgroundColor: "#3498db",
                  borderColor: "#3498db",
                  padding: "8px 20px",
                  borderRadius: "20px",
                  fontWeight: "500",
                }}
              >
                Deixar um comentário
              </button>
            </div>
          )}

          {showComentarioModal && (
            <div
              className="modal"
              style={{
                display: "block",
                backgroundColor: "rgba(0,0,0,0.5)",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1050,
              }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Novo Comentário</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowComentarioModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="nome" className="form-label">
                        Seu Nome
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="nome"
                        value={nome}
                        onChange={(e) =>
                          !isAuthenticated && setNome(e.target.value)
                        }
                        placeholder="Digite seu nome"
                        readOnly={isAuthenticated}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Seu E-mail
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) =>
                          !isAuthenticated && setEmail(e.target.value)
                        }
                        placeholder="Digite seu e-mail"
                        readOnly={isAuthenticated}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="comentario" className="form-label">
                        Comentário
                      </label>
                      <textarea
                        className="form-control"
                        id="comentario"
                        rows="4"
                        value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                        placeholder="Escreva seu comentário aqui..."
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowComentarioModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmitComentario}
                      disabled={!novoComentario.trim()}
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function formatAreaName(area) {
  return area.replace(/_/g, " ");
}

function getEmojiForArea(area) {
  const emojis = {
    Ciências_da_Computação: "💻",
    Contabilidade_Economia_e_Gestão: "📊",
    Engenharia_de_Computadores: "🖥️",
    Matemática: "🧮",
    Sistemas_de_Informação: "📡",
    Línguas_Estrangeiras: "🌍",
  };
  return emojis[area] || "📚";
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("pt-PT", options);
}

export default Home;