import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./components/Navbar";
import Home from "./pages/utilizador/Home";
import About from "./pages/utilizador/About";
import FAQ from "./pages/utilizador/FAQ";
import Contact from "./pages/utilizador/Contact";
import Login from "./pages/utilizador/Login";
import Register from "./pages/utilizador/Register";
import ListaCurso from "./pages/aluno/ListaCurso";
import Aula from "./pages/aluno/aula";
import Avaliacao from "./pages/aluno/avaliacao";
import ResponderAvaliacao from "./pages/aluno/ResponderAvaliacao";
import LecionaLista from "./pages/professor/lecionalista";
import LecionaAula from "./pages/professor/lecionaaula";
import LecionaAvaliacao from "./pages/professor/lecionaavaliacao";
import AdmListCurso from "./pages/administrador/admlistcurso";
import AdmAddCurso from "./pages/administrador/admaddcurso";
import AdmInfCurso from "./pages/administrador/adminfcurso";
import AdmListProf from "./pages/administrador/admlistprof";
import AdmAddProf from "./pages/administrador/admaddprof";
import AdmInfProf from "./pages/administrador/adminfprof";
import AdmListAluno from "./pages/administrador/admlistaluno";
import AdmAddAluno from "./pages/administrador/admaddaluno";
import AdmInfAluno from "./pages/administrador/adminfaluno";
import AdmEditCurso from "./pages/administrador/admeditcurso";
import AdmEditProf from "./pages/administrador/admeditprof";
import AdmEditAluno from "./pages/administrador/admeditaluno";
import ForgotPassword from "./pages/utilizador/ForgotPassword";
import ResetPassword from "./pages/utilizador/ResetPassword";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Rotas de Aluno */}
          <Route
            path="/listacurso/:id"
            element={
              <ProtectedRoute allowedRoles={["Aluno"]}>
                <ListaCurso />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aula/:id"
            element={
              <ProtectedRoute allowedRoles={["Aluno"]}>
                <Aula />
              </ProtectedRoute>
            }
          />
          <Route
            path="/avaliacao/:id"
            element={
              <ProtectedRoute allowedRoles={["Aluno"]}>
                <Avaliacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/responderavaliacao/:id"
            element={
              <ProtectedRoute allowedRoles={["Aluno"]}>
                <ResponderAvaliacao />
              </ProtectedRoute>
            }
          />

          {/* Rotas de Professor */}
          <Route
            path="/lecionalista/:id"
            element={
              <ProtectedRoute allowedRoles={["Professor"]}>
                <LecionaLista />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecionaaula/:id"
            element={
              <ProtectedRoute allowedRoles={["Professor"]}>
                <LecionaAula />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecionaavaliacao/:id"
            element={
              <ProtectedRoute allowedRoles={["Professor"]}>
                <LecionaAvaliacao />
              </ProtectedRoute>
            }
          />

          {/* Rotas de Administrador */}
          <Route
            path="/admlistcurso"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <AdmListCurso />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admaddcurso"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <AdmAddCurso />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminfcurso/:id"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <AdmInfCurso />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admlistprof"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <AdmListProf />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admaddprof"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <AdmAddProf />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminfprof/:id"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <AdmInfProf />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admlistaluno"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <AdmListAluno />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admaddaluno"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <AdmAddAluno />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminfaluno/:id"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <AdmInfAluno />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admeditcurso/:id"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <AdmEditCurso />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admeditprof/:id"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <AdmEditProf />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admeditaluno/:id"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <AdmEditAluno />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
