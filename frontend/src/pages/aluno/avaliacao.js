import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams, useNavigate } from "react-router-dom";
import private_api from "../../server/private_api";

const Avaliacao = () => {
  const { id } = useParams(); // ID do aluno
  const [avaliacoesDisponiveis, setAvaliacoesDisponiveis] = useState([]);
  const [avaliacoesConcluidas, setAvaliacoesConcluidas] = useState([]);
  const [cursoId, setCursoId] = useState(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [resultadoAtual, setResultadoAtual] = useState(null);
  const navigate = useNavigate();

  // Função para carregar todos os dados necessários
  const fetchData = async () => {
    try {
      // Obter curso do aluno
      const alunoRes = await private_api.get(`/alunos/${id}`);
      setCursoId(alunoRes.data.cursoId);

      if (alunoRes.data.cursoId) {
        // Obter avaliações do curso
        const avaliacoesRes = await private_api.get(
          `/cursos/${alunoRes.data.cursoId}/avaliacoes`
        );
        setAvaliacoesDisponiveis(avaliacoesRes.data);
      }

      // Obter submissões do aluno
      const submissoesRes = await private_api.get(`/alunos/${id}/submissoes`);
      setAvaliacoesConcluidas(submissoesRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  // Efeito para carregar dados iniciais e verificar resultado na URL
  useEffect(() => {
    const checkResultado = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const resultadoId = urlParams.get("resultado");

      if (resultadoId) {
        try {
          const resultadoRes = await private_api.get(
            `/submissoes/${resultadoId}`
          );
          setResultadoAtual(resultadoRes.data);
          setMostrarResultado(true);

          // Atualizar a lista de submissões
          await fetchData();

          // Limpar o parâmetro da URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (error) {
          console.error("Erro ao carregar resultado:", error);
        }
      }
    };

    checkResultado();
    fetchData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const handleResponderAvaliacao = (avaliacaoId) => {
    window.location.href = `/responderavaliacao/${avaliacaoId}?alunoId=${id}`;
  };

  const handleCloseModal = () => {
    setMostrarResultado(false);
    // Atualizar os dados quando o modal é fechado
    fetchData();
  };

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
        <a
          className="nav-link mx-3"
          href=""
          onClick={() => navigate(`/listacurso/${id}`)}
        >
          Cursos
        </a>
        <a
          className="nav-link mx-3"
          href=""
          onClick={() => navigate(`/aula/${id}`)}
        >
          Aulas
        </a>
        <a className="nav-link active mx-3" href="">
          Avaliações
        </a>
      </nav>
      <h2 className="mb-3 text-center">Avaliações</h2>
      {/* Modal de Resultado */}
      {mostrarResultado && resultadoAtual && (
        <div
          className="modal"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Resultado da Avaliação</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <h4>{resultadoAtual.avaliacao?.titulo || "Avaliação"}</h4>
                <p>
                  Sua pontuação:{" "}
                  <strong>
                    {resultadoAtual.pontuacao}/
                    {resultadoAtual.avaliacao?.pontuacaoMaxima || "N/A"}
                  </strong>
                </p>
                <p>Tempo gasto: {resultadoAtual.tempo}</p>
                <p>
                  Data de submissão:{" "}
                  {new Date(resultadoAtual.dataSubmissao).toLocaleString()}
                </p>

                <div className="alert alert-info mt-3">
                  Sua submissão foi adicionada ao histórico abaixo.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCloseModal}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Avaliações Disponíveis */}
      <div className="bg-white p-3 rounded shadow w-75">
        <h4>Avaliações Disponíveis</h4>
        {avaliacoesDisponiveis.length > 0 ? (
          <div className="list-group">
            {avaliacoesDisponiveis.map((avaliacao) => {
              // Verificar se o aluno já concluiu esta avaliação
              const jaConcluiu = avaliacoesConcluidas.some(
                (submissao) => submissao.avaliacaoId === avaliacao.id
              );

              return (
                <div
                  key={avaliacao.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <h5>{avaliacao.titulo}</h5>
                    <p>{avaliacao.descricao}</p>
                    <small>
                      Disponível até:{" "}
                      {new Date(avaliacao.dataFim).toLocaleString()}
                    </small>
                    {jaConcluiu && (
                      <div className="alert alert-warning mt-2 mb-0">
                        Você já completou esta avaliação.
                      </div>
                    )}
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleResponderAvaliacao(avaliacao.id)}
                    disabled={jaConcluiu}
                  >
                    {jaConcluiu ? "Concluído" : "Responder"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No momento, não há avaliações disponíveis para você fazer.</p>
        )}
      </div>

      {/* Avaliações Concluídas */}
      <div className="bg-white p-3 rounded shadow mt-4 w-75">
        <h4>Avaliações Concluídas</h4>
        {avaliacoesConcluidas.length > 0 ? (
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>Título</th>
                <th>Pontuação</th>
                <th>Tempo</th>
                <th>Entregue em</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoesConcluidas.map((submissao) => (
                <tr
                  key={submissao.id}
                  className={
                    resultadoAtual?.id === submissao.id ? "table-success" : ""
                  }
                >
                  <td>
                    {submissao.avaliacao?.titulo || "Avaliação não encontrada"}
                  </td>
                  <td>
                    {submissao.pontuacao}/
                    {submissao.avaliacao?.pontuacaoMaxima || "N/A"}
                  </td>
                  <td>{submissao.tempo}</td>
                  <td>{new Date(submissao.dataSubmissao).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Você ainda não concluiu nenhuma avaliação.</p>
        )}
      </div>
    </div>
  );
};

export default Avaliacao;