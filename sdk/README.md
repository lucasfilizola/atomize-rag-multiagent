# 📦 SDK AtomizeRAG - Client Library

SDK JavaScript/TypeScript para integração com a API RAG Atomize.

## 🚀 Instalação

### Copiar arquivos para seu projeto:

```bash
# Copie o arquivo do SDK
cp sdk/atomize-rag-client.ts seu-projeto/src/lib/
```

### Ou instalar via npm (futuro):

```bash
npm install @atomize/rag-client
```

## 📖 Uso Básico

```typescript
import AtomizeRAGClient from './atomize-rag-client';

// Criar cliente
const client = new AtomizeRAGClient('http://localhost:3000');

// Fazer pergunta
const resposta = await client.askPitagoras('O que é uma função quadrática?');

console.log(resposta.answer);
```

## 🎯 Métodos Disponíveis

### `query(agentId, message, options?)`

Faz uma pergunta a qualquer agente.

```typescript
const resposta = await client.query(
  'professor_pitagoras',
  'Como calcular área?',
  {
    userId: 'user123',
    maxDocuments: 10
  }
);
```

**Parâmetros:**
- `agentId`: ID do agente (`professor_pitagoras` ou `dra_clarice_lispector`)
- `message`: Pergunta do usuário
- `options.userId`: (opcional) ID do usuário para tracking
- `options.maxDocuments`: (opcional) Número de documentos a recuperar (padrão: 5)

**Retorno:**
```typescript
{
  answer: string;
  sources: Source[];
  responseTimeMs: number;
  modelUsed: string;
}
```

### `askPitagoras(message, options?)`

Atalho para perguntar ao Professor Pitágoras (Matemática).

```typescript
const resposta = await client.askPitagoras('Explique logaritmos');
```

### `askClarice(message, options?)`

Atalho para perguntar à Dra. Clarice (Português).

```typescript
const resposta = await client.askClarice('O que é uma metáfora?');
```

### `listAgents()`

Lista todos os agentes disponíveis.

```typescript
const agentes = await client.listAgents();

agentes.forEach(agente => {
  console.log(agente.name, '-', agente.specialty);
});
```

## 🔐 Autenticação (Produção)

Para ambiente de produção, forneça uma API Key:

```typescript
const client = new AtomizeRAGClient(
  'https://seu-dominio.com',
  'sua-api-key-aqui'
);
```

## 💻 Exemplos de Integração

### React Hook

```typescript
import { useState } from 'react';
import AtomizeRAGClient from './atomize-rag-client';

export function useAtomizeRAG() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new AtomizeRAGClient('http://localhost:3000');

  const perguntar = async (agentId: string, message: string) => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await client.query(agentId, message);
      return resultado;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { perguntar, loading, error };
}
```

**Uso no componente:**

```typescript
function ChatComponent() {
  const { perguntar, loading } = useAtomizeRAG();

  const handleSubmit = async (pergunta: string) => {
    const resposta = await perguntar('professor_pitagoras', pergunta);
    console.log(resposta.answer);
  };

  return (
    <div>
      {loading ? 'Carregando...' : 'Pronto!'}
    </div>
  );
}
```

### Next.js API Route

```typescript
// pages/api/chat.ts
import { NextApiRequest, NextApiResponse } from 'next';
import AtomizeRAGClient from '@/lib/atomize-rag-client';

const client = new AtomizeRAGClient(
  process.env.ATOMIZE_API_URL!,
  process.env.ATOMIZE_API_KEY
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, agentId } = req.body;

  try {
    const resposta = await client.query(agentId, message);
    res.json(resposta);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
}
```

### Express.js

```typescript
import express from 'express';
import AtomizeRAGClient from './atomize-rag-client';

const app = express();
app.use(express.json());

const client = new AtomizeRAGClient(
  process.env.ATOMIZE_API_URL,
  process.env.ATOMIZE_API_KEY
);

app.post('/api/chat', async (req, res) => {
  try {
    const { message, agentId } = req.body;
    const resposta = await client.query(agentId, message);
    res.json(resposta);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
});

app.listen(3001);
```

## 🛠️ Tratamento de Erros

O SDK lança `AtomizeRAGError` com informações detalhadas:

```typescript
try {
  const resposta = await client.query('agente_invalido', 'teste');
} catch (error) {
  if (error instanceof AtomizeRAGError) {
    console.error('Status:', error.statusCode);
    console.error('Mensagem:', error.message);
    console.error('Detalhes:', error.details);

    if (error.statusCode === 404) {
      console.log('Agentes disponíveis:', error.details.availableAgents);
    }
  }
}
```

### Códigos de Erro Comuns:

| Código | Erro | Solução |
|--------|------|---------|
| 400 | Bad Request | Verifique os parâmetros enviados |
| 401 | Unauthorized | Verifique sua API Key |
| 404 | Not Found | AgentId inválido, use `listAgents()` |
| 429 | Too Many Requests | Aguarde antes de fazer nova requisição |
| 503 | Service Unavailable | Banco de dados vazio, execute ingestão |

## 🎓 Exemplos Completos

Veja o arquivo `sdk/examples.ts` para exemplos detalhados de:

- ✅ Setup básico
- ✅ Múltiplos agentes
- ✅ Opções avançadas
- ✅ Listagem de agentes
- ✅ Tratamento de erros
- ✅ Integração com React
- ✅ Integração com Express

## 📚 Tipos TypeScript

```typescript
interface QueryOptions {
  userId?: string;
  maxDocuments?: number;
}

interface Source {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

interface QueryResponse {
  answer: string;
  sources: Source[];
  responseTimeMs: number;
  modelUsed: string;
}

interface AgentInfo {
  id: string;
  name: string;
  specialty: string;
  topics: string[];
}
```

## 🔗 Links Úteis

- [Documentação da API](../API_INTEGRATION_GUIDE.md)
- [Repositório GitHub](https://github.com/lucasfilizola/atomize-rag-multiagent)
- [Exemplos de Uso](./examples.ts)

## 📧 Suporte

- Email: suporte@atomize.com.br
- GitHub Issues: https://github.com/lucasfilizola/atomize-rag-multiagent/issues
