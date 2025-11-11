# 📡 API Reference - Sistema RAG Multi-Agente

Documentação completa dos endpoints da API.

## Base URL

```
Development: http://localhost:3000/api
Production: https://seu-dominio.com/api
```

## Autenticação

```http
Authorization: Bearer <token>
```

_(Em produção - Atualmente não implementada na POC)_

---

## Endpoints

### 1. Listar Agentes

Retorna todos os agentes disponíveis.

**Request**:
```http
GET /api/agents
```

**Response** (200 OK):
```json
{
  "agents": [
    {
      "id": "professor_pitagoras",
      "name": "Professor Pitágoras",
      "displayName": "Prof. Pitágoras 📐",
      "description": "Especialista em Matemática para Ensino Fundamental II",
      "avatar": "👨‍🏫",
      "specialty": ["Matemática", "Geometria", "Álgebra"],
      "exampleQuestions": [
        "Como resolver equações do primeiro grau?",
        "Explique o Teorema de Pitágoras"
      ],
      "metadata": {
        "targetAudience": "Alunos do Ensino Fundamental II",
        "educationLevel": ["6º ano", "7º ano", "8º ano", "9º ano"],
        "focus": ["SAEB", "SPAECE", "Olimpíadas"]
      }
    },
    {
      "id": "dra_clarice_lispector",
      "name": "Dra. Clarice Lispector",
      "displayName": "Dra. Clarice ✍️",
      "description": "Especialista em Língua Portuguesa",
      "avatar": "👩‍🏫",
      "specialty": ["Língua Portuguesa", "Interpretação", "Redação"],
      "exampleQuestions": [
        "Como identificar a ideia principal?",
        "Quais conectivos usar em redação?"
      ],
      "metadata": {
        "targetAudience": "Alunos do Ensino Fundamental II",
        "educationLevel": ["6º ano", "7º ano", "8º ano", "9º ano"],
        "focus": ["SAEB", "Leitura", "Redação"]
      }
    }
  ]
}
```

---

### 2. Realizar Query RAG

Envia uma pergunta para um agente e recebe resposta contextualizada.

**Request**:
```http
POST /api/agents/query
Content-Type: application/json
```

**Body**:
```json
{
  "agentId": "professor_pitagoras",
  "userId": "aluno_123",
  "message": "Como resolver equações do primeiro grau?",
  "maxDocuments": 5
}
```

**Parâmetros**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `agentId` | string | ✅ | ID do agente (ex: `professor_pitagoras`) |
| `userId` | string | ❌ | ID do usuário (para logs) |
| `message` | string | ✅ | Pergunta do aluno (max 2000 caracteres) |
| `maxDocuments` | number | ❌ | Número de documentos a recuperar (default: 5, max: 10) |

**Response** (200 OK):
```json
{
  "agentId": "professor_pitagoras",
  "answer": "Para resolver uma equação do primeiro grau, seguimos estes passos:\n\n1. **Isolar os termos com a incógnita** de um lado da igualdade\n2. **Isolar os termos numéricos** do outro lado\n3. Realizar as operações necessárias\n4. Dividir ambos os lados pelo coeficiente da incógnita\n\n**Exemplo prático:**\nResolva: 3x + 5 = 14\n\nPasso 1: Subtrair 5 de ambos os lados\n3x + 5 - 5 = 14 - 5\n3x = 9\n\nPasso 2: Dividir ambos os lados por 3\n3x ÷ 3 = 9 ÷ 3\nx = 3\n\n**Verificação:** Sempre substitua o valor encontrado na equação original para confirmar!\n3(3) + 5 = 9 + 5 = 14 ✓",
  "sources": [
    {
      "id": "uuid-abc-123",
      "content": "Equações do Primeiro Grau\n\nUma equação do primeiro grau é uma igualdade matemática...",
      "metadata": {
        "source": "Material Teórico Atomize - Matemática",
        "topic": "Álgebra",
        "subtopic": "Equações do Primeiro Grau",
        "difficulty": "básico",
        "targetGrade": ["7º ano", "8º ano"]
      },
      "similarity": 0.8734
    },
    {
      "id": "uuid-def-456",
      "content": "Para resolver equações, seguimos passos sistemáticos...",
      "metadata": {
        "source": "Material SAEB - Matemática",
        "topic": "Álgebra",
        "difficulty": "básico"
      },
      "similarity": 0.7892
    }
  ],
  "responseTimeMs": 2845,
  "tokensUsed": 456,
  "modelUsed": "claude-sonnet-3-5-20241022"
}
```

