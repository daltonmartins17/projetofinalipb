import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../img/logotipo-educaweb.webp";
import { useNavigate, Link } from "react-router-dom";
import { Dropdown, Nav } from "react-bootstrap";
import { useAuth } from "./auth/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const firstLetter = user?.nome?.[0]?.toUpperCase() || "";

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMinhaAreaClick = () => {
    if (!user) return;

    switch (user.tipo) {
      case "Aluno":
        navigate(`/listacurso/${user.alunoId}`);
        break;
      case "Professor":
        navigate(`/lecionalista/${user.professorId}`);
        break;
      case "Administrador":
        navigate("/admlistcurso");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
      <div className="container-fluid">
        <div
          className="d-flex align-items-center"
          style={{ cursor: "pointer" }}
          onClick={handleLogoClick}
        >
          <img
            src={logo}
            alt="EducaWeb"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
          />
          <span className="navbar-brand mb-0 h1">EducaWeb</span>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <Nav className="me-auto">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/about" className="nav-link">
              About
            </Link>
            <Link to="/faq" className="nav-link">
              FAQ
            </Link>
            <Link to="/contact" className="nav-link">
              Contacto
            </Link>
          </Nav>

          <div className="d-flex align-items-center">
            {user ? (
              <>
                <Dropdown show={showDropdown} onToggle={setShowDropdown}>
                  <Dropdown.Toggle
                    variant="light"
                    id="dropdown-user"
                    className="rounded-circle p-0 border-0"
                    style={{
                      width: "35px",
                      height: "35px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    {firstLetter}
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end">
                    <Dropdown.Item disabled>Olá, {user.nome}</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleMinhaAreaClick}>
                      Minha Área
                    </Dropdown.Item>
                    {user.tipo === "Administrador" && (
                      <>
                        <Dropdown.Divider />
                      </>
                    )}
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <div className="d-flex">
                <Link to="/login" className="btn btn-outline-primary me-2">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Registar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;