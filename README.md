# 🎓 Sistema RAG Multi-Agente - Atomize

Sistema de **Retrieval-Augmented Generation (RAG)** com múltiplos agentes especializados para apoio pedagógico aos alunos da rede pública.

## 📋 Visão Geral

Este projeto implementa uma **POC (Proof of Concept)** de um sistema RAG multi-agente para a plataforma Atomize, utilizando:

- **Embeddings semânticos** (OpenAI `text-embedding-3-small`)
- **Vector store** (PostgreSQL + pgvector)
- **LLM de geração** (Anthropic Claude Sonnet 3.5)
- **Múltiplos agentes especializados** com personas e conhecimentos distintos

### 🤖 Agentes Disponíveis

1. **Professor Pitágoras** 📐
   - Especialidade: Matemática (Ensino Fundamental II)
   - Foco: Álgebra, Geometria, SAEB, Olimpíadas
   - Tom: Didático, paciente, passo-a-passo

2. **Dra. Clarice Lispector** ✍️
   - Especialidade: Língua Portuguesa
   - Foco: Interpretação, Redação, Gramática
   - Tom: Acolhedor, reflexivo, inspirador

## 🏗️ Arquitetura RAG

```
┌─────────────────┐
│  Usuário Aluno  │
└────────┬────────┘
         │ Pergunta
         ▼
┌─────────────────────────────────┐
│   Frontend (Next.js)            │
│   - Seleção de agente           │
│   - Interface de chat           │
└────────┬────────────────────────┘
         │ POST /api/agents/query
         ▼
┌─────────────────────────────────┐
│   API Route (Next.js)           │
│   1. Validação                  │
│   2. Orquestração RAG           │
│   3. Logging                    │
└────────┬────────────────────────┘
         │
         ├──► 📊 RETRIEVAL
         │    ┌──────────────────────┐
         │    │  Embedding Service   │
         │    │  (OpenAI)            │
         │    └──────┬───────────────┘
         │           │ Vector (1536d)
         │           ▼
         │    ┌──────────────────────┐
         │    │  PostgreSQL+pgvector │
         │    │  Busca top-k docs    │
         │    │  (similaridade)      │
         │    └──────┬───────────────┘
         │           │ Documentos
         │           ▼
         ├──► 🤖 GENERATION
         │    ┌──────────────────────┐
         │    │  Prompt Builder      │
         │    │  - System prompt     │
         │    │  - Contexto RAG      │
         │    │  - Pergunta          │
         │    └──────┬───────────────┘
         │           │
         │           ▼
         │    ┌──────────────────────┐
         │    │  Claude Sonnet 3.5   │
         │    │  Geração condicional │
         │    └──────┬───────────────┘
         │           │ Resposta
         │           ▼
         └──► 📝 LOGGING
              ┌──────────────────────┐
              │  Query Logs (DB)     │
              │  - Pergunta          │
              │  - Resposta          │
              │  - Docs recuperados  │
              │  - Métricas          │
              └──────────────────────┘
```

## 🚀 Configuração Inicial

### 1. Pré-requisitos

- **Node.js** >= 18
- **PostgreSQL** >= 14 (com extensão pgvector)
- **Chaves de API**:
  - Anthropic API (Claude)
  - OpenAI API (embeddings)

### 2. Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves
```

### 3. Configurar Banco de Dados

```bash
# Instalar extensão pgvector no PostgreSQL
psql -d atomize_rag -c "CREATE EXTENSION vector;"

# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate
```

### 4. Ingestão de Documentos

```bash
# Processar e ingerir documentos de exemplo
npm run ingest

# Isso irá:
# 1. Carregar materiais de exemplo
# 2. Dividir em chunks
# 3. Gerar embeddings
# 4. Armazenar no PostgreSQL
```

## 🧪 Testando o Sistema

### Teste via Script

```bash
# Teste end-to-end do fluxo RAG
npm run test:query
```

### Teste via API

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Em outro terminal, fazer request
curl -X POST http://localhost:3000/api/agents/query \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "professor_pitagoras",
    "message": "Como resolver equações do primeiro grau?",
    "userId": "demo-user"
  }'
```

### Teste via Interface Web

```bash
npm run dev
# Acesse: http://localhost:3000
```

## 📁 Estrutura do Projeto

```
RAG-POC/
├── prisma/
│   ├── schema.prisma              # Schema do banco com pgvector
│   └── migrations/                # Migrations SQL
│
├── src/
│   ├── agents/
│   │   └── config/                # Configurações dos agentes
│   │       ├── professorPitagoras.ts
│   │       ├── draClariceLispector.ts
│   │       └── index.ts
│   │
│   ├── rag/
│   │   ├── embeddings/
│   │   │   └── embeddings.ts      # Geração de embeddings (OpenAI)
│   │   │
│   │   ├── ingest/
│   │   │   ├── chunker.ts         # Divisão de textos em chunks
│   │   │   └── ingest.ts          # Script de ingestão
│   │   │
│   │   ├── retriever/
│   │   │   └── retriever.ts       # Busca vetorial (pgvector)
│   │   │
│   │   ├── generator/
│   │   │   └── generator.ts       # Geração com Claude
│   │   │
│   │   └── logger/
│   │       └── logger.ts          # Logging de queries
│   │
│   ├── pages/
│   │   ├── api/
│   │   │   └── agents/
│   │   │       ├── query.ts       # Endpoint RAG principal
│   │   │       └── index.ts       # Listar agentes
│   │   ├── index.tsx              # Interface frontend
│   │   └── _app.tsx
│   │
│   ├── styles/                    # Estilos CSS
│   └── types/
│       └── rag.types.ts           # Tipos TypeScript
│
├── scripts/
│   └── testQuery.ts               # Script de teste
│
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL="postgresql://user:password@localhost:5432/atomize_rag?schema=public"

# APIs
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# Configurações RAG
EMBEDDING_MODEL="text-embedding-3-small"
CLAUDE_MODEL="claude-sonnet-3-5-20241022"
TOP_K_DOCUMENTS=5
CHUNK_SIZE=800
CHUNK_OVERLAP=200
```