**Errors**:

**400 Bad Request** - Dados inválidos
```json
{
  "error": "Dados inválidos",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "path": ["message"],
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

**404 Not Found** - Agente não existe
```json
{
  "error": "Agente não encontrado",
  "availableAgents": ["professor_pitagoras", "dra_clarice_lispector"]
}
```

**503 Service Unavailable** - Base de conhecimento vazia
```json
{
  "error": "Base de conhecimento vazia",
  "message": "Nenhum documento encontrado para este agente. Execute a ingestão primeiro."
}
```

**500 Internal Server Error** - Erro no processamento
```json
{
  "error": "Erro interno do servidor",
  "message": "Descrição do erro"
}
```

---

## Exemplos de Uso

### JavaScript / TypeScript

```typescript
async function queryAgent(agentId: string, message: string) {
  const response = await fetch('http://localhost:3000/api/agents/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agentId,
      message,
      userId: 'user_123', // opcional
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Usar
const result = await queryAgent(
  'professor_pitagoras',
  'Como calcular porcentagem?'
);

console.log('Resposta:', result.answer);
console.log('Fontes:', result.sources.length);
```

### Python

```python
import requests

def query_agent(agent_id: str, message: str, user_id: str = None):
    url = "http://localhost:3000/api/agents/query"
    
    payload = {
        "agentId": agent_id,
        "message": message
    }
    
    if user_id:
        payload["userId"] = user_id
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    
    return response.json()

# Usar
result = query_agent(
    "dra_clarice_lispector",
    "Como interpretar textos?",
    "aluno_456"
)

print(f"Resposta: {result['answer']}")
print(f"Tempo: {result['responseTimeMs']}ms")
```

### cURL

```bash
curl -X POST http://localhost:3000/api/agents/query \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "professor_pitagoras",
    "message": "Explique o Teorema de Pitágoras",
    "userId": "teste"
  }'
```

---

## Rate Limits

_(Produção - configurar conforme necessidade)_

- **100 requests/15min** por IP (desenvolvimento)
- **1000 requests/hora** por usuário autenticado (produção)

**Response Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699564800
```

---

## Webhooks (Futuro)

Para notificações de novos documentos ingeridos:

```http
POST /api/webhooks/ingest-complete
Content-Type: application/json

{
  "agentId": "professor_pitagoras",
  "documentsAdded": 15,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## SDKs (Planejados)

```typescript
// Future: @atomize/rag-client
import { AtomizeRAG } from '@atomize/rag-client';

const client = new AtomizeRAG({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.atomize.com'
});

const response = await client.agents.query({
  agentId: 'professor_pitagoras',
  message: 'Como resolver equações?'
});
```

---

## Métricas e Logging

Todas as queries são registradas com:

- ✅ Timestamp
- ✅ Agent ID
- ✅ User ID (se fornecido)
- ✅ Pergunta e resposta
- ✅ Documentos recuperados (IDs + scores)
- ✅ Tempo de resposta
- ✅ Tokens utilizados

Acesse via Prisma Studio ou diretamente no banco:

```sql
SELECT 
  agent_id,
  question,
  response_time_ms,
  retrieval_scores,
  created_at
FROM query_logs
ORDER BY created_at DESC
LIMIT 10;
```

---

## Status e Saúde

### Health Check (implementar):

```http
GET /api/health

Response:
{
  "status": "healthy",
  "database": "connected",
  "embeddings": "available",
  "claude": "available",
  "version": "1.0.0"
}
```

---

**Happy Coding!** 🚀

Para mais detalhes, consulte a [documentação completa](../README.md).
