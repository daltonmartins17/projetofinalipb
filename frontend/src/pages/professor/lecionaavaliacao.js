import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import private_api from "../../server/private_api";

const LecionaAvaliacao = () => {
  const { id } = useParams();
  const [cursos, setCursos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [cursoSelecionado, setCursoSelecionado] = useState("");
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  // Função auxiliar para formatar a data no formato esperado pelo input datetime-local
  const formatarDataParaInput = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  // Calcula a data padrão para o fim (1 hora após o início)
  const calcularDataFimPadrao = (dataInicio) => {
    const data = new Date(dataInicio);
    data.setHours(data.getHours() + 1);
    return formatarDataParaInput(data);
  };

  const [novaAvaliacao, setNovaAvaliacao] = useState({
    titulo: "",
    descricao: "",
    dataInicio: formatarDataParaInput(new Date()),
    dataFim: calcularDataFimPadrao(new Date()),
    pontuacaoMaxima: 20, // Valor fixo
    cursoId: "",
    tipo: "escolha_multipla",
    perguntas: [
      {
        texto: "",
        opcoes: ["", "", "", ""],
        respostaCorreta: 0,
        pontuacao: 1, // Valor padrão para cada pergunta
      },
    ],
  });

  // Função para calcular a soma atual das pontuações
  const calcularSomaPontuacoes = () => {
    return novaAvaliacao.perguntas.reduce(
      (total, pergunta) => total + (pergunta.pontuacao || 0),
      0
    );
  };

  // Handler para mudança da data de início
  const handleDataInicioChange = (e) => {
    const novaDataInicio = e.target.value;
    const dataAtual = new Date();
    const dataSelecionada = new Date(novaDataInicio);

    if (dataSelecionada >= dataAtual) {
      setNovaAvaliacao((prev) => ({
        ...prev,
        dataInicio: novaDataInicio,
        dataFim:
          prev.dataFim && new Date(prev.dataFim) > dataSelecionada
            ? prev.dataFim
            : calcularDataFimPadrao(dataSelecionada),
      }));
    } else {
      alert("A data de início não pode ser no passado");
      // Define a hora atual + 1 minuto para evitar problemas de arredondamento
      const novaDataPadrao = new Date();
      novaDataPadrao.setMinutes(novaDataPadrao.getMinutes() + 1);
      setNovaAvaliacao((prev) => ({
        ...prev,
        dataInicio: formatarDataParaInput(novaDataPadrao),
        dataFim: calcularDataFimPadrao(novaDataPadrao),
      }));
    }
  };

  // Handler para mudança da data de fim
  const handleDataFimChange = (e) => {
    const novaDataFim = e.target.value;
    const dataInicio = new Date(novaAvaliacao.dataInicio);
    const dataFim = new Date(novaDataFim);

    if (dataFim > dataInicio) {
      setNovaAvaliacao((prev) => ({
        ...prev,
        dataFim: novaDataFim,
      }));
    } else {
      alert("A data de fim deve ser posterior à data de início");
      // Define a data fim como 1 hora após a data de início
      setNovaAvaliacao((prev) => ({
        ...prev,
        dataFim: calcularDataFimPadrao(dataInicio),
      }));
    }
  };

  // Handler para mudança do curso selecionado
  const handleCursoChange = (e) => {
    const cursoId = e.target.value;
    setNovaAvaliacao({ ...novaAvaliacao, cursoId });
    setCursoSelecionado(cursoId);
  };

  // Handler para mudança da pontuação da pergunta
  const handlePontuacaoChange = (index, value) => {
    const valorNumerico = parseInt(value) || 0;

    // Verifica se o valor está entre 0 e 20
    if (valorNumerico < 0 || valorNumerico > 20) {
      alert("A pontuação por pergunta deve ser entre 0 e 20");
      return;
    }

    // Calcula a nova soma potencial
    const somaAtual = calcularSomaPontuacoes();
    const somaPerguntaAtual = novaAvaliacao.perguntas[index].pontuacao || 0;
    const novaSoma = somaAtual - somaPerguntaAtual + valorNumerico;

    // Verifica se a nova soma ultrapassa 20
    if (novaSoma > 20) {
      alert(
        `A soma das pontuações não pode ultrapassar 20 (atual: ${novaSoma})`
      );
      return;
    }

    const novasPerguntas = [...novaAvaliacao.perguntas];
    novasPerguntas[index].pontuacao = valorNumerico;
    setNovaAvaliacao({
      ...novaAvaliacao,
      perguntas: novasPerguntas,
    });
  };

  const fetchAvaliacoes = async () => {
    try {
      const response = await private_api.get(`/professores/${id}/avaliacoes`);
      setAvaliacoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
      alert(`Erro: ${error.response?.data?.error || error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  // Função para filtrar as avaliações por curso selecionado
  const getAvaliacoesFiltradas = () => {
    if (!cursoSelecionado) {
      return avaliacoes;
    }

    return avaliacoes.filter(
      (avaliacao) =>
        avaliacao.cursoId === parseInt(cursoSelecionado) ||
        avaliacao.curso?.id === parseInt(cursoSelecionado)
    );
  };

  // Função para calcular o total de submissões filtradas
  const getTotalSubmissoes = () => {
    return getAvaliacoesFiltradas().reduce(
      (total, avaliacao) => total + (avaliacao.submissoes?.length || 0),
      0
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCarregando(true);
        const cursosRes = await private_api.get(
          `/professores/${id}/listacursos`
        );
        setCursos(cursosRes.data);
        await fetchAvaliacoes();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setCarregando(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchAvaliacoes, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const handleAddPergunta = () => {
    setNovaAvaliacao({
      ...novaAvaliacao,
      perguntas: [
        ...novaAvaliacao.perguntas,
        {
          texto: "",
          opcoes: ["", "", "", ""],
          respostaCorreta: 0,
          pontuacao: 1, // Valor padrão para novas perguntas
        },
      ],
    });
  };

  const handleRemovePergunta = (index) => {
    const novasPerguntas = [...novaAvaliacao.perguntas];
    novasPerguntas.splice(index, 1);
    setNovaAvaliacao({
      ...novaAvaliacao,
      perguntas: novasPerguntas,
    });
  };

  const handlePerguntaChange = (index, field, value) => {
    const novasPerguntas = [...novaAvaliacao.perguntas];
    novasPerguntas[index][field] = value;
    setNovaAvaliacao({
      ...novaAvaliacao,
      perguntas: novasPerguntas,
    });
  };

  const handleOpcaoChange = (perguntaIndex, opcaoIndex, value) => {
    const novasPerguntas = [...novaAvaliacao.perguntas];
    novasPerguntas[perguntaIndex].opcoes[opcaoIndex] = value;
    setNovaAvaliacao({
      ...novaAvaliacao,
      perguntas: novasPerguntas,
    });
  };

  const handleCriarAvaliacao = async () => {
    try {
      if (!novaAvaliacao.titulo || !novaAvaliacao.cursoId) {
        alert("Preencha todos os campos obrigatórios");
        return;
      }

      // Validação das datas
      const agora = new Date();
      const dataInicio = new Date(novaAvaliacao.dataInicio);
      const dataFim = new Date(novaAvaliacao.dataFim);

      if (dataInicio < agora) {
        alert("A data de início não pode ser no passado");
        return;
      }

      if (dataFim <= dataInicio) {
        alert("A data de fim deve ser posterior à data de início");
        return;
      }

      // Validação das perguntas
      for (const pergunta of novaAvaliacao.perguntas) {
        if (!pergunta.texto || pergunta.opcoes.some((opcao) => !opcao)) {
          alert("Preencha todas as perguntas e opções corretamente");
          return;
        }
      }

      // Validação da soma das pontuações
      if (calcularSomaPontuacoes() !== 20) {
        alert("A soma das pontuações das perguntas deve ser exatamente 20");
        return;
      }

      setCarregando(true);
      const resposta = await private_api.post("/avaliacoes", {
        ...novaAvaliacao,
        professorId: id,
        dataInicio: new Date(novaAvaliacao.dataInicio).toISOString(),
        dataFim: new Date(novaAvaliacao.dataFim).toISOString(),
      });

      if (resposta.status === 201) {
        alert("Avaliação criada com sucesso!");
        setNovaAvaliacao({
          titulo: "",
          descricao: "",
          dataInicio: formatarDataParaInput(new Date()),
          dataFim: calcularDataFimPadrao(new Date()),
          pontuacaoMaxima: 20,
          cursoId: "",
          tipo: "escolha_multipla",
          perguntas: [
            {
              texto: "",
              opcoes: ["", "", "", ""],
              respostaCorreta: 0,
              pontuacao: 1,
            },
          ],
        });
        await fetchAvaliacoes();
      }
    } catch (error) {
      console.error("Erro ao criar avaliação:", error);
      alert(`Erro: ${error.response?.data?.error || error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center"
      style={{
        backgroundColor: "#E7EFF4",
        minHeight: "200vh",
        padding: "20px",
      }}
    >
      <nav className="nav nav-tabs mb-3 bg-white p-2 w-75 d-flex justify-content-center">
        <a
          className="nav-link mx-3"
          href=""
          onClick={() => navigate(`/lecionalista/${id}`)}
        >
          Cursos
        </a>
        <a
          className="nav-link mx-3"
          href=""
          onClick={() => navigate(`/lecionaaula/${id}`)}
        >
          Aulas
        </a>
        <a className="nav-link active mx-3" href="">
          Avaliações
        </a>
      </nav>

      <h2 className="mb-3 text-center">Avaliações de Escolha Múltipla</h2>

      <div className="mb-3 w-75 d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <label className="me-2">Curso:</label>
          <select
            className="form-select me-3"
            style={{ width: "200px" }}
            value={novaAvaliacao.cursoId}
            onChange={handleCursoChange}
          >
            <option value="">Selecionar Curso</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.nome}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCriarAvaliacao}
          disabled={carregando}
        >
          {carregando ? "Criando..." : "Criar Avaliação"}
        </button>
      </div>

      <div className="bg-white p-3 rounded shadow w-75 mb-4">
        <h4>Criar Nova Avaliação</h4>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Título*</label>
            <input
              type="text"
              className="form-control"
              value={novaAvaliacao.titulo}
              onChange={(e) =>
                setNovaAvaliacao({ ...novaAvaliacao, titulo: e.target.value })
              }
              disabled={carregando}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Pontuação Máxima</label>
            <input
              type="number"
              className="form-control"
              value={20}
              readOnly
              disabled
            />
          </div>
          <div className="col-12">
            <label className="form-label">Descrição</label>
            <textarea
              className="form-control"
              rows="2"
              value={novaAvaliacao.descricao}
              onChange={(e) =>
                setNovaAvaliacao({
                  ...novaAvaliacao,
                  descricao: e.target.value,
                })
              }
              disabled={carregando}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Data de Início*</label>
            <input
              type="datetime-local"
              className="form-control"
              value={novaAvaliacao.dataInicio}
              onChange={handleDataInicioChange}
              min={formatarDataParaInput(new Date())}
              disabled={carregando}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Data de Fim*</label>
            <input
              type="datetime-local"
              className="form-control"
              value={novaAvaliacao.dataFim}
              onChange={handleDataFimChange}
              min={
                novaAvaliacao.dataInicio || formatarDataParaInput(new Date())
              }
              disabled={carregando}
            />
          </div>
        </div>

        <div className="mt-4">
          <h5>Perguntas de Escolha Múltipla</h5>
          <div className="alert alert-info">
            Soma total das pontuações: {calcularSomaPontuacoes()}/20
          </div>
          {novaAvaliacao.perguntas.map((pergunta, pIndex) => (
            <div key={pIndex} className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Pergunta {pIndex + 1}</span>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemovePergunta(pIndex)}
                  disabled={novaAvaliacao.perguntas.length <= 1 || carregando}
                >
                  Remover
                </button>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Texto da Pergunta*</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pergunta.texto}
                    onChange={(e) =>
                      handlePerguntaChange(pIndex, "texto", e.target.value)
                    }
                    disabled={carregando}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pontuação (0-20)*</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="20"
                    value={pergunta.pontuacao || 0}
                    onChange={(e) =>
                      handlePontuacaoChange(pIndex, e.target.value)
                    }
                    disabled={carregando}
                  />
                </div>
                <label className="form-label">Opções de Resposta*</label>
                {pergunta.opcoes.map((opcao, oIndex) => (
                  <div key={oIndex} className="input-group mb-2">
                    <div className="input-group-text">
                      <input
                        type="radio"
                        name={`resposta-${pIndex}`}
                        checked={pergunta.respostaCorreta === oIndex}
                        onChange={() =>
                          handlePerguntaChange(
                            pIndex,
                            "respostaCorreta",
                            oIndex
                          )
                        }
                        disabled={carregando}
                      />
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Opção ${oIndex + 1}`}
                      value={opcao}
                      onChange={(e) =>
                        handleOpcaoChange(pIndex, oIndex, e.target.value)
                      }
                      disabled={carregando}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleAddPergunta}
            disabled={carregando}
          >
            Adicionar Pergunta
          </button>
        </div>
      </div>

      <div className="bg-white p-3 rounded shadow w-75">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Avaliações Submetidas</h4>
          <div>
            <span className="badge bg-primary me-2">
              {getTotalSubmissoes()} submissões
            </span>
            {carregando && (
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">Carregando...</span>
              </div>
            )}
          </div>
        </div>

        {carregando && avaliacoes.length === 0 ? (
          <div className="text-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : getAvaliacoesFiltradas().length > 0 ? (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Aluno</th>
                  <th>ID</th>
                  <th>Avaliação</th>
                  <th>Curso</th>
                  <th>Pontuação</th>
                  <th>Tempo</th>
                  <th>Entregue em</th>
                </tr>
              </thead>
              <tbody>
                {getAvaliacoesFiltradas().flatMap((avaliacao) =>
                  avaliacao.submissoes?.map((submissao, index) => (
                    <tr key={`${avaliacao.id}-${index}`}>
                      <td>{submissao.nomeAluno || "Nome não disponível"}</td>
                      <td>{submissao.alunoId}</td>
                      <td>{avaliacao.titulo}</td>
                      <td>{avaliacao.cursoNome}</td>
                      <td>
                        {submissao.pontuacao}/{avaliacao.pontuacaoMaxima}
                      </td>
                      <td>{submissao.tempo}</td>
                      <td>{submissao.entregue || "Data não disponível"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="alert alert-info">
            {cursoSelecionado
              ? "Nenhuma avaliação submetida para este curso"
              : "Nenhuma avaliação submetida ainda"}
          </div>
        )}
      </div>
    </div>
  );
};

export default LecionaAvaliacao;
