# Sistema de Gerenciamento de Treinos

Um sistema para personal trainers gerenciarem os treinos de seus alunos e para alunos acompanharem seus treinos.

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Frontend**: React.js, Material-UI
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: JWT

## Pré-requisitos

- Node.js (v14 ou superior)
- NPM ou Yarn
- Conta no Supabase (https://supabase.com)

## Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL do seu projeto e a chave anônima (Supabase Settings > API)
4. Execute o script SQL de configuração disponível em `scripts/setup-supabase.sql` no Editor SQL do Supabase

## Configuração do Projeto

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/sistema-de-treinos.git
   cd sistema-de-treinos
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` e adicione:
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   JWT_SECRET=sua_chave_secreta_jwt
   PORT=5000
   ```

4. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```

## Estrutura do Projeto

```
├── api/                 # Backend (API Serverless)
│   ├── config/         # Configurações
│   ├── middleware/     # Middlewares
│   ├── models/         # Modelos
│   ├── routes/         # Rotas da API
│   ├── server.js       # Ponto de entrada da API
│   └── package.json    # Dependências do backend
├── frontend/           # Frontend React
└── vercel.json         # Configuração do Vercel
```

## Configuração para Deploy

### 1. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no painel do Vercel:

```
NODE_ENV=production
JWT_SECRET=sua_chave_secreta_aqui
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 2. Deploy no Vercel

1. Instale o Vercel CLI:
```bash
npm install -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Execute o deploy:
```bash
vercel
```

### 3. Configuração do Frontend

Após o deploy, atualize a URL da API no arquivo `frontend/src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'https://seu-projeto.vercel.app/api'
});
```

## Desenvolvimento Local

### Backend

```bash
cd api
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Autenticação
- `POST /api/auth/registro` - Registrar um novo usuário
- `POST /api/auth/login` - Login de usuário

### Treinos
- `GET /api/treinos/personal` - Listar treinos do personal
- `GET /api/treinos/aluno/:id` - Listar treinos de um aluno
- `POST /api/treinos` - Criar novo treino
- `GET /api/treinos/:id` - Obter treino específico
- `PUT /api/treinos/:id` - Atualizar treino
- `DELETE /api/treinos/:id` - Excluir treino
- `PATCH /api/treinos/:treinoId/exercicios/:exercicioId/concluir` - Marcar exercício como concluído
- `POST /api/treinos/:id/resetar-conclusao` - Resetar conclusão dos exercícios

### Usuários
- `GET /api/usuarios/alunos` - Listar alunos do personal
- `GET /api/usuarios/aluno/:id` - Obter informações de um aluno específico
- `DELETE /api/usuarios/alunos/:id` - Desvincular um aluno

## Deploy

### Vercel (Frontend)
1. Crie uma conta na [Vercel](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   - `REACT_APP_API_URL=sua_url_do_backend`

### Supabase (Backend + Banco de Dados)
1. O Supabase já hospeda seu banco de dados
2. Para o backend, considere:
   - [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
   - [Railway](https://railway.app/)
   - [Render](https://render.com/)

## Desenvolvido por

Bruno Butzke 