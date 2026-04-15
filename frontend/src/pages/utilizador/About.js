import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const About = () => {
  return (
    <div
      className="container-fluid"
      style={{
        backgroundColor: "#F8F9FA",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1>Sobre a EducaWeb</h1>
      <p className="mt-3">
        A EducaWeb é uma plataforma inovadora de ensino à distância que busca
        oferecer conteúdos de qualidade para estudantes de diversas áreas. Nosso
        objetivo é tornar o aprendizado acessível, interativo e eficiente.
      </p>
      <h2 className="mt-4">Nossa Missão</h2>
      <p>
        Facilitar o acesso ao conhecimento, permitindo que qualquer pessoa
        aprenda de forma prática e dinâmica.
      </p>
      <h2 className="mt-4">Nossos Valores</h2>
      <ul>
        <li>Educação de qualidade</li>
        <li>Inovação no ensino</li>
        <li>Inclusão e acessibilidade</li>
        <li>Aprendizado contínuo</li>
      </ul>
    </div>
  );
};

export default About;
