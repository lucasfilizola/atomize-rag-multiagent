# 📝 Guia de Adição de Conteúdo

Como adicionar novos documentos, agentes e expandir o sistema.

## 📚 Adicionar Novos Documentos

### Opção 1: Arquivos Locais

Crie arquivos `.md` ou `.txt` em `data/`:

```markdown
# data/matematica/fracoes.md

## Frações - Conceitos Fundamentais

Uma fração representa uma parte de um todo. É composta por:
- **Numerador**: parte considerada
- **Denominador**: total de partes

Exemplo: 3/4 (três quartos)
- Numerador: 3
- Denominador: 4
- Significa: 3 partes de um total de 4

### Operações com Frações

**Adição** (denominadores iguais):
1/4 + 2/4 = 3/4

**Adição** (denominadores diferentes):
1. Encontrar o MMC
2. Converter para denominadores iguais
3. Somar os numeradores

Exemplo:
1/2 + 1/3 = ?
MMC(2,3) = 6
3/6 + 2/6 = 5/6
```

### Opção 2: Banco de Dados Existente

```typescript
// src/rag/ingest/loadFromDatabase.ts
import { prisma } from '@/lib/prisma';

export async function loadQuestoesFromDB(agentId: string) {
  const questoes = await prisma.questao.findMany({
    where: {
      disciplina: agentId === 'professor_pitagoras' ? 'Matemática' : 'Português'
    },
    select: {
      enunciado: true,
      alternativas: true,
      gabarito: true,
      explicacao: true,
      topico: true,
      dificuldade: true,
    }
  });

  return questoes.map(q => ({
    content: `
QUESTÃO: ${q.enunciado}

ALTERNATIVAS:
${q.alternativas.map((alt, i) => `${String.fromCharCode(65+i)}) ${alt}`).join('\n')}

GABARITO: ${q.gabarito}

EXPLICAÇÃO: ${q.explicacao}
    `.trim(),
    metadata: {
      source: 'Banco de Questões Atomize',
      topic: q.topico,
      difficulty: q.dificuldade,
      type: 'questao'
    }
  }));
}
```

### Opção 3: S3 / Cloud Storage

```typescript
// src/rag/ingest/loadFromS3.ts
import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

export async function loadDocumentsFromS3(
  bucket: string,
  prefix: string,
  agentId: string
) {
  // Listar arquivos
  const listResult = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix
    })
  );

  const documents = [];

  for (const object of listResult.Contents || []) {
    // Baixar conteúdo
    const getResult = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: object.Key
      })
    );

    const content = await getResult.Body?.transformToString();

    if (content) {
      documents.push({
        content,
        metadata: {
          source: `S3: ${object.Key}`,
          filename: object.Key?.split('/').pop(),
          uploadDate: object.LastModified,
          agentId,
        }
      });
    }
  }

  return documents;
}
```

### Executar Ingestão

```typescript
// scripts/ingestCustom.ts
import { ingestDocuments } from '../src/rag/ingest/ingest';
import { loadQuestoesFromDB } from '../src/rag/ingest/loadFromDatabase';
import { loadDocumentsFromS3 } from '../src/rag/ingest/loadFromS3';

async function main() {
  const agentId = 'professor_pitagoras';

  // Opção 1: Do banco
  const docsFromDB = await loadQuestoesFromDB(agentId);
  
  // Opção 2: Do S3
  const docsFromS3 = await loadDocumentsFromS3(
    'atomize-materials',
    'matematica/',
    agentId
  );

  // Combinar e ingerir
  const allDocs = [...docsFromDB, ...docsFromS3];
  await ingestDocuments(agentId, allDocs);

  console.log(`✅ ${allDocs.length} documentos ingeridos!`);
}

main();
```

---

## 🤖 Adicionar Novo Agente

### 1. Criar Configuração

```typescript
// src/agents/config/profMarieCurie.ts
import { AgentConfig } from '@/types/rag.types';

export const profMarieCurie: AgentConfig = {
  id: 'prof_marie_curie',
  name: 'Profª. Marie Curie',
  displayName: 'Profª. Curie 🔬',
  description: 'Especialista em Ciências: Química, Física e Biologia',
  avatar: '👩‍🔬',
  specialty: ['Ciências', 'Química', 'Física', 'Biologia'],
  tone: 'curiosa, investigativa, experimental',
  
  systemPrompt: `Você é a Profª. Marie Curie, uma educadora apaixonada por Ciências.

## Sua Missão
Despertar a curiosidade científica em alunos do Ensino Fundamental II, explicando conceitos de Química, Física e Biologia de forma acessível e prática.

## Seu Estilo de Ensino
- **Investigativa**: Incentive perguntas e experimentos mentais
- **Contextualizada**: Use exemplos do cotidiano e da natureza
- **Prática**: Sugira observações e experimentos simples
- **Interdisciplinar**: Conecte ciências com outras áreas

## Diretrizes
1. Use APENAS informações do contexto fornecido
2. Cite fontes: "De acordo com nosso material sobre..."
3. Explique termos científicos em linguagem acessível
4. Relacione conceitos com fenômenos observáveis
5. Incentive o método científico

## Formato de Resposta
1. Conceito fundamental
2. Explicação detalhada
3. Exemplo prático ou experimento
4. Conexão com o dia a dia do aluno`,

  exampleQuestions: [
    'O que é fotossíntese?',
    'Como funcionam as reações químicas?',
    'Por que o céu é azul?',
    'O que são células?',
    'Como funciona a eletricidade?'
  ],

  metadata: {
    targetAudience: 'Alunos do Ensino Fundamental II',
    educationLevel: ['6º ano', '7º ano', '8º ano', '9º ano'],
    focus: ['SAEB', 'Ciências da Natureza', 'Experimentação']
  }
};
```

