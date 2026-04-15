import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams, useNavigate } from "react-router-dom";
import private_api from "../../server/private_api";
import live from "../../img/aulas-ao-vivo-coursifyme.jpg";

const Aula = () => {
  const { id } = useParams(); // ID do aluno vindo da URL
  const [curso, setCurso] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [aulasAoVivo, setAulasAoVivo] = useState([]); // Novo estado para aulas ao vivo
  const [materiais, setMateriais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [baixandoAula, setBaixandoAula] = useState(null);
  const [baixandoMaterial, setBaixandoMaterial] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);

        const alunoResponse = await private_api.get(`/alunos/${id}`);
        const cursoId = alunoResponse.data.cursoId;

        if (cursoId) {
          const [
            cursoResponse,
            aulasResponse,
            materiaisResponse,
            aulasAoVivoResponse,
          ] = await Promise.all([
            private_api.get(`/cursos/${cursoId}`),
            private_api.get(`/aulas/curso/${cursoId}?isLive=false`), // Aulas gravadas
            private_api.get(`/materiais/curso/${cursoId}`),
            private_api.get(`/aulas/live/curso/${cursoId}`), // Rota específica para aulas ao vivo
          ]);

          setCurso(cursoResponse.data);
          setAulas(aulasResponse.data);
          setMateriais(materiaisResponse.data);
          setAulasAoVivo(aulasAoVivoResponse.data);
        } else {
          alert("Você não está matriculado em nenhum curso");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados do curso");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [id]);

  const handleDownloadAula = async (aulaId, aulaTitulo) => {
    try {
      setBaixandoAula(aulaId);
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
        <a className="nav-link active mx-3" href="">
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

      {carregando ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <>
          <h2 className="mb-3 text-center">
            Aulas {curso && `- ${curso.nome}`}
          </h2>

          <div className="row w-75">
            <div className="col-md-6">
              <h4>Aulas Ao Vivo</h4>
              {aulasAoVivo.length > 0 ? (
                <div className="card p-3">
                  {aulasAoVivo.map((aula) => (
                    <div key={aula.id} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5>{aula.titulo}</h5>
                        <a
                          href={aula.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-success"
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(
                              aula.liveUrl,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                        >
                          <i className="bi bi-camera-video me-2"></i>
                          Entrar na Aula
                        </a>
                      </div>
                      <small className="text-muted">
                        Criada em: {new Date(aula.createdAt).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-3">
                  <img
                    src={live}
                    alt="Aula ao Vivo"
                    className="img-fluid mb-2"
                  />
                  <div className="alert alert-info">
                    Nenhuma aula ao vivo agendada no momento
                  </div>
                </div>
              )}
            </div>

            <div className="col-md-6">
              <h4>Aulas Gravadas</h4>
              {aulas.length > 0 ? (
                <div className="list-group">
                  {aulas.map((aula) => (
                    <button
                      key={aula.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      onClick={() => handleDownloadAula(aula.id, aula.titulo)}
                      disabled={baixandoAula === aula.id}
                    >
                      {aula.titulo}
                      {baixandoAula === aula.id && (
                        <span className="spinner-border spinner-border-sm"></span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  Nenhuma aula gravada disponível
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 w-75">
            <h4>Material de Apoio</h4>
            <div className="card p-3">
              {materiais.length > 0 ? (
                <div className="list-group">
                  {materiais.map((material) => (
                    <button
                      key={material.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      onClick={() =>
                        handleDownloadMaterial(material.id, material.nome)
                      }
                      disabled={baixandoMaterial === material.id}
                    >
                      {material.nome}
                      {baixandoMaterial === material.id && (
                        <span className="spinner-border spinner-border-sm"></span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  Nenhum material de apoio disponível
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Aula;
