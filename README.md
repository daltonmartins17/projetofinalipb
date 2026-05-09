# 📚 EducaWeb - Sistema de Gestão Educacional

Um sistema web completo para gestão de cursos, alunos, professores e avaliações. Desenvolvido com React no frontend e Node.js/Express no backend, utilizando MySQL como base de dados.

## 📋 Índice

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Modelos de Dados](#modelos-de-dados)
- [Tecnologias](#tecnologias)
- [Autores](#autores)

## ✨ Características

- **Autenticação de Utilizadores**: Sistema de login seguro com JWT e bcrypt
- **Gestão de Cursos**: Criar, editar, eliminar e listar cursos
- **Gestão de Alunos**: Inscrição, edição e acompanhamento de alunos
- **Gestão de Professores**: Registro e gestão de professores
- **Avaliações**: Criação e resposta a avaliações
- **Aulas**: Gestão de aulas e material de suporte
- **Comentários**: Sistema de comentários nas aulas
- **Reset de Password**: Recuperação de password via email
- **Upload de Ficheiros**: Suporte para upload de materiais educacionais
- **Dashboard Administrativo**: Interface completa para administradores
- **Integração com Zoom**: Suporte para videoconferências

## 📦 Requisitos

Antes de começar, certifique-se de que tem instalado:

- **Node.js** (versão 14.0 ou superior)
- **npm** (versão 6.0 ou superior)
- **MySQL** (versão 5.7 ou superior)
- **Git**

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd "Projeto Final"
```

### 2. Instale as Dependências do Backend

```bash
cd backend
npm install
```

### 3. Instale as Dependências do Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente (Backend)

Crie um ficheiro `.env` na pasta `backend` com as seguintes variáveis:

```env
# Configuração do Servidor
PORT=3001
NODE_ENV=development

# Configuração da Base de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=sua_password
DB_NAME=educaweb

# Configuração de Email (Nodemailer)
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app

# JWT Secret
JWT_SECRET=sua_chave_secreta_jwt

# URL do Frontend
FRONTEND_URL=http://localhost:3000

# Configuração do Zoom
ZOOM_CLIENT_ID=seu_zoom_client_id
ZOOM_CLIENT_SECRET=seu_zoom_client_secret
```

### 2. Criar Base de Dados

```bash
# Conecte-se ao MySQL
mysql -u root -p

# Execute os seguintes comandos
CREATE DATABASE educaweb;
USE educaweb;
```

### 3. Executar Migrações

```bash
# Na pasta backend
npx sequelize-cli db:migrate
```

### 4. Seeders (Opcional)

Para popular a base de dados com dados de exemplo:

```bash
npx sequelize-cli db:seed:all
```

## 🎮 Como Executar

### Backend

```bash
cd backend
npm start
```

O servidor backend rodará em `http://localhost:3001`

### Frontend

Em outro terminal:

```bash
cd frontend
npm start
```

A aplicação frontend abrirá em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
Projeto Final/
├── backend/
│   ├── config/
│   │   ├── config.json          # Configuração do Sequelize
│   │   └── database.js          # Conexão com MySQL
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticação
│   │   └── utilizadorController.js  # Lógica de utilizadores
│   ├── models/
│   │   ├── Aluno.js             # Modelo de Aluno
│   │   ├── Professor.js         # Modelo de Professor
│   │   ├── Curso.js             # Modelo de Curso
│   │   ├── Aula.js              # Modelo de Aula
│   │   ├── Avaliacao.js         # Modelo de Avaliação
│   │   ├── Comentario.js        # Modelo de Comentário
│   │   ├── Material.js          # Modelo de Material
│   │   ├── Inscricao.js         # Modelo de Inscrição
│   │   ├── Utilizador.js        # Modelo de Utilizador
│   │   ├── Submissao.js         # Modelo de Submissão
│   │   └── index.js             # Inicialização dos modelos
│   ├── routes/
│   │   ├── utilizadorRoutes.js  # Rotas de utilizadores
│   │   ├── cursoRoutes.js       # Rotas de cursos
│   │   ├── alunoRoutes.js       # Rotas de alunos
│   │   ├── professorRoutes.js   # Rotas de professores
│   │   ├── aulaRoutes.js        # Rotas de aulas
│   │   ├── avaliacaoRoutes.js   # Rotas de avaliações
│   │   ├── comentarioRoutes.js  # Rotas de comentários
│   │   ├── inscricaoRoutes.js   # Rotas de inscrições
│   │   ├── emailRoutes.js       # Rotas de email
│   │   ├── contactRoutes.js     # Rotas de contacto
│   │   └── passwordReset.js     # Rotas de reset de password
│   ├── migrations/              # Migrações do Sequelize
│   ├── seeders/                 # Seeders da base de dados
│   ├── uploads/                 # Pasta para ficheiros uploaded
│   ├── server.js                # Arquivo principal do backend
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html           # HTML raiz
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js        # Navegação principal
│   │   │   ├── InsertForm.js    # Formulário genérico
│   │   │   └── auth/
│   │   │       ├── AuthContext.js    # Context de autenticação
│   │   │       └── ProtectedRoute.js # Rotas protegidas
│   │   ├── pages/
│   │   │   ├── administrador/   # Páginas do administrador
│   │   │   ├── aluno/           # Páginas do aluno
│   │   │   ├── professor/       # Páginas do professor
│   │   │   └── utilizador/      # Páginas públicas
│   │   ├── funcoes/             # Funções auxiliares
│   │   ├── server/
│   │   │   ├── private_api.js   # API privada (autenticada)
│   │   │   └── public_api.js    # API pública
│   │   ├── styles/              # Estilos CSS
│   │   ├── App.js               # Componente principal
│   │   ├── index.js             # Entrada do React
│   │   └── index.css            # Estilos globais
│   └── package.json
├── Documentos/
│   ├── Análise detalhada/       # Análise de requisitos
│   ├── Apresentação Power Point/
│   ├── Caso de uso/
│   ├── ER/                      # Diagramas ER
│   ├── Figma/                   # Protótipos UI/UX
│   ├── img/
│   ├── Poster/
│   ├── Relatório/
│   └── Requisitos/
└── README.md
```

## 🔌 API Endpoints

### Autenticação

- `POST /api/auth/login` - Login de utilizador
- `POST /api/auth/register` - Registrar novo utilizador
- `POST /api/auth/password-reset` - Solicitar reset de password
- `PUT /api/auth/reset-password/:token` - Redefinir password

### Utilizadores

- `GET /api/utilizadores` - Listar todos os utilizadores
- `GET /api/utilizadores/:id` - Obter utilizador por ID
- `PUT /api/utilizadores/:id` - Atualizar utilizador
- `DELETE /api/utilizadores/:id` - Eliminar utilizador

### Cursos

- `GET /api/cursos` - Listar todos os cursos
- `GET /api/cursos/:id` - Obter curso por ID
- `POST /api/cursos` - Criar novo curso
- `PUT /api/cursos/:id` - Atualizar curso
- `DELETE /api/cursos/:id` - Eliminar curso

### Alunos

- `GET /api/alunos` - Listar todos os alunos
- `GET /api/alunos/:id` - Obter aluno por ID
- `POST /api/alunos` - Criar novo aluno
- `PUT /api/alunos/:id` - Atualizar aluno
- `DELETE /api/alunos/:id` - Eliminar aluno

### Professores

- `GET /api/professores` - Listar todos os professores
- `POST /api/professores` - Criar novo professor
- `PUT /api/professores/:id` - Atualizar professor
- `DELETE /api/professores/:id` - Eliminar professor

### Aulas

- `GET /api/aulas` - Listar todas as aulas
- `GET /api/aulas/:id` - Obter aula por ID
- `POST /api/aulas` - Criar nova aula
- `PUT /api/aulas/:id` - Atualizar aula
- `DELETE /api/aulas/:id` - Eliminar aula

### Avaliações

- `GET /api/avaliacoes` - Listar todas as avaliações
- `POST /api/avaliacoes` - Criar nova avaliação
- `POST /api/avaliacoes/:id/responder` - Responder a uma avaliação
- `PUT /api/avaliacoes/:id` - Atualizar avaliação
- `DELETE /api/avaliacoes/:id` - Eliminar avaliação

### Comentários

- `GET /api/comentarios` - Listar comentários
- `POST /api/comentarios` - Criar comentário
- `DELETE /api/comentarios/:id` - Eliminar comentário

### Inscrições

- `POST /api/inscricoes` - Inscrever aluno em curso
- `GET /api/inscricoes/:id` - Obter inscrição
- `DELETE /api/inscricoes/:id` - Cancelar inscrição

### Email

- `POST /api/email/send` - Enviar email
- `POST /api/email/confirmacao` - Enviar email de confirmação

### Contacto

- `POST /api/contacto` - Enviar mensagem de contacto

## 💾 Modelos de Dados

### Utilizador

```javascript
-id(PK) -
  nome -
  email(Único) -
  morada -
  senha(Encrypted) -
  contacto -
  tipo(aluno / professor / admin) -
  resetToken -
  resetTokenExpires -
  isVerified -
  timestamps;
```

### Curso

```javascript
-id(PK) -
  nome -
  descricao -
  professor_id(FK) -
  data_inicio -
  data_fim -
  horario -
  timestamps;
```

### Aluno

```javascript
-id(PK) -
  utilizador_id(FK) -
  numero_aluno(Único) -
  curso_id(FK) -
  data_inscricao -
  timestamps;
```

### Professor

```javascript
-id(PK) -
  utilizador_id(FK) -
  numero_professor(Único) -
  especialidade -
  timestamps;
```

### Aula

```javascript
-id(PK) - curso_id(FK) - titulo - descricao - data - duracao - timestamps;
```

### Avaliacao

```javascript
-id(PK) -
  aula_id(FK) -
  titulo -
  descricao -
  data_criacao -
  data_limite -
  tipo -
  timestamps;
```

### Comentario

```javascript
-id(PK) - aula_id(FK) - utilizador_id(FK) - texto - timestamps;
```

### Inscricao

```javascript
-id(PK) - aluno_id(FK) - curso_id(FK) - data_inscricao - status - timestamps;
```

### Material

```javascript
- id (PK)
- aula_id (FK)
- titulo
- arquivo (Caminho do ficheiro)
- tipo
- timestamps
```

### Submissao

```javascript
- id (PK)
- avaliacao_id (FK)
- aluno_id (FK)
- ficheiro (Caminho do ficheiro)
- data_submissao
- nota
- timestamps
```

### Contacto

```javascript
-id(PK) - nome - email - assunto - mensagem - status - timestamps;
```

## 🛠️ Tecnologias

### Backend

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Sequelize** - ORM para MySQL
- **MySQL2** - Driver MySQL
- **bcrypt** - Encriptação de passwords
- **jsonwebtoken (JWT)** - Autenticação
- **nodemailer** - Envio de emails
- **multer** - Upload de ficheiros
- **pdfkit** - Geração de PDFs
- **axios** - Cliente HTTP
- **cors** - Middleware CORS
- **dotenv** - Variáveis de ambiente

### Frontend

- **React** - Biblioteca JavaScript
- **React Router** - Roteamento
- **React Bootstrap** - Componentes UI
- **Axios** - Cliente HTTP
- **React PDF** - Visualização de PDFs
- **FontAwesome** - Ícones
- **Bootstrap** - Framework CSS
- **Zoom SDK** - Integração com Zoom

## 🔐 Segurança

- Passwords são encriptadas com bcrypt
- Autenticação via JWT
- Proteção CORS
- Reset de password com token expiração
- Validação de email
- Upload seguro de ficheiros

## 📝 Notas Importantes

1. Certifique-se de configurar corretamente as variáveis de ambiente antes de executar
2. A base de dados será criada automaticamente na primeira execução
3. O backend deve estar a correr antes de iniciar o frontend
4. Recomenda-se usar HTTPS em produção
5. Considere usar um serviço de email profissional em produção

## 🐛 Troubleshooting

### Erro de Conexão MySQL

- Verifique se o MySQL está a correr
- Confirme as credenciais no ficheiro `.env`
- Certifique-se de que a base de dados foi criada

### Erro de CORS

- Verifique o `FRONTEND_URL` no `.env`
- Certifique-se de que o frontend está no porto correto

### Erro de Autenticação

- Verifique se o `JWT_SECRET` está configurado
- Confirme se o token está sendo enviado corretamente

## 📄 Licença

Este projeto é desenvolvido para fins educacionais no Instituto Politécnico da Beira Interior (IPB).

## 👥 Autores

Dalton Martins
Rafael Gracias

---
