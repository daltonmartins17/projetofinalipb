import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams, useNavigate } from "react-router-dom";
import live from "../../img/aulas-ao-vivo-coursifyme.jpg";
import private_api from "../../server/private_api";

const LecionaAula = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [materiais, setMateriais] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [cursoSelecionado, setCursoSelecionado] = useState("");
  const [novaAula, setNovaAula] = useState({
    titulo: "",
    arquivo: null,
  });
  const [novoMaterial, setNovoMaterial] = useState({
    nome: "",
    arquivo: null,
  });
  const [editandoMaterial, setEditandoMaterial] = useState(null);
  const [editandoAula, setEditandoAula] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [baixandoAula, setBaixandoAula] = useState(null);
  const [baixandoMaterial, setBaixandoMaterial] = useState(null);

  const [aulasAoVivo, setAulasAoVivo] = useState([]);
  const [novaAulaAoVivo, setNovaAulaAoVivo] = useState({
    titulo: "",
  });

  const cancelarAulaAoVivo = async (id) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta aula ao vivo?")) {
      return;
    }

    try {
      setCarregando(true);
      await private_api.delete(`/aulas/live/${id}`);
      setAulasAoVivo(aulasAoVivo.filter((aula) => aula.id !== id));
      alert("Aula ao vivo cancelada com sucesso!");
    } catch (error) {
      console.error("Erro ao cancelar aula ao vivo:", error);
      alert("Erro ao cancelar aula ao vivo");
    } finally {
      setCarregando(false);
    }
  };

  // Adicione este useEffect para carregar aulas ao vivo quando um curso é selecionado
  useEffect(() => {
    if (cursoSelecionado) {
      const carregarAulasAoVivo = async () => {
        try {
          const response = await private_api.get(
            `/aulas/live/curso/${cursoSelecionado}`
          );
          setAulasAoVivo(response.data);
        } catch (error) {
          console.error("Erro ao carregar aulas ao vivo:", error);
        }
      };

      carregarAulasAoVivo();
    } else {
      setAulasAoVivo([]);
    }
  }, [cursoSelecionado]);

  // Adicione esta função para criar nova aula ao vivo
  const criarAulaAoVivo = async () => {
    if (!novaAulaAoVivo.titulo || !cursoSelecionado || !id) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setCarregando(true);
      const response = await private_api.post("/aulas/live", {
        titulo: novaAulaAoVivo.titulo,
        cursoId: cursoSelecionado,
        professorId: id,
      });

      setAulasAoVivo([...aulasAoVivo, response.data]);
      alert("Aula ao vivo criada com sucesso!");
      setNovaAulaAoVivo({ titulo: "" });
    } catch (error) {
      console.error("Erro ao criar aula ao vivo:", error);
      alert(
        "Erro ao criar aula ao vivo: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setCarregando(false);
    }
  };

  // Carregar cursos do professor
  useEffect(() => {
    const carregarCursos = async () => {
      try {
        setCarregando(true);
        const response = await private_api.get(`/professores/${id}/cursos`);

        if (response.data && Array.isArray(response.data)) {
          setCursos(response.data);
        } else {
          console.error("Formato de dados inesperado:", response.data);
          setCursos([]);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar cursos:",
          error.response?.data || error.message
        );
        setCursos([]);
      } finally {
        setCarregando(false);
      }
    };

    if (id) {
      carregarCursos();
    } else {
      console.error("ID do professor não encontrado na URL");
      setCursos([]);
    }
  }, [id]);

  // Carregar materiais e aulas quando um curso é selecionado
  useEffect(() => {
    if (cursoSelecionado) {
      const carregarDadosDoCurso = async () => {
        try {
          setCarregando(true);

          // Carregar materiais
          const materiaisRes = await private_api.get(
            `/materiais/curso/${cursoSelecionado}`
          );
          setMateriais(materiaisRes.data);

          // Carregar aulas
          const aulasRes = await private_api.get(
            `/aulas/curso/${cursoSelecionado}`
          );
          setAulas(aulasRes.data);
        } catch (error) {
          console.error("Erro ao carregar dados do curso:", error);
        } finally {
          setCarregando(false);
        }
      };

      carregarDadosDoCurso();
    } else {
      setMateriais([]);
      setAulas([]);
    }
  }, [cursoSelecionado]);

  const handleDownloadAula = async (aulaId, aulaTitulo) => {
    try {
      setBaixandoAula(aulaId);

      // Cria um link temporário para forçar o download
      const downloadUrl = `${private_api.defaults.baseURL}aulas/download/${aulaId}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute(
        "download",
        `${aulaTitulo.replace(/[^a-zA-Z0-9]/g, "_")}.mp4`
      );
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Adiciona um timeout para garantir que o estado seja resetado mesmo se houver erro
      setTimeout(() => setBaixandoAula(null), 5000);
    } catch (error) {
      console.error("Erro ao baixar aula:", error);
      alert("Erro ao baixar a aula. Por favor, tente novamente.");
      setBaixandoAula(null);
    }
  };

  const handleDownloadMaterial = async (materialId, materialNome) => {
    try {
      setBaixandoMaterial(materialId);

      const downloadUrl = `${private_api.defaults.baseURL}materiais/download/${materialId}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", materialNome || "material");
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setBaixandoMaterial(null), 5000);
    } catch (error) {
      console.error("Erro ao baixar material:", error);
      alert("Erro ao baixar o material. Por favor, tente novamente.");
      setBaixandoMaterial(null);
    }
  };

  const handleMaterialUpload = async (e) => {
    e.preventDefault();

    if (!novoMaterial.arquivo || !cursoSelecionado) {
      alert("Selecione um arquivo e um curso");
      return;
    }

    const formData = new FormData();
    formData.append("arquivo", novoMaterial.arquivo);
    formData.append("nome", novoMaterial.nome || novoMaterial.arquivo.name);
    formData.append("cursoId", cursoSelecionado);

    try {
      setCarregando(true);
      const response = await private_api.post("/materiais", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMateriais([...materiais, response.data]);
      setNovoMaterial({ nome: "", arquivo: null });
      alert("Material adicionado com sucesso!");
    } catch (error) {
      console.error(
        "Erro ao enviar material:",
        error.response?.data || error.message
      );
      alert(
        `Erro ao enviar material: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setCarregando(false);
    }
  };

  const atualizarMaterial = async () => {
    if (!editandoMaterial || !editandoMaterial.nome) {
      alert("Preencha o nome do material");
      return;
    }

    try {
      setCarregando(true);
      const response = await private_api.put(
        `/materiais/${editandoMaterial.id}`,
        {
          nome: editandoMaterial.nome,
        }
      );

      setMateriais(
        materiais.map((m) => (m.id === editandoMaterial.id ? response.data : m))
      );
      setEditandoMaterial(null);
      alert("Material atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar material:", error);
      alert("Erro ao atualizar material");
    } finally {
      setCarregando(false);
    }
  };

  const removerMaterial = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este material?")) {
      return;
    }

    try {
      setCarregando(true);
      await private_api.delete(`/materiais/${id}`);
      setMateriais(materiais.filter((material) => material.id !== id));
      alert("Material removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover material:", error);
      alert("Erro ao remover material");
    } finally {
      setCarregando(false);
    }
  };

  const adicionarAula = async () => {
    if (!novaAula.titulo || !novaAula.arquivo || !cursoSelecionado || !id) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const formData = new FormData();
    formData.append("video", novaAula.arquivo);
    formData.append("titulo", novaAula.titulo);
    formData.append("cursoId", cursoSelecionado);
    formData.append("professorId", id);

    try {
      setCarregando(true);
      const response = await private_api.post("/aulas", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAulas([...aulas, response.data]);
      alert("Aula adicionada com sucesso!");
      setNovaAula({ titulo: "", arquivo: null });
    } catch (error) {
      console.error("Erro ao adicionar aula:", error);
      alert(
        "Erro ao adicionar aula: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setCarregando(false);
    }
  };

  const atualizarAula = async () => {
    if (!editandoAula || !editandoAula.titulo) {
      alert("Preencha o título da aula");
      return;
    }

    try {
      setCarregando(true);
      const response = await private_api.put(`/aulas/${editandoAula.id}`, {
        titulo: editandoAula.titulo,
      });

      setAulas(
        aulas.map((a) => (a.id === editandoAula.id ? response.data : a))
      );
      setEditandoAula(null);
      alert("Aula atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar aula:", error);
      alert("Erro ao atualizar aula");
    } finally {
      setCarregando(false);
    }
  };

  const removerAula = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover esta aula?")) {
      return;
    }

    try {
      setCarregando(true);
      await private_api.delete(`/aulas/${id}`);
      setAulas(aulas.filter((aula) => aula.id !== id));
      alert("Aula removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover aula:", error);
      alert("Erro ao remover aula");
    } finally {
      setCarregando(false);
    }
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
          onClick={() => navigate(`/lecionalista/${id}`)}
        >
          Cursos
        </a>
        <a className="nav-link active mx-3" href="">
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

      <h2 className="mb-3 text-center">Aulas</h2>

      {carregando && cursos.length === 0 ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between w-75">
            <div>
              <h4>Aulas Ao Vivo</h4>
              <div className="card p-3 mb-3">
                {cursoSelecionado ? (
                  <>
                    <div className="mb-3">
                      <label className="form-label">
                        Título da Aula Ao Vivo
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={novaAulaAoVivo.titulo}
                        onChange={(e) =>
                          setNovaAulaAoVivo({
                            ...novaAulaAoVivo,
                            titulo: e.target.value,
                          })
                        }
                        disabled={carregando}
                      />
                    </div>
                    <button
                      className="btn btn-primary mb-3"
                      onClick={criarAulaAoVivo}
                      disabled={carregando || !novaAulaAoVivo.titulo}
                    >
                      {carregando ? "Criando..." : "Criar Nova Aula Ao Vivo"}
                    </button>

                    {aulasAoVivo.length > 0 ? (
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Aula Ao Vivo</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aulasAoVivo.map((aula) => (
                            <tr key={aula.id}>
                              <td>{aula.titulo}</td>
                              <td>
                                <a
                                  href={aula.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-primary  me-2"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    window.open(
                                      aula.liveUrl,
                                      "_blank",
                                      "noopener,noreferrer"
                                    );
                                  }}
                                >
                                  <i className="bi bi-camera-video"></i> Iniciar
                                  Aula
                                </a>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => cancelarAulaAoVivo(aula.id)}
                                  disabled={carregando}
                                >
                                  <i className="bi bi-trash"></i> Cancelar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="alert alert-info">
                        Nenhuma aula ao vivo agendada para este curso
                      </div>
                    )}
                  </>
                ) : (
                  <div className="alert alert-info">
                    Selecione um curso para gerenciar aulas ao vivo
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4>Aulas Gravadas</h4>
              </div>
              <div className="d-flex mb-2">
                <select
                  className="form-select me-2"
                  value={cursoSelecionado}
                  onChange={(e) => setCursoSelecionado(e.target.value)}
                  disabled={carregando}
                >
                  <option value="">Selecione o Curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Formulário para adicionar nova aula */}
              {cursoSelecionado && (
                <div className="card p-3 mb-3">
                  <h5>Adicionar Nova Aula</h5>
                  <div className="mb-3">
                    <label className="form-label">Título da Aula</label>
                    <input
                      type="text"
                      className="form-control"
                      value={novaAula.titulo}
                      onChange={(e) =>
                        setNovaAula({ ...novaAula, titulo: e.target.value })
                      }
                      disabled={carregando}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Vídeo da Aula</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="video/*"
                      onChange={(e) =>
                        setNovaAula({ ...novaAula, arquivo: e.target.files[0] })
                      }
                      disabled={carregando}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={adicionarAula}
                    disabled={
                      carregando || !novaAula.titulo || !novaAula.arquivo
                    }
                  >
                    {carregando ? "Enviando..." : "Enviar Aula"}
                  </button>
                </div>
              )}

              {/* Modal de edição de aula */}
              {editandoAula && (
                <div
                  className="modal"
                  style={{
                    display: "block",
                    backgroundColor: "rgba(0,0,0,0.5)",
                  }}
                >
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Editar Aula</h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setEditandoAula(null)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">Título da Aula</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editandoAula.titulo}
                            onChange={(e) =>
                              setEditandoAula({
                                ...editandoAula,
                                titulo: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setEditandoAula(null)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={atualizarAula}
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {carregando && cursoSelecionado ? (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              ) : aulas.length > 0 ? (
                <table className="table table-bordered bg-white">
                  <thead>
                    <tr>
                      <th>Aulas Gravadas</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aulas.map((aula) => (
                      <tr key={aula.id}>
                        <td>
                          <button
                            className="btn btn-link text-start p-0 border-0 bg-transparent"
                            onClick={() =>
                              handleDownloadAula(aula.id, aula.titulo)
                            }
                            disabled={baixandoAula === aula.id}
                            style={{ textDecoration: "none" }}
                          >
                            {baixandoAula === aula.id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                ></span>
                                Baixando...
                              </>
                            ) : (
                              aula.titulo
                            )}
                          </button>
                        </td>
                        <td className="text-nowrap">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => setEditandoAula(aula)}
                            disabled={carregando}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i> Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removerAula(aula.id)}
                            disabled={carregando}
                            title="Excluir"
                          >
                            <i className="bi bi-trash"></i> Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="alert alert-info">
                  {cursoSelecionado
                    ? "Nenhuma aula encontrada para este curso"
                    : "Selecione um curso para visualizar as aulas"}
                </div>
              )}
            </div>
          </div>

          {/* Seção de Materiais de Apoio */}
          <div className="mt-4 w-75">
            <h4>Material de Apoio</h4>
            <div className="card p-3">
              {cursoSelecionado ? (
                <>
                  <form onSubmit={handleMaterialUpload}>
                    <div className="mb-3">
                      <label className="form-label">
                        Nome do Material (opcional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={novoMaterial.nome}
                        onChange={(e) =>
                          setNovoMaterial({
                            ...novoMaterial,
                            nome: e.target.value,
                          })
                        }
                        disabled={carregando}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Arquivo do Material</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={(e) =>
                          setNovoMaterial({
                            ...novoMaterial,
                            arquivo: e.target.files[0],
                          })
                        }
                        disabled={carregando}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={carregando || !novoMaterial.arquivo}
                    >
                      {carregando ? "Enviando..." : "Adicionar Material"}
                    </button>
                  </form>

                  {/* Modal de edição de material */}
                  {editandoMaterial && (
                    <div
                      className="modal"
                      style={{
                        display: "block",
                        backgroundColor: "rgba(0,0,0,0.5)",
                      }}
                    >
                      <div className="modal-dialog">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Editar Material</h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => setEditandoMaterial(null)}
                            ></button>
                          </div>
                          <div className="modal-body">
                            <div className="mb-3">
                              <label className="form-label">
                                Nome do Material
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={editandoMaterial.nome}
                                onChange={(e) =>
                                  setEditandoMaterial({
                                    ...editandoMaterial,
                                    nome: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setEditandoMaterial(null)}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={atualizarMaterial}
                            >
                              Salvar Alterações
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {carregando ? (
                    <div className="text-center my-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Carregando...</span>
                      </div>
                    </div>
                  ) : materiais.length > 0 ? (
                    <table className="table table-bordered mt-3">
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materiais.map((material) => (
                          <tr key={material.id}>
                            <td>
                              <button
                                className="btn btn-link text-start p-0 border-0 bg-transparent"
                                onClick={() =>
                                  handleDownloadMaterial(
                                    material.id,
                                    material.nome
                                  )
                                }
                                disabled={baixandoMaterial === material.id}
                                style={{ textDecoration: "none" }}
                              >
                                {baixandoMaterial === material.id ? (
                                  <>
                                    <span
                                      className="spinner-border spinner-border-sm me-2"
                                      role="status"
                                    ></span>
                                    Baixando...
                                  </>
                                ) : (
                                  material.nome
                                )}
                              </button>
                            </td>
                            <td className="text-nowrap">
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => setEditandoMaterial(material)}
                                disabled={carregando}
                                title="Editar"
                              >
                                <i className="bi bi-pencil"></i> Editar
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removerMaterial(material.id)}
                                disabled={carregando}
                                title="Excluir"
                              >
                                <i className="bi bi-trash"></i> Remover
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="alert alert-info mt-3">
                      Nenhum material de apoio encontrado para este curso
                    </div>
                  )}
                </>
              ) : (
                <div className="alert alert-info">
                  Selecione um curso para visualizar os materiais de apoio
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LecionaAula;
