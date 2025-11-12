# 🔌 Guia de Integração - API RAG Atomize

## 📡 Endpoint Base

```
POST /api/agents/query
```

## 🔑 Autenticação (Produção)

Adicione o header `X-API-Key`:

```bash
curl -X POST https://seu-dominio.com/api/agents/query \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua-chave-aqui" \
  -d '{"agentId": "professor_pitagoras", "message": "sua pergunta"}'
```

## 📝 Request Body

```json
{
  "agentId": "professor_pitagoras",
  "message": "O que é uma função quadrática?",
  "userId": "user123",
  "maxDocuments": 5
}
```

### Parâmetros:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `agentId` | string | ✅ Sim | ID do agente (`professor_pitagoras` ou `dra_clarice_lispector`) |
| `message` | string | ✅ Sim | Pergunta do usuário (máx 2000 caracteres) |
| `userId` | string | ❌ Não | ID do usuário para tracking |
| `maxDocuments` | number | ❌ Não | Número de documentos a recuperar (padrão: 5, máx: 10) |

## ✅ Response (200 OK)

```json
{
  "answer": "Resposta completa do agente...",
  "sources": [
    {
      "id": "uuid-123",
      "content": "Trecho do documento...",
      "metadata": {
        "source": "Olimpíadas - matematica/funcao-quadratica.md",
        "topic": "algebra",
        "difficulty": "intermediario"
      },
      "similarity": 0.74
    }
  ],
  "responseTimeMs": 3245,
  "modelUsed": "claude-haiku-4-5"
}
```

### Response Fields:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `answer` | string | Resposta gerada pelo agente |
| `sources` | array | Documentos recuperados (ordenados por relevância) |
| `sources[].similarity` | number | Score de similaridade (0-1) |
| `responseTimeMs` | number | Tempo de resposta em ms |
| `modelUsed` | string | Modelo de IA usado |

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Validação falhou",
  "details": [
    {
      "field": "message",
      "message": "Campo obrigatório"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "API Key inválida ou ausente"
}
```

### 404 Not Found
```json
{
  "error": "Agente não encontrado",
  "agentId": "agente_invalido",
  "availableAgents": ["professor_pitagoras", "dra_clarice_lispector"]
}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "Limite de 10 requisições por minuto excedido"
}
```

### 503 Service Unavailable
```json
{
  "error": "Base de conhecimento vazia",
  "message": "Nenhum documento encontrado para este agente"
}
```

## 💻 Exemplos de Integração

### JavaScript/TypeScript

```typescript
class AtomizeRAGClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async query(
    agentId: string,
    message: string,
    options?: {
      userId?: string;
      maxDocuments?: number;
    }
  ) {
    const response = await fetch(`${this.baseUrl}/api/agents/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        agentId,
        message,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro na requisição');
    }

    return await response.json();
  }
}

// Usar:
const client = new AtomizeRAGClient(
  'https://seu-dominio.com',
  'sua-api-key'
);

const resultado = await client.query(
  'professor_pitagoras',
  'O que é uma função quadrática?'
);

console.log(resultado.answer);
```

### Python

```python
import requests
from typing import Optional, Dict, Any

class AtomizeRAGClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
    
    def query(
        self,
        agent_id: str,
        message: str,
        user_id: Optional[str] = None,
        max_documents: int = 5
    ) -> Dict[str, Any]:
        url = f"{self.base_url}/api/agents/query"
        
        headers = {
            'Content-Type': 'application/json',
            'X-API-Key': self.api_key
        }
        
        payload = {
            'agentId': agent_id,
            'message': message,
            'maxDocuments': max_documents
        }
        
        if user_id:
            payload['userId'] = user_id
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        return response.json()

# Usar:
client = AtomizeRAGClient(
    base_url='https://seu-dominio.com',
    api_key='sua-api-key'
)

resultado = client.query(
    agent_id='professor_pitagoras',
    message='O que é uma função quadrática?'
)

print(resultado['answer'])
```

### PHP

```php
<?php

class AtomizeRAGClient {
    private $baseUrl;
    private $apiKey;

    public function __construct($baseUrl, $apiKey) {
        $this->baseUrl = $baseUrl;
        $this->apiKey = $apiKey;
    }

    public function query($agentId, $message, $userId = null, $maxDocuments = 5) {
        $url = $this->baseUrl . '/api/agents/query';
        
        $data = [
            'agentId' => $agentId,
            'message' => $message,
            'maxDocuments' => $maxDocuments
        ];
        
        if ($userId) {
            $data['userId'] = $userId;
        }

        $options = [
            'http' => [
                'header' => [
                    "Content-Type: application/json",
                    "X-API-Key: {$this->apiKey}"
                ],
                'method' => 'POST',
                'content' => json_encode($data)
            ]
        ];

        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        
        return json_decode($result, true);
    }
}

// Usar:
$client = new AtomizeRAGClient(
    'https://seu-dominio.com',
    'sua-api-key'
);

$resultado = $client->query(
    'professor_pitagoras',
    'O que é uma função quadrática?'
);

echo $resultado['answer'];
?>
```

### Ruby

```ruby
require 'net/http'
require 'json'

class AtomizeRAGClient
  def initialize(base_url, api_key)
    @base_url = base_url
    @api_key = api_key
  end

  def query(agent_id, message, user_id: nil, max_documents: 5)
    uri = URI("#{@base_url}/api/agents/query")
    
    request = Net::HTTP::Post.new(uri)
    request['Content-Type'] = 'application/json'
    request['X-API-Key'] = @api_key
    
    body = {
      agentId: agent_id,
      message: message,
      maxDocuments: max_documents
    }
    body[:userId] = user_id if user_id
    
    request.body = body.to_json
    
    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.request(request)
    end
    
    JSON.parse(response.body)
  end
end

# Usar:
client = AtomizeRAGClient.new(
  'https://seu-dominio.com',
  'sua-api-key'
)

resultado = client.query(
  'professor_pitagoras',
  'O que é uma função quadrática?'
)

puts resultado['answer']
```

## 🎯 Agentes Disponíveis

### Professor Pitágoras
```json
{
  "id": "professor_pitagoras",
  "name": "Professor Pitágoras",
  "specialty": "Matemática para Ensino Fundamental II, SAEB e Olimpíadas",
  "topics": ["geometria", "algebra", "aritmetica", "combinatoria"]
}
```

### Dra. Clarice Lispector
```json
{
  "id": "dra_clarice_lispector",
  "name": "Dra. Clarice Lispector",
  "specialty": "Língua Portuguesa: leitura, interpretação, produção textual",
  "topics": ["interpretacao", "gramatica", "redacao", "literatura"]
}
```

## 📊 Rate Limits

- **Desenvolvimento**: Sem limite
- **Produção**: 10 requisições/minuto por API Key

## 🔐 Obtendo uma API Key

Entre em contato com: lucas@atomize.com.br

## 📚 Documentação Completa

https://github.com/lucasfilizola/atomize-rag-multiagent

## 💬 Suporte

- Email: suporte@atomize.com.br
- GitHub Issues: https://github.com/lucasfilizola/atomize-rag-multiagent/issues
