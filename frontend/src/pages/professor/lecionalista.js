import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import private_api from "../../server/private_api";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import InputGroup from "react-bootstrap/InputGroup";

const LecionaLista = () => {
  const [cursos, setCursos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [assunto, setAssunto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  const [professor, setProfessor] = useState(null);

  const fetchProfessor = async () => {
    try {
      const resposta = await private_api.get(`/professores/${id}`);
      if (resposta.status === 200) {
        setProfessor(resposta.data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do professor:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCursos();
      fetchProfessor();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchCursos = async () => {
    try {
      const resposta = await private_api.get(`/professores/${id}/listacursos`);
      if (resposta.status === 200) {
        setCursos(resposta.data);
      } else {
        console.error("Erro ao buscar cursos");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlunosDoCurso = async (cursoId) => {
    setLoadingAlunos(true);
    try {
      const resposta = await private_api.get(`/cursos/${cursoId}/alunos`);
      if (resposta.status === 200) {
        setAlunos(resposta.data);
        setFilteredAlunos(resposta.data);
      } else {
        console.error("Erro ao buscar alunos");
        setAlunos([]);
        setFilteredAlunos([]);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setAlunos([]);
      setFilteredAlunos([]);
    } finally {
      setLoadingAlunos(false);
    }
  };

  const handleCursoChange = (e) => {
    const cursoId = e.target.value;
    const curso = cursos.find((c) => c.id == cursoId);
    setSelectedCurso(curso);
    setSelectedAlunos([]);
    setSearchTerm("");
    if (cursoId) {
      fetchAlunosDoCurso(cursoId);
    } else {
      setAlunos([]);
      setFilteredAlunos([]);
    }
  };

  const handleAlunoSelection = (alunoId) => {
    setSelectedAlunos((prev) => {
      if (prev.includes(alunoId)) {
        return prev.filter((id) => id !== alunoId);
      } else {
        return [...prev, alunoId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAlunos(filteredAlunos.map((aluno) => aluno.id));
    } else {
      setSelectedAlunos([]);
    }
  };

  const handleEnviarAvisos = async () => {
    if (!assunto || !mensagem || selectedAlunos.length === 0) {
      setError("Preencha todos os campos e selecione pelo menos um aluno");
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      const alunosParaEnviar = alunos
        .filter((a) => selectedAlunos.includes(a.id))
        .map((a) => ({
          id: a.id,
          email: a.utilizador.email,
          nome: a.utilizador.nome,
        }));

      const resposta = await private_api.post("/email/avisos", {
        alunos: alunosParaEnviar,
        assunto,
        mensagem,
        remetenteEmail: professor?.utilizador?.email,
        remetenteNome: professor?.utilizador?.nome,
      });

      setEnviado(true);
      setTimeout(() => {
        setShowModal(false);
        setEnviado(false);
        setSelectedAlunos([]);
        setMensagem("");
        setAssunto("");
      }, 2000);
    } catch (error) {
      console.error("Erro ao enviar avisos:", error);
      setError(
        error.response?.data?.error ||
          "Erro ao enviar avisos. Por favor, tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  
  // Filtra alunos baseado no termo de busca
  useEffect(() => {
    if (searchTerm) {
      const filtered = alunos.filter(
        (aluno) =>
          aluno.utilizador?.nome
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          aluno.utilizador?.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredAlunos(filtered);
    } else {
      setFilteredAlunos(alunos);
    }
  }, [searchTerm, alunos]);

  // Filtra alunos no modal baseado no termo de busca
  const filteredModalAlunos = modalSearchTerm
    ? alunos.filter(
        (aluno) =>
          aluno.utilizador?.nome
            .toLowerCase()
            .includes(modalSearchTerm.toLowerCase()) ||
          aluno.utilizador?.email
            .toLowerCase()
            .includes(modalSearchTerm.toLowerCase())
      )
    : alunos;

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">Carregando...</div>
    );
  }

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center"
      style={{
        backgroundColor: "#E7EFF4",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <nav className="nav nav-tabs mb-3 bg-white p-2 w-75 d-flex justify-content-center">
        <a className="nav-link active mx-3" href="">
          Cursos
        </a>
        <a
          className="nav-link mx-3"
          href=""
          onClick={() => navigate(`/lecionaaula/${id}`)}
        >
          Aulas
        </a>
        <a
          className="nav-link mx-3"
          href=""
          onClick={() => navigate(`/lecionaavaliacao/${id}`)}
        >
          Avaliações
        </a>
      </nav>

      <h2 className="mb-3 text-center">Lista de Cursos à lecionar</h2>

      {/* Tabela de Cursos */}
      <table className="table table-bordered bg-white w-75 mb-4">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Nível</th>
            <th>Data de Início</th>
            <th>Data de Fim</th>
            <th>Período</th>
          </tr>
        </thead>
        <tbody>
          {cursos.length > 0 ? (
            cursos.map((curso) => (
              <tr key={curso.id}>
                <td>{curso.nome}</td>
                <td>{curso.nivel}</td>
                <td>{new Date(curso.dataInicio).toLocaleDateString()}</td>
                <td>{new Date(curso.dataFim).toLocaleDateString()}</td>
                <td>{curso.periodo}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                Nenhum curso encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Seleção de Curso */}
      <div className="mb-4 w-75">
        <label htmlFor="cursoSelect" className="form-label">
          Selecione um curso para listar os alunos:
        </label>
        <select
          id="cursoSelect"
          className="form-select"
          onChange={handleCursoChange}
          value={selectedCurso?.id || ""}
        >
          <option value="">-- Selecione um curso --</option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.nome} - {curso.nivel} ({curso.periodo})
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Alunos do Curso Selecionado */}
      {selectedCurso && (
        <div className="w-75">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0">Alunos do Curso: {selectedCurso.nome}</h3>
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              disabled={alunos.length === 0}
            >
              Emitir Avisos
            </Button>
          </div>

          {loadingAlunos ? (
            <div className="d-flex justify-content-center mt-3">
              Carregando alunos...
            </div>
          ) : (
            <>
              {/* Barra de pesquisa fora do modal */}
              <InputGroup className="mb-3">
                <Form.Control
                  placeholder="Pesquisar alunos por nome ou email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearchTerm("")}
                >
                  Limpar
                </Button>
              </InputGroup>

              <table className="table table-bordered bg-white">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlunos.length > 0 ? (
                    filteredAlunos.map((aluno) => (
                      <tr key={aluno.id}>
                        <td>{aluno.utilizador?.nome}</td>
                        <td>{aluno.utilizador?.email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center">
                        {searchTerm
                          ? "Nenhum aluno encontrado"
                          : "Nenhum aluno matriculado neste curso"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Modal para enviar avisos */}
      <Modal
        show={showModal}
        onHide={() => !enviando && setShowModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Enviar Aviso aos Alunos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {enviado ? (
            <Alert variant="success" className="text-center">
              <Alert.Heading>Avisos enviados com sucesso!</Alert.Heading>
              <p>
                Os avisos foram enviados para os emails dos alunos selecionados.
              </p>
            </Alert>
          ) : (
            <>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label>Assunto:</Form.Label>
                <Form.Control
                  type="text"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Digite o assunto do aviso"
                  disabled={enviando}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mensagem:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Digite a mensagem que será enviada por email"
                  disabled={enviando}
                />
              </Form.Group>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5>Selecionar Alunos:</h5>
                  <span>{selectedAlunos.length} selecionados</span>
                </div>

                {/* Barra de pesquisa dentro do modal */}
                <InputGroup className="mb-3">
                  <Form.Control
                    placeholder="Pesquisar alunos por nome ou email"
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setModalSearchTerm("")}
                  >
                    Limpar
                  </Button>
                </InputGroup>

                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>
                          <Form.Check
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={
                              selectedAlunos.length ===
                                filteredModalAlunos.length &&
                              filteredModalAlunos.length > 0
                            }
                          />
                        </th>
                        <th>Nome</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredModalAlunos.length > 0 ? (
                        filteredModalAlunos.map((aluno) => (
                          <tr key={aluno.id}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedAlunos.includes(aluno.id)}
                                onChange={() => handleAlunoSelection(aluno.id)}
                              />
                            </td>
                            <td>{aluno.utilizador?.nome}</td>
                            <td>{aluno.utilizador?.email}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center">
                            Nenhum aluno encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!enviado && (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleEnviarAvisos}
                disabled={
                  enviando ||
                  !assunto ||
                  !mensagem ||
                  selectedAlunos.length === 0
                }
              >
                {enviando ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Enviando...
                  </>
                ) : (
                  "Enviar Avisos"
                )}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LecionaLista;