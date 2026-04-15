import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const FAQ = () => {
  return (
    <div
      className="container-fluid"
      style={{
        backgroundColor: "#F8F9FA",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1>Perguntas Frequentes (FAQ)</h1>
      <div className="mt-4">
        <h4>1. Como me inscrevo nos cursos?</h4>
        <p>
          Depois de já ter feito o Registo, faça Login e assim que entrares no
          site, verás em destaque um botão azul de Nova Inscrição.
        </p>

        <h4>2. Os cursos são gratuitos?</h4>
        <p>Sim os cursos são gratuitos para todos os usuários.</p>

        <h4>3. Como acessar as aulas ao vivo?</h4>
        <p>
          Dentro da plataforma, vá até a aba "Aulas" e clique na opção "Aulas ao
          Vivo".
        </p>

        <h4>4. Como faço para obter um certificado?</h4>
        <p>
          Após concluir um curso e passar na avaliação final, nós enviaremos o
          certificado para o seu email que está registado.
        </p>

        <h4>5. Como sei o horário do curso, quando diz manhã ou tarde?</h4>
        <p>
          Nós apenas lecionamos em dois horários, manhã, das 9-11 e tarde, das
          14-16.
        </p>

        <h4>5. As aulas são todos os dias?</h4>
        <p>
          Sim, mas apenas todos os dias úteis, com excessão dos feríados e finais de semana, compreendidos, na data inicial e final do curso.
        </p>
      </div>
    </div>
  );
};

export default FAQ;
