import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams, useNavigate } from "react-router-dom";
import private_api from "../../server/private_api";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const ListaCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [aluno, setAluno] = useState(null);
  const [cursosAluno, setCursosAluno] = useState([]);
  const [professores, setProfessores] = useState({});
  const [loading, setLoading] = useState(true);

  // Estados para o modal de inscrição
  const [showModal, setShowModal] = useState(false);
  const [cursosDisponiveis, setCursosDisponiveis] = useState([]);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [nivel, setNivel] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  // Busca cursos disponíveis (filtrando os que o aluno já está matriculado)
  const fetchCursosDisponiveis = async () => {
    try {
      const resposta = await private_api.get("/cursos");
      if (resposta.status === 200) {
        // Filtra os cursos, removendo aqueles em que o aluno já está matriculado
        const cursosFiltrados = resposta.data.filter(
          (cursoDisponivel) =>
            !cursosAluno.some(
              (cursoAluno) => cursoAluno.id === cursoDisponivel.id
            )
        );
        setCursosDisponiveis(cursosFiltrados);

        // Se não houver cursos disponíveis, mostra mensagem
        if (cursosFiltrados.length === 0) {
          setMensagem({
            texto: "Você já está matriculado em todos os cursos disponíveis.",
            tipo: "info",
          });
        }
      }  
    } catch (error) {
      console.error("Erro ao buscar cursos disponíveis:", error);
      setMensagem({
        texto: "Erro ao carregar cursos disponíveis.",
        tipo: "danger",
      });
    }
  };

  // Busca os cursos do aluno e informações dos professores
  const fetchCursosAluno = async () => {
    try {
      const resposta = await private_api.get(`/alunos/${id}/listacursos`);
      if (resposta.status === 200) {
        setCursosAluno(resposta.data);

        const professoresMap = {};
        for (const curso of resposta.data) {
          if (curso.professorId && !professoresMap[curso.professorId]) {
            try {
              const profResposta = await private_api.get(
                `/professores/${curso.professorId}`
              );
              if (profResposta.status === 200) {
                professoresMap[curso.professorId] = {
                  nome: profResposta.data.utilizador.nome,
                  email: profResposta.data.utilizador.email, // Adiciona o email
                };
              }
            } catch (error) {
              console.error(
                `Erro ao buscar professor ${curso.professorId}:`,
                error
              );
            }
          }
        }
        setProfessores(professoresMap);
      }
    } catch (error) {
      console.error("Erro ao buscar cursos do aluno:", error);
    }
  };

  // Busca informações do aluno
  const fetchAluno = async () => {
    try {
      const resposta = await private_api.get(`/alunos/${id}`);
      if (resposta.status === 200) {
        setAluno(resposta.data);
      }
    } catch (error) {
      console.error("Erro ao buscar aluno:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAluno();
    fetchCursosAluno();
  }, [id]);

  // Abre o modal e busca cursos disponíveis
  const handleAbrirModal = () => {
    setShowModal(true);
    setMensagem({ texto: "", tipo: "" });
    fetchCursosDisponiveis();
  };

  // Fecha o modal e reseta os estados
  const handleFecharModal = () => {
    setShowModal(false);
    setCursoSelecionado(null);
    setNivel("");
    setPeriodo("manha");
    setMensagem({ texto: "", tipo: "" });
  };

  // Atualiza o curso selecionado
  const handleSelecionarCurso = (cursoId) => {
    const curso = cursosDisponiveis.find((c) => c.id === cursoId);
    setCursoSelecionado(curso);
    // Define o nível e período do curso selecionado
    setNivel(curso?.nivel || "");
    setPeriodo(curso?.periodo || "");
  };

  // Envia a inscrição
  const handleEnviarInscricao = async () => {
    if (!cursoSelecionado || !nivel || !periodo) {
      setMensagem({ texto: "Preencha todos os campos", tipo: "danger" });
      return;
    }

    // Verificação adicional para garantir que o aluno não está tentando se inscrever novamente
    const jaMatriculado = cursosAluno.some(
      (curso) => curso.id === cursoSelecionado.id
    );

    if (jaMatriculado) {
      setMensagem({
        texto: "Você já está matriculado neste curso.",
        tipo: "danger",
      });
      return;
    }

    setEnviando(true);
    try {
      // Normaliza o período para minúsculas e sem acento
      const periodoNormalizado = periodo.toLowerCase().replace("ã", "a");

      const resposta = await private_api.post("/inscricoes", {
        alunoId: id,
        cursoId: cursoSelecionado.id,
        nivel,
        periodo: periodoNormalizado,
        status: "pendente",
      });

      if (resposta.status === 201) {
        setMensagem({
          texto:
            "Inscrição enviada com sucesso! Um email foi enviado para o administrador.",
          tipo: "success",
        });

        // Envia email para o administrador
        await private_api.post("/email/notificacao", {
          to: process.env.EMAIL_USER || "daltonrafaprojetofinal@gmail.com",
          subject: `Nova inscrição de ${aluno.utilizador.nome} (ID: ${aluno.id})`,
          text: `O aluno ${aluno.utilizador.nome} (ID: ${
            aluno.id
          }) solicitou inscrição no curso ${cursoSelecionado.nome} (${nivel}, ${
            periodo === "manha" ? "Manhã" : "Tarde"
          }).`,
        });

        // Atualiza a lista de cursos do aluno após um pequeno delay
        setTimeout(() => {
          fetchCursosAluno();
          handleFecharModal();
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao enviar inscrição:", error);
      setMensagem({
        texto: "Erro ao enviar inscrição. Tente novamente.",
        tipo: "danger",
      });
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div
        className="container-fluid d-flex flex-column align-items-center justify-content-center"
        style={{ backgroundColor: "#E7EFF4", minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!aluno) {
    return (
      <div
        className="container-fluid d-flex flex-column align-items-center justify-content-center"
        style={{ backgroundColor: "#E7EFF4", minHeight: "100vh" }}
      >
        <div className="alert alert-danger">Aluno não encontrado</div>
      </div>
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
      {/* Modal de Inscrição */}
      <Modal show={showModal} onHide={handleFecharModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Inscrever-se em um Curso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensagem.texto && (
            <div className={`alert alert-${mensagem.tipo}`}>
              {mensagem.texto}
            </div>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Selecione um Curso</Form.Label>
              <Form.Select
                onChange={(e) =>
                  handleSelecionarCurso(parseInt(e.target.value))
                }
                value={cursoSelecionado?.id || ""}
                disabled={cursosDisponiveis.length === 0}
              >
                <option value="">Selecione um curso</option>
                {cursosDisponiveis.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome}
                  </option>
                ))}
              </Form.Select>
              {cursosDisponiveis.length === 0 && (
                <Form.Text className="text-muted">
                  Não há cursos disponíveis para inscrição no momento.
                </Form.Text>
              )}
            </Form.Group>

            {cursoSelecionado && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Nível</Form.Label>
                  <Form.Control
                    type="text"
                    value={nivel}
                    onChange={(e) => setNivel(e.target.value)}
                    readOnly
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Período</Form.Label>
                  <Form.Control
                    type="text"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    readOnly
                  />
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFecharModal}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleEnviarInscricao}
            disabled={
              enviando || !cursoSelecionado || cursosDisponiveis.length === 0
            }
          >
            {enviando ? "Enviando..." : "Enviar Inscrição"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Conteúdo principal */}
      <div className="bg-white w-75 p-2 d-flex justify-content-center">
        <nav className="nav nav-tabs">
          <a className="nav-link active mx-3" href="">
            Cursos
          </a>
          <a
            className="nav-link mx-3"
            href=""
            onClick={() => navigate(`/aula/${id}`)}
          >
            Aulas
          </a>
          <a
            className="nav-link mx-3"
            href=""
            onClick={() => navigate(`/avaliacao/${id}`)}
          >
            Avaliações
          </a>
        </nav>
      </div>

      <div className="d-flex justify-content-between align-items-center w-75 mb-3">
        <h2>Cursos de {aluno.utilizador.nome}</h2>
      </div>

      <table className="table table-bordered bg-white w-75">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Nível</th>
            <th>Data de Início</th>
            <th>Data de Fim</th>
            <th>Período</th>
            <th>Professor</th>
            <th>Email</th> {/* Nova coluna */}
          </tr>
        </thead>
        <tbody>
          {cursosAluno.length > 0 ? (
            cursosAluno.map((curso) => (
              <tr key={curso.id}>
                <td>{curso.nome}</td>
                <td>{curso.nivel}</td>
                <td>{new Date(curso.dataInicio).toLocaleDateString()}</td>
                <td>{new Date(curso.dataFim).toLocaleDateString()}</td>
                <td>{curso.periodo}</td>
                <td>{professores[curso.professorId]?.nome || "N/A"}</td>
                <td>{professores[curso.professorId]?.email || "N/A"}</td>{" "}
                {/* Nova célula */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                {" "}
                {/* Ajuste para colSpan="7" */}
                Este aluno não está inscrito em nenhum curso
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="card p-3 w-75 mt-4">
        <div className="d-flex justify-content-between align-items-center">
          <span>Inscrever-se em um Curso</span>
          <div>
            <button className="btn btn-primary me-2" onClick={handleAbrirModal}>
              Nova Inscrição
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaCurso;
