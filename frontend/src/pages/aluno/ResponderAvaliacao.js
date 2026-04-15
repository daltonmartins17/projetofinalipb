import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams, useNavigate } from "react-router-dom";
import private_api from "../../server/private_api";

const ResponderAvaliacao = () => {
  const { id } = useParams(); // ID da avaliação
  const navigate = useNavigate();
  const [avaliacao, setAvaliacao] = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [tempoInicio, setTempoInicio] = useState(null);
  const [alunoId, setAlunoId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const alunoIdParam = urlParams.get("alunoId");
    if (alunoIdParam) {
      setAlunoId(alunoIdParam);
    } else {
      // Fallback para localStorage se não estiver na URL
      const idLocalStorage = localStorage.getItem("userId");
      if (idLocalStorage) setAlunoId(idLocalStorage);
    }

    const fetchAvaliacao = async () => {
      try {
        const response = await private_api.get(`/avaliacoes/${id}`);
        setAvaliacao(response.data);
        setTempoInicio(new Date());

        // Inicializar respostas
        const inicialRespostas = response.data.perguntas.map(() => "");
        setRespostas(inicialRespostas);
      } catch (error) {
        console.error("Erro ao carregar avaliação:", error);
      }
    };

    fetchAvaliacao();
  }, [id]);

  const handleRespostaChange = (perguntaIndex, resposta) => {
    const novasRespostas = [...respostas];
    novasRespostas[perguntaIndex] = resposta;
    setRespostas(novasRespostas);
  };

  const handleSubmit = async () => {
    // Verificação inicial
    if (!avaliacao || !respostas.length || !alunoId) {
      alert("Dados incompletos para submeter a avaliação!");
      return;
    }

    try {
      const tempoFim = new Date();
      const tempoGasto = Math.floor((tempoFim - tempoInicio) / 1000);
      const minutos = Math.floor(tempoGasto / 60);
      const segundos = tempoGasto % 60;
      const tempoFormatado = `${minutos}m ${segundos}s`;

      // Verificar se todas as perguntas foram respondidas
      if (respostas.some((resposta) => resposta === "")) {
        alert("Responda todas as perguntas antes de submeter!");
        return;
      }

      const dadosSubmissao = {
        respostas: respostas.map((resposta, index) => ({
          perguntaId: index + 1, // ou usar um ID real se disponível
          resposta: resposta,
        })),
        tempo: tempoFormatado,
        alunoId: Number(alunoId),
        dataSubmissao: new Date().toISOString(),
        avaliacaoId: Number(id),
      };

      const response = await private_api.post(
        `/avaliacoes/${id}/submissoes`,
        dadosSubmissao
      );

      // Redirecionar para a página de avaliações com os dados da submissão
      navigate(`/avaliacao/${alunoId}`, {
        state: {
          avaliacaoRecente: {
            id: response.data.id,
            titulo: avaliacao.titulo,
            pontuacao: response.data.pontuacao,
            pontuacaoMaxima: avaliacao.pontuacaoMaxima,
            dataSubmissao: new Date().toLocaleString(),
            avaliacaoId: id,
          },
        },
      });
    } catch (error) {
      console.error("Erro completo:", {
        message: error.message,
        response: error.response?.data,
        request: error.config?.data,
      });

      const errorDetails = error.response?.data?.details || [];
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      alert(
        `Erro ao submeter: ${errorMessage}\nDetalhes: ${errorDetails.join(
          ", "
        )}`
      );
    }
  };

  const confirmarSubmit = () => {
    if (window.confirm("Tem certeza que deseja submeter a avaliação?")) {
      handleSubmit();
    }
  };

  if (!avaliacao) return <div>Carregando...</div>;

  return (
    <div className="container mt-4">
      <h2>{avaliacao.titulo}</h2>
      <p>{avaliacao.descricao}</p>
      <p>
        <strong>Pontuação máxima:</strong> {avaliacao.pontuacaoMaxima} pontos
      </p>

      <div className="mt-4">
        {avaliacao.perguntas.map((pergunta, index) => (
          <div key={index} className="card mb-3">
            <div className="card-header">
              <h5>Pergunta {index + 1}</h5>
            </div>
            <div className="card-body">
              <p>{pergunta.texto}</p>

              {avaliacao.tipo === "escolha_multipla" ? (
                <div className="list-group">
                  {pergunta.opcoes.map((opcao, opcaoIndex) => (
                    <label key={opcaoIndex} className="list-group-item">
                      <input
                        type="radio"
                        name={`pergunta-${index}`}
                        value={opcaoIndex}
                        checked={respostas[index] === opcaoIndex}
                        onChange={() => handleRespostaChange(index, opcaoIndex)}
                        className="me-2"
                      />
                      {opcao}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  className="form-control"
                  rows="4"
                  value={respostas[index] || ""}
                  onChange={(e) => handleRespostaChange(index, e.target.value)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-end mb-4">
        <button className="btn btn-primary" onClick={confirmarSubmit}>
          Submeter Avaliação
        </button>
      </div>
    </div>
  );
};

export default ResponderAvaliacao;
