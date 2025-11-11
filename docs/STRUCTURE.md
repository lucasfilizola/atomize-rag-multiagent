# 📂 Estrutura do Projeto - Visão Completa

```
RAG-POC/
│
├── 📄 package.json                 # Dependências e scripts
├── 📄 tsconfig.json                # Configuração TypeScript
├── 📄 next.config.js               # Configuração Next.js
├── 📄 .env.example                 # Template de variáveis de ambiente
├── 📄 .gitignore                   # Arquivos ignorados pelo Git
│
├── 📖 README.md                    # Documentação principal
├── 📖 QUICKSTART.md                # Guia de início rápido
│
├── 📁 docs/                        # Documentação técnica
│   ├── ARCHITECTURE.md             # Arquitetura RAG detalhada
│   ├── API.md                      # Referência da API
│   ├── DEPLOY.md                   # Guia de deploy
│   └── ADDING_CONTENT.md           # Como adicionar conteúdo
│
├── 📁 prisma/                      # ORM e banco de dados
│   ├── schema.prisma               # Schema com pgvector
│   └── migrations/                 # Migrations SQL
│       └── 001_init/
│           └── migration.sql       # Criação de tabelas + índices
│
├── 📁 src/                         # Código-fonte principal
│   │
│   ├── 📁 agents/                  # Configuração dos agentes
│   │   └── config/
│   │       ├── professorPitagoras.ts       # Agente Matemática
│   │       ├── draClariceLispector.ts      # Agente Português
│   │       └── index.ts                    # Registro de agentes
│   │
│   ├── 📁 rag/                     # Sistema RAG
│   │   │
│   │   ├── 📁 embeddings/          # Geração de embeddings
│   │   │   └── embeddings.ts       # OpenAI text-embedding-3-small
│   │   │
│   │   ├── 📁 ingest/              # Ingestão de documentos
│   │   │   ├── chunker.ts          # Divisão em chunks
│   │   │   └── ingest.ts           # Script de ingestão
│   │   │
│   │   ├── 📁 retriever/           # Busca vetorial
│   │   │   └── retriever.ts        # Query pgvector
│   │   │
│   │   ├── 📁 generator/           # Geração de respostas
│   │   │   └── generator.ts        # Claude Sonnet 3.5
│   │   │
│   │   └── 📁 logger/              # Sistema de logs
│   │       └── logger.ts           # Auditoria de queries
│   │
│   ├── 📁 pages/                   # Rotas Next.js
│   │   ├── _app.tsx                # App wrapper
│   │   ├── index.tsx               # Página principal (interface)
│   │   │
│   │   └── 📁 api/                 # API Routes
│   │       └── agents/
│   │           ├── index.ts        # GET /api/agents
│   │           └── query.ts        # POST /api/agents/query
│   │
│   ├── 📁 styles/                  # Estilos CSS
│   │   ├── globals.css             # Estilos globais
│   │   └── Agents.module.css       # Estilos da interface
│   │
│   └── 📁 types/                   # TypeScript types
│       └── rag.types.ts            # Interfaces e tipos
│
└── 📁 scripts/                     # Scripts utilitários
    └── testQuery.ts                # Teste end-to-end

```

## 🔑 Arquivos Chave

### Configuração

| Arquivo | Descrição |
|---------|-----------|
| `package.json` | Dependências: Next.js, Prisma, Anthropic, OpenAI, Zod |
| `tsconfig.json` | TypeScript strict mode, paths aliases |
| `.env` | API keys, DATABASE_URL, configurações RAG |
| `prisma/schema.prisma` | Schema com pgvector extension |

### Agentes

| Arquivo | Agente | Especialidade |
|---------|--------|---------------|
| `professorPitagoras.ts` | Prof. Pitágoras 📐 | Matemática, Álgebra, Geometria |
| `draClariceLispector.ts` | Dra. Clarice ✍️ | Português, Redação, Interpretação |

### Pipeline RAG

| Componente | Arquivo | Responsabilidade |
|------------|---------|------------------|
| **Embeddings** | `embeddings.ts` | Gerar vetores 1536d via OpenAI |
| **Chunking** | `chunker.ts` | Dividir docs em chunks ~800 chars |
| **Ingestão** | `ingest.ts` | Pipeline: docs → chunks → embeddings → DB |
| **Retrieval** | `retriever.ts` | Busca vetorial (pgvector + cosseno) |
| **Generation** | `generator.ts` | Prompt + Claude → resposta |
| **Logging** | `logger.ts` | Audit logs com retrieval scores |

### API

| Endpoint | Método | Arquivo |
|----------|--------|---------|
| `/api/agents` | GET | `pages/api/agents/index.ts` |
| `/api/agents/query` | POST | `pages/api/agents/query.ts` |