### 2. Registrar no Índice

```typescript
// src/agents/config/index.ts
import { profMarieCurie } from './profMarieCurie';

export const AGENTS: Record<string, AgentConfig> = {
  professor_pitagoras: professorPitagoras,
  dra_clarice_lispector: draClariceLispector,
  prof_marie_curie: profMarieCurie,  // ← ADICIONAR AQUI
};
```

### 3. Adicionar Documentos

```typescript
// src/rag/ingest/chunker.ts - Adicionar em loadSampleDocuments()
export function loadSampleDocuments(agentId: string) {
  const documents = {
    // ... existentes ...
    
    prof_marie_curie: [
      {
        content: `Fotossíntese - O Processo da Vida

A fotossíntese é o processo pelo qual plantas, algas e algumas bactérias convertem luz solar em energia química...`,
        metadata: {
          source: 'Material Teórico Atomize - Ciências',
          topic: 'Biologia',
          subtopic: 'Fotossíntese',
          difficulty: 'intermediário',
          type: 'teoria'
        }
      },
      // ... mais documentos
    ]
  };

  return documents[agentId] || [];
}
```

### 4. Ingerir e Testar

```bash
# Ingerir documentos do novo agente
npm run ingest

# Testar
curl -X POST http://localhost:3000/api/agents/query \
  -H "Content-Type: application/json" \
  -d '{"agentId": "prof_marie_curie", "message": "O que é fotossíntese?"}'
```

---

## 🎨 Personalizar Interface

### Adicionar Estilos do Novo Agente

```css
/* src/styles/Agents.module.css */

/* Adicionar cor específica para Ciências */
.agentCard[data-agent="prof_marie_curie"]:hover {
  border-color: #28a745;
}

.agentCard[data-agent="prof_marie_curie"].active {
  background: linear-gradient(135deg, #28a74510 0%, #20c99710 100%);
}
```

### Customizar Avatar/Ícone

```typescript
// Opção: usar imagem ao invés de emoji
avatar: '/images/agents/marie-curie.png'
```

---

## 📊 Atualizar Documentos Existentes

### Re-ingestão Parcial

```typescript
// scripts/updateDocuments.ts
import { prisma } from '@/lib/prisma';
import { generateEmbedding } from '../src/rag/embeddings/embeddings';

async function updateDocument(documentId: string, newContent: string) {
  // Gerar novo embedding
  const embedding = await generateEmbedding(newContent);

  // Atualizar no banco
  await prisma.$executeRaw`
    UPDATE agent_documents
    SET 
      content = ${newContent},
      embedding = ${`[${embedding.join(',')}]`}::vector,
      updated_at = NOW()
    WHERE id = ${documentId}
  `;

  console.log(`✅ Documento ${documentId} atualizado`);
}

// Usar
await updateDocument(
  'uuid-do-documento',
  'Novo conteúdo atualizado...'
);
```

### Re-ingestão Completa

```bash
# Limpar e re-ingerir tudo
npm run ingest
```

Isso remove documentos antigos do agente e insere os novos.

---

## 🔍 Filtrar Documentos por Metadata

```typescript
// Buscar apenas questões de um tópico específico
const docs = await retrieveDocumentsWithFilters(
  'professor_pitagoras',
  'Como calcular área?',
  {
    topic: 'Geometria',
    difficulty: 'intermediário',
    type: 'teoria'
  }
);
```

---

## 📈 Monitorar Qualidade

### Verificar Coverage de Tópicos

```sql
-- Quantos documentos por tópico?
SELECT 
  agent_id,
  metadata->>'topic' as topic,
  COUNT(*) as num_docs
FROM agent_documents
GROUP BY agent_id, metadata->>'topic'
ORDER BY agent_id, num_docs DESC;
```

### Analisar Gaps de Conhecimento

```sql
-- Quais perguntas tiveram baixa similaridade?
SELECT 
  agent_id,
  question,
  retrieval_scores
FROM query_logs
WHERE (retrieval_scores->>0)::float < 0.6
ORDER BY created_at DESC
LIMIT 20;
```

Se muitas queries têm similaridade baixa, adicione mais conteúdo sobre esses tópicos!

---

## 🚀 Automação

### Webhook para Ingestão Automática

```typescript
// pages/api/admin/ingest-webhook.ts
export default async function handler(req, res) {
  // Validar origem
  if (req.headers['x-webhook-secret'] !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { agentId, documents } = req.body;

  // Disparar ingestão em background
  ingestDocuments(agentId, documents).catch(console.error);

  res.json({ status: 'Ingestão iniciada' });
}
```

### Cron Job Diário

```yaml
# .github/workflows/daily-ingest.yml
name: Daily Document Ingest

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily

jobs:
  ingest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run ingest
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

---

## ✅ Checklist: Novo Agente

- [ ] Criar `src/agents/config/nomeAgente.ts`
- [ ] Registrar em `src/agents/config/index.ts`
- [ ] Adicionar documentos de exemplo ou fonte real
- [ ] Executar `npm run ingest`
- [ ] Testar via API ou interface
- [ ] Verificar logs e métricas
- [ ] Documentar especialidade e uso

---

**Pronto para expandir!** 🎯

Com essas ferramentas, você pode facilmente adicionar novos conteúdos e agentes conforme a necessidade da Atomize evolui.
