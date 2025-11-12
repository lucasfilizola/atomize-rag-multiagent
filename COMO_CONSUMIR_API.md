# 🚀 Como Consumir a API RAG Atomize

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Endpoint e Autenticação](#endpoint-e-autenticação)
3. [Formatos de Request/Response](#formatos-de-requestresponse)
4. [SDKs e Clients](#sdks-e-clients)
5. [Exemplos de Integração](#exemplos-de-integração)
6. [Demo Interativa](#demo-interativa)
7. [Tratamento de Erros](#tratamento-de-erros)
8. [Rate Limiting](#rate-limiting)

---

## 🎯 Visão Geral

A API RAG Atomize permite que qualquer plataforma integre agentes de IA especializados em educação.

**Agentes disponíveis:**
- 🧮 **Professor Pitágoras** - Matemática (SAEB, OBMEP)
- 📚 **Dra. Clarice Lispector** - Português

**Tecnologias:**
- PostgreSQL + pgvector (Neon)
- OpenAI Embeddings (busca semântica)
- Claude Haiku 4.5 (geração de respostas)

---

## 🔌 Endpoint e Autenticação

### Desenvolvimento (local):
```
POST http://localhost:3000/api/agents/query
```

### Produção:
```
POST https://seu-dominio.com/api/agents/query
Headers:
  Content-Type: application/json
  X-API-Key: sua-chave-aqui
```

---

## 📝 Formatos de Request/Response

### Request:
```json
{
  "agentId": "professor_pitagoras",
  "message": "O que é uma função quadrática?",
  "userId": "user123",
  "maxDocuments": 5
}
```

### Response (200 OK):
```json
{
  "answer": "Resposta detalhada do agente...",
  "sources": [
    {
      "id": "uuid",
      "content": "Conteúdo do documento...",
      "metadata": {
        "source": "funcao-quadratica.md",
        "topic": "algebra"
      },
      "similarity": 0.74
    }
  ],
  "responseTimeMs": 3245,
  "modelUsed": "claude-haiku-4-5"
}
```

---

## 💻 SDKs e Clients

### TypeScript/JavaScript

```typescript
import AtomizeRAGClient from './atomize-rag-client';

const client = new AtomizeRAGClient('http://localhost:3000');

const resposta = await client.askPitagoras('O que é uma função quadrática?');
console.log(resposta.answer);
```

**Arquivos:**
- `sdk/atomize-rag-client.ts` - SDK completo
- `sdk/examples.ts` - Exemplos de uso
- `sdk/README.md` - Documentação do SDK

### Python

```python
import requests

def perguntar(message: str):
    response = requests.post(
        'http://localhost:3000/api/agents/query',
        json={
            'agentId': 'professor_pitagoras',
            'message': message
        }
    )
    return response.json()

resultado = perguntar('O que é uma função quadrática?')
print(resultado['answer'])
```

### cURL

```bash
curl -X POST http://localhost:3000/api/agents/query \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "professor_pitagoras",
    "message": "O que é uma função quadrática?"
  }'
```

---

## 🔨 Exemplos de Integração

### 1. React Hook

```typescript
import { useState } from 'react';
import AtomizeRAGClient from './atomize-rag-client';

export function useAtomizeRAG() {
  const [loading, setLoading] = useState(false);
  const client = new AtomizeRAGClient('http://localhost:3000');

  const perguntar = async (agentId: string, message: string) => {
    setLoading(true);
    try {
      return await client.query(agentId, message);
    } finally {
      setLoading(false);
    }
  };

  return { perguntar, loading };
}
```

### 2. Next.js API Route

```typescript
// pages/api/chat.ts
import AtomizeRAGClient from '@/lib/atomize-rag-client';

const client = new AtomizeRAGClient(process.env.ATOMIZE_API_URL);

export default async function handler(req, res) {
  const { message, agentId } = req.body;
  const resposta = await client.query(agentId, message);
  res.json(resposta);
}
```

### 3. Express.js

```typescript
import express from 'express';
import AtomizeRAGClient from './atomize-rag-client';

const app = express();
const client = new AtomizeRAGClient(process.env.ATOMIZE_API_URL);

app.post('/api/chat', async (req, res) => {
  const resposta = await client.query(req.body.agentId, req.body.message);
  res.json(resposta);
});
```

### 4. Vue.js Composable

```typescript
import { ref } from 'vue';
import AtomizeRAGClient from './atomize-rag-client';

export function useAtomizeRAG() {
  const loading = ref(false);
  const client = new AtomizeRAGClient('http://localhost:3000');

  const perguntar = async (agentId: string, message: string) => {
    loading.value = true;
    try {
      return await client.query(agentId, message);
    } finally {
      loading.value = false;
    }
  };

  return { perguntar, loading };
}
```

---

## 🎪 Demo Interativa

Abra o arquivo `demo/index.html` no navegador para testar a API visualmente!

**Recursos da demo:**
- ✅ Interface visual completa
- ✅ Seleção de agentes
- ✅ Chat em tempo real
- ✅ Visualização de fontes
- ✅ Estatísticas de resposta
- ✅ Tratamento de erros

**Para usar:**
```bash
# 1. Certifique-se que o servidor está rodando
npm run dev

# 2. Abra no navegador
open demo/index.html
```

---

## ❌ Tratamento de Erros

### Códigos HTTP:

| Código | Erro | Solução |
|--------|------|---------|
| 400 | Bad Request | Verifique parâmetros |
| 401 | Unauthorized | Verifique API Key |
| 404 | Agent Not Found | Use agentId válido |
| 429 | Too Many Requests | Aguarde 1 minuto |
| 503 | Service Unavailable | Execute ingestão |

### Exemplo de tratamento:

```typescript
try {
  const resposta = await client.query('agente_invalido', 'teste');
} catch (error) {
  if (error.statusCode === 404) {
    console.log('Agentes disponíveis:', error.details.availableAgents);
  } else if (error.statusCode === 429) {
    console.log('Muitas requisições! Aguarde...');
  }
}
```

---

## ⚡ Rate Limiting

**Limites:**
- Desenvolvimento: Sem limite
- Produção: **10 requisições/minuto** por API Key

**Headers de resposta:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1699999999
```

---

## 📚 Documentação Completa

| Arquivo | Descrição |
|---------|-----------|
| `API_INTEGRATION_GUIDE.md` | Guia completo da API |
| `sdk/README.md` | Documentação do SDK |
| `sdk/atomize-rag-client.ts` | Client TypeScript |
| `sdk/examples.ts` | Exemplos práticos |
| `demo/index.html` | Demo interativa |

---

## 🔗 Links Úteis

- **GitHub**: https://github.com/lucasfilizola/atomize-rag-multiagent
- **Suporte**: suporte@atomize.com.br
- **API Key**: Contate lucas@atomize.com.br

---

## 🎯 Quick Start

### 1. Clone o SDK:
```bash
git clone https://github.com/lucasfilizola/atomize-rag-multiagent.git
cd atomize-rag-multiagent/sdk
```

### 2. Copie para seu projeto:
```bash
cp atomize-rag-client.ts seu-projeto/src/lib/
```

### 3. Use:
```typescript
import AtomizeRAGClient from './lib/atomize-rag-client';

const client = new AtomizeRAGClient('http://localhost:3000');
const resposta = await client.askPitagoras('sua pergunta');
```

---

## 📊 Status do Sistema

**✅ FUNCIONANDO:**
- PostgreSQL + pgvector (Neon)
- 72 documentos com embeddings
- Busca vetorial semântica
- Claude Haiku 4.5 geração
- 2 agentes especializados

**🎉 RAG COMPLETO IMPLEMENTADO!**

---

## 💡 Próximos Passos

1. ✅ Testar com demo interativa (`demo/index.html`)
2. ✅ Integrar em sua aplicação usando SDK
3. ✅ Deploy em produção (Vercel + Neon)
4. ✅ Solicitar API Key para produção
5. ✅ Adicionar mais documentos conforme necessário

---

**Dúvidas?** Abra uma issue no GitHub ou entre em contato!
