# 🏗️ Arquitetura RAG Multi-Agente - Documentação Técnica

## Conceitos Fundamentais

### O que é RAG?

**RAG (Retrieval-Augmented Generation)** é uma técnica que combina:

1. **Retrieval**: Busca de informações relevantes em uma base de conhecimento
2. **Augmentation**: Enriquecimento do prompt com o contexto recuperado
3. **Generation**: Geração de resposta condicionada ao contexto

### Por que RAG ao invés de prompt simples?

| Aspecto | Prompt Simples | RAG |
|---------|----------------|-----|
| Base de conhecimento | Limitada ao training data do modelo | Atualizada com documentos próprios |
| Precisão | Pode "alucinar" informações | Respostas baseadas em fontes reais |
| Auditoria | Difícil rastrear origem | Logs mostram documentos usados |
| Escalabilidade | Não escala com novos conteúdos | Basta adicionar novos documentos |
| Contextualização | Genérica | Específica da organização |

## Componentes do Sistema

### 1. Embeddings Layer

**Arquivo**: `src/rag/embeddings/embeddings.ts`

**Responsabilidade**: Converter texto em vetores semânticos

```typescript
generateEmbedding(text: string) -> number[] (1536 dimensões)
```

**Como funciona**:
- Usa modelo `text-embedding-3-small` da OpenAI
- Cada palavra/conceito é mapeado em um espaço vetorial de alta dimensão
- Textos semanticamente similares têm vetores próximos

**Exemplo**:
```
"Como resolver equações?" → [0.023, -0.451, 0.782, ..., 0.234]
"Solução de equações"     → [0.019, -0.449, 0.779, ..., 0.231]
                              ↑ Vetores próximos = alta similaridade
```

### 2. Chunking Layer

**Arquivo**: `src/rag/ingest/chunker.ts`

**Responsabilidade**: Dividir documentos longos em pedaços processáveis

**Por que chunking?**
- Modelos têm limite de contexto
- Chunks menores = busca mais precisa
- Permite recuperar apenas partes relevantes

**Estratégia**:
- Tamanho: ~800 caracteres (configurável)
- Overlap: 200 caracteres (evita perda de contexto)
- Quebra em pontuação natural (frases completas)

```
Documento de 3000 caracteres
↓
Chunk 1: [0-800]
Chunk 2: [600-1400]  ← overlap de 200
Chunk 3: [1200-2000]
Chunk 4: [1800-2600]
Chunk 5: [2400-3000]
```

### 3. Vector Store (pgvector)

**Arquivo**: `prisma/schema.prisma`

**Responsabilidade**: Armazenar e buscar embeddings eficientemente

**Schema**:
```prisma
model AgentDocument {
  id        String
  agentId   String
  content   String
  metadata  Json
  embedding vector(1536)  ← Tipo especial pgvector
}
```

**Índice IVFFlat**:
```sql
CREATE INDEX agent_documents_embedding_idx 
ON agent_documents 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

**Como funciona a busca**:
```sql
-- Buscar top-5 documentos mais similares
SELECT *, 
  1 - (embedding <=> '[query_vector]'::vector) as similarity
FROM agent_documents
WHERE agent_id = 'professor_pitagoras'
ORDER BY embedding <=> '[query_vector]'::vector
LIMIT 5;
```

### 4. Retriever

**Arquivo**: `src/rag/retriever/retriever.ts`

**Responsabilidade**: Orquestrar a busca vetorial

**Fluxo**:
```
1. Recebe query do usuário
2. Gera embedding da query
3. Busca no pgvector usando similaridade de cosseno
4. Retorna top-k documentos com scores
```

**Output**:
```typescript
[
  {
    id: "uuid",
    content: "Equações do primeiro grau...",
    metadata: { topic: "Álgebra", difficulty: "básico" },
    similarity: 0.87  // 87% de similaridade
  },
  // ... mais documentos
]
```

### 5. Generator

**Arquivo**: `src/rag/generator/generator.ts`

**Responsabilidade**: Gerar resposta usando Claude com contexto

**Prompt Engineering**:
```
┌─────────────────────────────┐
│  SYSTEM PROMPT              │
│  (Persona do agente)        │
│  - Instruções               │
│  - Tom de voz               │
│  - Diretrizes               │
└─────────────────────────────┘
         +
┌─────────────────────────────┐
│  CONTEXTO RECUPERADO        │
│  --- Documento 1 ---        │
│  Fonte: Material Atomize    │
│  [conteúdo]                 │
│  --- Documento 2 ---        │
│  [conteúdo]                 │
└─────────────────────────────┘
         +
┌─────────────────────────────┐
│  PERGUNTA DO ALUNO          │
│  "Como resolver equações?"  │
└─────────────────────────────┘
         ↓
    Claude Sonnet 3.5
         ↓