## 📊 Fluxo de Dados RAG

### 1. **Ingestão (Offline)**

```
Documentos → Chunking → Embeddings → PostgreSQL (pgvector)
```

- Materiais didáticos são divididos em chunks de ~800 caracteres
- Cada chunk é convertido em vetor de embedding (1536 dimensões)
- Armazenados com metadata (tópico, dificuldade, fonte, etc.)

### 2. **Query (Online)**

```
Pergunta → Embedding → Busca Vetorial → Documentos Relevantes
           ↓
Prompt (System + Context + Query) → Claude → Resposta
```

- Pergunta do aluno é convertida em embedding
- Busca por similaridade de cosseno retorna top-k documentos
- Contexto + instruções do agente são enviados ao Claude
- Resposta é gerada condicionada ao contexto recuperado

## 🎯 Por que isso é RAG de Verdade?

Este sistema **NÃO é apenas um prompt elaborado**. É RAG porque:

1. ✅ **Embeddings Semânticos**: Vetores de 1536 dimensões via OpenAI
2. ✅ **Vector Store**: PostgreSQL + pgvector para busca eficiente
3. ✅ **Retrieval**: Busca por similaridade de cosseno (top-k)
4. ✅ **Augmentation**: Prompt é aumentado com contexto recuperado
5. ✅ **Generation**: Claude gera resposta condicionada ao contexto
6. ✅ **Evidência Auditável**: Logs mostram documentos recuperados e scores

### Comprovação Técnica

```sql
-- Verificar documentos com embeddings
SELECT agent_id, COUNT(*) 
FROM agent_documents 
WHERE embedding IS NOT NULL 
GROUP BY agent_id;

-- Verificar logs de queries com retrieval
SELECT 
  agent_id,
  question,
  jsonb_array_length(retrieved_doc_ids) as num_docs_retrieved,
  retrieval_scores
FROM query_logs
ORDER BY created_at DESC
LIMIT 5;
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                    # Servidor Next.js
npm run build                  # Build de produção
npm run start                  # Servidor de produção

# Banco de dados
npm run prisma:generate        # Gerar Prisma Client
npm run prisma:migrate         # Executar migrations
npm run prisma:studio          # Interface visual do banco

# Ingestão e testes
npm run ingest                 # Ingerir documentos
npm run test:query             # Testar query RAG
```

## 📈 Métricas e Auditoria

Todas as queries são registradas com:

- **Pergunta** e **resposta** completas
- **IDs dos documentos** recuperados
- **Scores de similaridade** (prova do retrieval)
- **Tempo de resposta** (ms)
- **Tokens utilizados**
- **Modelo usado** (Claude Haiku 4.5)

Acesse os logs:

```bash
npm run prisma:studio
# Navegar para tabela query_logs
```

## 🔌 Integração com Outras Plataformas

### Como consumir a API:

```bash
POST /api/agents/query
Content-Type: application/json

{
  "agentId": "professor_pitagoras",
  "message": "O que é uma função quadrática?",
  "userId": "user123",
  "maxDocuments": 5
}
```

### SDKs Disponíveis:

- **TypeScript/JavaScript**: `sdk/atomize-rag-client.ts`
- **Python, PHP, Ruby**: Ver `API_INTEGRATION_GUIDE.md`
- **Demo HTML**: `demo/index.html`

**📚 Documentação completa:** [COMO_CONSUMIR_API.md](./COMO_CONSUMIR_API.md)

### Exemplos rápidos:

```typescript
// TypeScript/JavaScript
import AtomizeRAGClient from './sdk/atomize-rag-client';

const client = new AtomizeRAGClient('http://localhost:3000');
const resposta = await client.askPitagoras('O que é uma função quadrática?');
console.log(resposta.answer);
```

```python
# Python
import requests

response = requests.post('http://localhost:3000/api/agents/query', json={
    'agentId': 'professor_pitagoras',
    'message': 'O que é uma função quadrática?'
})
print(response.json()['answer'])
```

## 🚀 Próximos Passos

Para evolução da POC:

1. **Mais Agentes**:
   - Profª. Marie Curie (Ciências)
   - Prof. Heródoto (História)
   - Prof. Darwin (Biologia)

2. **Ingestão Real**:
   - Integração com banco de questões Atomize
   - Upload de PDFs e materiais
   - Integração com S3

3. **Melhorias RAG**:
   - Reranking dos documentos
   - Busca híbrida (vetorial + keyword)
   - Fine-tuning de embeddings

4. **Produção**:
   - Deploy serverless (Vercel + Neon)
   - Autenticação de usuários (API Keys)
   - Rate limiting (10 req/min)
   - Cache de embeddings

## � Documentação Adicional

- [Como Consumir a API](./COMO_CONSUMIR_API.md)
- [Guia de Integração](./API_INTEGRATION_GUIDE.md)
- [SDK TypeScript](./sdk/README.md)
- [Exemplos de Código](./sdk/examples.ts)
- [Demo Interativa](./demo/index.html)

## �📝 Licença

Propriedade da **Atomize Edtech**.

---

**Sistema RAG completo com busca vetorial semântica e Claude Haiku 4.5** 🚀  
**✅ 72 documentos ingidos | ✅ PostgreSQL + pgvector (Neon) | ✅ API pronta para integração**
