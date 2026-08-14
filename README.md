# Desafio Fullstack - Mini Kanban de Tarefas

Mini Kanban desenvolvido para o desafio técnico da Veritas Consultoria Empresarial.

A aplicação foi desenvolvida utilizando React no frontend e Go no backend. O sistema permite criar, editar, mover e excluir tarefas através de uma API REST.

## Tecnologias utilizadas

### Frontend

- React
- TypeScript
- Vite
- CSS
- Fetch API

### Backend


- Go
- net/http
- API REST
- Armazenamento em memória

## Estrutura do projeto

```text
desafio-fullstack-veritas/
├── backend/
│   ├── main.go
│   ├── handlers.go
│   └── models.go
│
├── frontend/
│   ├── package.json
│   └── src/
│
├── docs/
│   └── user-flow.png
│
└── README.md

## Funcionalidades

- Criar tarefas
- Editar tarefas
- Mover tarefas entre as colunas
- Excluir tarefas
- Título obrigatório
- Descrição opcional
- Três colunas fixas:
  - A Fazer
  - Em Progresso
  - Concluídas
- Feedback de carregamento
- Feedback de erros
- Comunicação com a API REST em Go

## API

O backend possui os seguintes endpoints:

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/tasks` | Lista todas as tarefas |
| POST | `/tasks` | Cria uma nova tarefa |
| PUT | `/tasks/{id}` | Atualiza uma tarefa |
| DELETE | `/tasks/{id}` | Exclui uma tarefa |

### Status das tarefas

Os status aceitos pela API são:

- `todo`
- `in_progress`
- `done`

O backend valida o título e o status antes de realizar as operações.

## Como executar

### Backend

Abra um terminal na pasta `backend`:

```bash
cd backend
```

Execute:

```bash
go run .
```

A API será iniciada em:

```text
http://localhost:8080
```

### Frontend

Abra outro terminal na pasta `frontend`:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Depois execute:

```bash
npm run dev
```

O Vite informará no terminal o endereço para acessar a aplicação, normalmente:

```text
http://localhost:5173
```

## Decisões técnicas

O backend utiliza o pacote padrão `net/http` do Go para manter a API simples e sem dependências desnecessárias.

As tarefas são armazenadas em memória utilizando structs e uma coleção de tarefas, conforme permitido pelo escopo do desafio.

No frontend foi utilizado React com TypeScript. A comunicação com o backend é realizada através da Fetch API.

A interface foi mantida simples, priorizando a visualização das tarefas e as operações principais do Kanban.

## Limitações conhecidas

Os dados são armazenados apenas em memória. Por isso, as tarefas são perdidas quando o backend é encerrado.

O projeto não possui autenticação ou banco de dados, pois essas funcionalidades não fazem parte do escopo mínimo do desafio.

## Melhorias futuras

- Persistência dos dados em arquivo JSON ou banco de dados
- Implementação de Drag and Drop
- Testes automatizados
- Autenticação de usuários
- Docker
- Melhorias de acessibilidade

## User Flow

O fluxo principal de utilização do sistema está disponível em:

`docs/user-flow.png`