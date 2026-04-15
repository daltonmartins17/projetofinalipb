import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const AdmListAluno = () => {
  const [alunos, setAlunos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [certificadoData, setCertificadoData] = useState({
    assunto: "Certificado de Conclusão",
    mensagem:
      "Parabéns por completar o curso! Segue em anexo o seu certificado.",
  });
  const [filtroModal, setFiltroModal] = useState(""); // Novo estado para o filtro do modal
  const navigate = useNavigate();

  // Buscar alunos no backend
  const fetchAlunos = async () => {
    try {
      const resposta = await fetch("http://localhost:5000/alunos");
      if (resposta.ok) {
        const dados = await resposta.json();
        setAlunos(dados);
      } else {
        console.error("Erro ao buscar alunos");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  // Filtrando alunos pelo nome
  const alunosFiltrados = alunos.filter((aluno) =>
    aluno.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  // Filtrando alunos para o modal
  const alunosFiltradosModal = alunos.filter((aluno) =>
    aluno.nome.toLowerCase().includes(filtroModal.toLowerCase())
  );

  // Remover aluno
  const removerAluno = async (id) => {
    try {
      const resposta = await fetch(`http://localhost:5000/alunos/${id}`, {
        method: "DELETE",
      });

      if (resposta.ok) {
        fetchAlunos();
      } else {
        console.error("Erro ao remover aluno");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  // Manipular seleção de alunos
  const handleSelectAluno = (alunoId) => {
    setSelectedAlunos((prev) => {
      if (prev.includes(alunoId)) {
        return prev.filter((id) => id !== alunoId);
      } else {
        return [...prev, alunoId];
      }
    });
  };

  // Enviar certificados
  const enviarCertificados = async () => {
    try {
      const alunosParaEnviar = alunos.filter((aluno) =>
        selectedAlunos.includes(aluno.id)
      );

      for (const aluno of alunosParaEnviar) {
        // Substitua a chamada atual por:
        const response = await fetch(
          "http://localhost:5000/email/certificado",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: aluno.email,
              subject: certificadoData.assunto,
              text: certificadoData.mensagem,
              alunoNome: aluno.nome,
              cursoNome: aluno.aluno?.curso?.nome || "Curso não especificado",
            }),
          }
        );

        if (!response.ok) {
          console.error(`Falha ao enviar email para ${aluno.nome}`);
        }
      }

      alert("Certificados enviados com sucesso!");
      setShowModal(false);
      setSelectedAlunos([]);
      setFiltroModal(""); // Limpa o filtro ao fechar
    } catch (error) {
      console.error("Erro ao enviar certificados:", error);
      alert("Ocorreu um erro ao enviar os certificados");
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-primary text-center">EducaWeb</h1>
      <ul className="nav nav-tabs justify-content-center mt-3">
        <li className="nav-item mx-2">
          <a className="nav-link" href="./admlistcurso">
            Cursos
          </a>
        </li>
        <li className="nav-item mx-2">
          <a className="nav-link" href="./admlistprof">
            Professores
          </a>
        </li>
        <li className="nav-item mx-2">
          <a className="nav-link active" href="">
            Alunos
          </a>
        </li>
      </ul>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <h3>Alunos</h3>
        <div>
          <button
            className="btn btn-success mx-2"
            onClick={() => setShowModal(true)}
            disabled={alunos.length === 0}
          >
            Emitir Certificados
          </button>
          <button
            className="btn btn-info"
            onClick={() => navigate("/admaddaluno")}
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="mt-3">
        <input
          type="text"
          className="form-control"
          placeholder="Filtrar alunos por nome"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <ul className="list-group mt-3">
        {alunosFiltrados.map((aluno) => (
          <li
            key={aluno.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span
              className="text-primary"
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate(`/adminfaluno/${aluno.aluno.id}`)}
            >
              {aluno.nome}
            </span>
            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-primary btn-sm mx-2"
                onClick={() => navigate(`/admeditaluno/${aluno.aluno.id}`)}
              >
                <i className="fas fa-pencil"></i> Editar
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => removerAluno(aluno.id)}
              >
                <i className="fas fa-trash"></i> Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal para envio de certificados */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedAlunos([]);
          setFiltroModal("");
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Emitir Certificados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Assunto do Email</Form.Label>
              <Form.Control
                type="text"
                value={certificadoData.assunto}
                onChange={(e) =>
                  setCertificadoData({
                    ...certificadoData,
                    assunto: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mensagem do Email</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={certificadoData.mensagem}
                onChange={(e) =>
                  setCertificadoData({
                    ...certificadoData,
                    mensagem: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Selecionar Alunos</Form.Label>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Filtrar alunos por nome"
                value={filtroModal}
                onChange={(e) => setFiltroModal(e.target.value)}
              />
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  padding: "10px",
                }}
              >
                {alunosFiltradosModal.length === 0 ? (
                  <p>Nenhum aluno encontrado</p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {alunosFiltradosModal.map((aluno) => (
                      <li key={aluno.id} className="mb-2">
                        <Form.Check
                          type="checkbox"
                          id={`aluno-${aluno.id}`}
                          label={`${aluno.nome} (${aluno.email})`}
                          checked={selectedAlunos.includes(aluno.id)}
                          onChange={() => handleSelectAluno(aluno.id)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setSelectedAlunos([]);
              setFiltroModal("");
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={enviarCertificados}
            disabled={selectedAlunos.length === 0}
          >
            Enviar Certificados
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdmListAluno;