### Frontend

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| **Interface** | `pages/index.tsx` | Chat UI com seleção de agentes |
| **Estilos** | `Agents.module.css` | CSS modular responsivo |

## 🗄️ Banco de Dados

### Tabelas

```sql
agent_documents
├── id (uuid)
├── agent_id (string)           -- Isolamento por agente
├── content (text)              -- Chunk de texto
├── metadata (jsonb)            -- Tópico, dificuldade, fonte
├── embedding (vector(1536))   -- Vetor pgvector
├── created_at
└── updated_at

query_logs
├── id (uuid)
├── agent_id
├── user_id
├── question (text)
├── answer (text)
├── retrieved_doc_ids (jsonb)   -- Prova do retrieval
├── retrieval_scores (jsonb)    -- Similaridades
├── response_time_ms
├── tokens_used
└── created_at
```

### Índices

- **IVFFlat** em `embedding` → Busca vetorial eficiente
- **B-tree** em `agent_id` → Filtro rápido por agente
- **B-tree** em `created_at` → Queries temporais

## 🚀 Fluxo de Dados

### Ingestão (Offline)

```
Documentos
    ↓
chunker.ts (divide em chunks)
    ↓
embeddings.ts (gera vetores)
    ↓
PostgreSQL + pgvector (armazena)
```

### Query (Online)

```
Pergunta do aluno
    ↓
embeddings.ts (vetor da query)
    ↓
retriever.ts (busca top-k docs)
    ↓
generator.ts (prompt + Claude)
    ↓
Resposta contextualizada
    ↓
logger.ts (audit log)
```

## 📊 Métricas Importantes

### Performance

- **Embedding**: ~200ms
- **Retrieval**: ~50ms (pgvector IVFFlat)
- **Generation**: ~2-4s (Claude)
- **Total**: ~2.5-4.5s

### Storage

- **Embedding**: 1536 floats × 4 bytes = 6KB por chunk
- **1000 chunks**: ~6MB de vetores
- **10.000 chunks**: ~60MB de vetores

### Custos (estimativa)

- **OpenAI Embeddings**: $0.0001 / 1K tokens
- **Claude Sonnet 3.5**: $0.003 / 1K input, $0.015 / 1K output
- **PostgreSQL RDS**: ~$50-200/mês (t3.medium - m5.large)

## 🔒 Segurança

### Validação

- ✅ **Zod schemas** para input validation
- ✅ **Prisma** protege contra SQL injection
- ✅ **Rate limiting** (recomendado em produção)
- ✅ **CORS** configurado
- ✅ **Sanitização** de agentId

### Secrets

- ❌ Nunca commitar `.env`
- ✅ Usar AWS Secrets Manager / Vault em produção
- ✅ Rotação de API keys

## 📈 Escalabilidade

### Vertical

- ✅ Aumentar RAM do PostgreSQL
- ✅ Mais listas no índice IVFFlat
- ✅ Cache (Redis) para embeddings

### Horizontal

- ✅ Read replicas do PostgreSQL
- ✅ Múltiplas Lambdas (serverless)
- ✅ CDN para frontend (Vercel/CloudFront)

## 🧪 Testing

### Testes Disponíveis

```bash
npm run test:query         # End-to-end RAG flow
npm run prisma:studio      # Visual DB inspection
npm run dev                # Manual UI testing
```

### Áreas de Teste

- ✅ Geração de embeddings
- ✅ Busca vetorial (similaridade)
- ✅ Prompt engineering (qualidade de resposta)
- ✅ Isolamento entre agentes
- ✅ Logging e auditoria

## 📚 Documentação

| Documento | Foco |
|-----------|------|
| `README.md` | Overview + quickstart |
| `QUICKSTART.md` | Setup em 5 minutos |
| `docs/ARCHITECTURE.md` | Detalhes técnicos RAG |
| `docs/API.md` | Referência de endpoints |
| `docs/DEPLOY.md` | Deploy produção (AWS/Vercel) |
| `docs/ADDING_CONTENT.md` | Adicionar docs/agentes |

---

## 🎯 Pontos de Extensão

### Adicionar Agente

1. Criar config em `src/agents/config/`
2. Registrar em `index.ts`
3. Adicionar documentos
4. Executar ingestão

### Adicionar Fonte de Dados

1. Implementar loader em `src/rag/ingest/`
2. Chamar de `ingest.ts`
3. Mapear para `DocumentChunk[]`

### Customizar Retrieval

1. Editar `retriever.ts`
2. Adicionar filtros por metadata
3. Implementar reranking

### Melhorar Geração

1. Ajustar `systemPrompt` dos agentes
2. Modificar formato do prompt em `generator.ts`
3. Tunar `temperature` e `max_tokens`

---

**Esta estrutura é modular, escalável e pronta para produção!** 🚀

Cada componente tem responsabilidade única e pode ser melhorado independentemente.