┌─────────────────────────────┐
│  RESPOSTA CONTEXTUALIZADA   │
└─────────────────────────────┘
```

**Diferença crucial**:
- **Sem RAG**: Claude responde apenas com conhecimento geral
- **Com RAG**: Claude responde baseado nos materiais Atomize específicos

### 6. Logger

**Arquivo**: `src/rag/logger/logger.ts`

**Responsabilidade**: Auditoria e métricas

**O que é registrado**:
```typescript
{
  agentId: "professor_pitagoras",
  userId: "aluno123",
  question: "Como resolver equações?",
  answer: "Para resolver...",
  retrievedDocIds: ["uuid1", "uuid2", "uuid3"],
  retrievalScores: [0.87, 0.79, 0.71],  ← PROVA DO RETRIEVAL
  responseTimeMs: 1234,
  tokensUsed: 856,
  modelUsed: "claude-sonnet-3-5-20241022"
}
```

## Fluxo End-to-End

### Pipeline de Ingestão (Offline)

```
1. Carregar documentos fonte
   └─► loadSampleDocuments()

2. Dividir em chunks
   └─► chunkText() → chunks[]

3. Gerar embeddings
   └─► generateEmbeddingsBatch(chunks) → embeddings[]

4. Armazenar no banco
   └─► INSERT INTO agent_documents
       (content, embedding, metadata)
```

### Pipeline de Query (Online)

```
1. Receber requisição
   POST /api/agents/query
   { agentId, message, userId }

2. Validar agente
   └─► isValidAgentId()
   └─► getAgentConfig()

3. RETRIEVAL
   └─► generateEmbedding(message)
   └─► retrieveDocuments(agentId, embedding, topK=5)
       → documents[] com similarity scores

4. GENERATION
   └─► buildRAGPrompt(agentConfig, message, documents)
   └─► anthropic.messages.create()
       → answer

5. LOGGING
   └─► logQuery(query, result, documents)

6. Retornar resposta
   { answer, sources, metrics }
```

## Similaridade de Cosseno

**Como é calculada**:
```
similarity = cos(θ) = (A · B) / (||A|| × ||B||)

Onde:
- A = vetor da query
- B = vetor do documento
- · = produto escalar
- || || = norma (magnitude)
```

**Interpretação**:
- `1.0` = Idêntico
- `0.8-0.9` = Muito similar
- `0.6-0.7` = Relacionado
- `< 0.5` = Pouco relacionado

**Vantagem**: Independente da magnitude dos vetores, foca na direção (semântica).

## Agentes Especializados

### Como funcionam?

Cada agente tem:

1. **ID único**: `professor_pitagoras`
2. **System Prompt**: Instruções detalhadas de comportamento
3. **Base de conhecimento**: Documentos filtrados por `agent_id`
4. **Metadata**: Público-alvo, especialidades

### Isolamento

```sql
-- Agente 1 só vê seus documentos
SELECT * FROM agent_documents 
WHERE agent_id = 'professor_pitagoras';

-- Agente 2 só vê os dele
SELECT * FROM agent_documents 
WHERE agent_id = 'dra_clarice_lispector';
```

Isso garante que:
- Professor Pitágoras fala de matemática
- Dra. Clarice fala de português
- Não há "contaminação" entre domínios

## Escalabilidade

### Adicionar novo agente:

```typescript
// 1. Criar configuração
export const profMaryCurie: AgentConfig = {
  id: 'prof_mary_curie',
  name: 'Profª. Mary Curie',
  specialty: ['Ciências', 'Química', 'Física'],
  systemPrompt: `Você é a Profª. Mary Curie...`,
  // ...
};

// 2. Registrar no índice
export const AGENTS = {
  // ... existentes
  prof_mary_curie: profMaryCurie,
};

// 3. Ingerir documentos
const docs = loadDocumentsForCiencias();
await ingestDocuments('prof_mary_curie', docs);
```

Pronto! O agente está disponível sem alterar lógica de retrieval/generation.

## Performance

### Otimizações implementadas:

1. **Índice IVFFlat**: Busca ~10x mais rápida que força bruta
2. **Batch embeddings**: Processa 100 textos por vez
3. **Caching implícito**: Prisma mantém conexões abertas
4. **Top-K limitado**: Apenas documentos mais relevantes

### Benchmarks esperados:

- Embedding generation: ~200ms
- Vector search (pgvector): ~50ms
- Claude generation: ~2-4s (depende do tamanho da resposta)
- **Total**: ~2.5-4.5s por query

## Segurança e Validação

### Input validation (Zod):
```typescript
const QueryRequestSchema = z.object({
  agentId: z.string().min(1),
  message: z.string().min(1).max(2000),  // Limita tamanho
  // ...
});
```

### Sanitização:
- Prisma protege contra SQL injection
- API valida agentId contra lista permitida
- Rate limiting recomendado em produção

## Troubleshooting

### "Base de conhecimento vazia"
- Execute `npm run ingest`
- Verifique logs: documentos foram inseridos?

### "Similaridade muito baixa"
- Documentos podem não cobrir o tópico
- Considere adicionar mais materiais
- Verifique se agentId está correto

### "Erro de conexão com banco"
- Verifique DATABASE_URL
- Confirme que pgvector está instalado
- Rode migrations: `npm run prisma:migrate`

---

**Esta arquitetura permite**:
✅ Respostas baseadas em fontes reais (não alucina)
✅ Auditoria completa (logs com retrieval scores)
✅ Múltiplos agentes especializados isolados
✅ Escalabilidade (novos agentes e documentos)
✅ Performance aceitável para produção
