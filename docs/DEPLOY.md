# 🚀 Guia de Deploy - Produção

## Opções de Deploy

### Opção 1: AWS Serverless (Recomendado para Atomize)

**Stack**:
- Lambda (API routes)
- RDS PostgreSQL com pgvector
- API Gateway
- S3 (materiais/documentos)

**Vantagens**:
- Escalabilidade automática
- Pay-per-use
- Integração com stack Atomize existente

#### Setup AWS:

```bash
# 1. Instalar Serverless Framework
npm install -g serverless
npm install --save-dev serverless-next.js

# 2. Configurar serverless.yml
# (arquivo já criado abaixo)

# 3. Deploy
serverless deploy --stage production
```

**serverless.yml**:
```yaml
service: atomize-rag

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    ANTHROPIC_API_KEY: ${env:ANTHROPIC_API_KEY}
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}

functions:
  query:
    handler: dist/pages/api/agents/query.handler
    events:
      - http:
          path: api/agents/query
          method: post
          cors: true
    timeout: 30
    memorySize: 1024

resources:
  Resources:
    RagDatabase:
      Type: AWS::RDS::DBInstance
      Properties:
        DBName: atomize_rag
        Engine: postgres
        EngineVersion: 14.7
        MasterUsername: admin
        MasterUserPassword: ${env:DB_PASSWORD}
```

### Opção 2: Vercel (Mais Simples)

**Vantagens**:
- Deploy com 1 comando
- Next.js nativo
- Edge functions

**Limitações**:
- Lambda timeout de 10s (hobby) ou 60s (pro)
- Pode ser curto para RAG queries

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod

# 3. Configurar variáveis de ambiente no dashboard
```

### Opção 3: Docker + EC2

**Para controle total**:

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build e push
docker build -t atomize-rag .
docker tag atomize-rag:latest <ecr-repo>/atomize-rag:latest
docker push <ecr-repo>/atomize-rag:latest

# Deploy no EC2/ECS
```

## Configuração de Produção

### 1. Banco de Dados

**RDS PostgreSQL + pgvector**:

```bash
# Criar RDS instance via Console AWS ou Terraform

# Conectar e instalar pgvector
psql -h <rds-endpoint> -U admin -d atomize_rag
CREATE EXTENSION vector;

# Executar migrations
DATABASE_URL="postgresql://admin:password@<rds-endpoint>:5432/atomize_rag" \
  npm run prisma:migrate deploy
```

**Configurações importantes**:
- `max_connections`: 100+
- `shared_buffers`: 25% da RAM
- `work_mem`: 50MB (para busca vetorial)

### 2. Variáveis de Ambiente

**Secrets Manager (AWS)**:
```bash
aws secretsmanager create-secret \
  --name atomize-rag/production \
  --secret-string '{
    "DATABASE_URL": "...",
    "ANTHROPIC_API_KEY": "...",
    "OPENAI_API_KEY": "..."
  }'
```

**No código (Lambda)**:
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

async function getSecrets() {
  const client = new SecretsManagerClient({ region: "us-east-1" });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: "atomize-rag/production" })
  );
  return JSON.parse(response.SecretString);
}
```

### 3. Cache (Redis)

**Para otimizar embeddings repetidos**:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedEmbedding(text: string): Promise<number[] | null> {
  const cached = await redis.get(`emb:${text}`);
  return cached ? JSON.parse(cached) : null;
}

async function cacheEmbedding(text: string, embedding: number[]) {
  await redis.setex(`emb:${text}`, 3600, JSON.stringify(embedding));
}
```

### 4. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests por IP
  message: 'Muitas requisições, tente novamente mais tarde'
});

// Aplicar no endpoint
app.use('/api/agents/query', limiter);
```

### 5. Monitoramento

**CloudWatch (AWS)**:
```typescript
import { CloudWatch } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatch();

async function logMetric(name: string, value: number) {
  await cloudwatch.putMetricData({
    Namespace: 'AtomizeRAG',
    MetricData: [{
      MetricName: name,
      Value: value,
      Unit: 'Count',
      Timestamp: new Date()
    }]
  });
}

// Usar
await logMetric('RAGQuerySuccess', 1);
await logMetric('ResponseTime', responseTimeMs);
```

## Ingestão em Produção

### Pipeline Automatizado

**Lambda scheduled (cron)**:
```yaml
functions:
  ingestDaily:
    handler: dist/scripts/ingest.handler
    events:
      - schedule: cron(0 2 * * ? *)  # 2 AM daily
    timeout: 900  # 15 min
    memorySize: 2048
```

**Webhook para ingestão sob demanda**:
```typescript
// pages/api/admin/ingest.ts
export default async function handler(req, res) {
  // Validar token de admin
  if (req.headers.authorization !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Disparar ingestão
  await triggerIngestLambda();
  
  res.json({ status: 'Ingestão iniciada' });
}
```

### Ingerir de S3

```typescript
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

async function loadDocumentsFromS3(bucket: string, prefix: string) {
  const s3 = new S3Client();
  const objects = await s3.listObjectsV2({ Bucket: bucket, Prefix: prefix });
  
  const documents = [];
  for (const obj of objects.Contents) {
    const response = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: obj.Key })
    );
    const content = await response.Body.transformToString();
    documents.push({ content, metadata: { source: obj.Key } });
  }
  
  return documents;
}
```

## Custos Estimados

### Pequeno Porte (1000 queries/dia)

| Serviço | Custo Mensal |
|---------|--------------|
| RDS db.t3.medium | $50 |
| Lambda (30s avg) | $10 |
| OpenAI embeddings | $5 |
| Anthropic Claude | $30 |
| S3 + Transfer | $5 |
| **Total** | **~$100/mês** |

### Médio Porte (10.000 queries/dia)

| Serviço | Custo Mensal |
|---------|--------------|
| RDS db.m5.large | $180 |
| Lambda | $80 |
| OpenAI embeddings | $40 |
| Anthropic Claude | $250 |
| S3 + Transfer | $15 |
| ElastiCache Redis | $50 |
| **Total** | **~$615/mês** |

## Checklist de Deploy

- [ ] Banco de dados PostgreSQL com pgvector
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations executadas
- [ ] Ingestão inicial concluída
- [ ] Testes de query funcionando
- [ ] Rate limiting ativado
- [ ] Monitoramento configurado
- [ ] Logs centralizados (CloudWatch/Datadog)
- [ ] Backup automático do banco
- [ ] SSL/TLS habilitado
- [ ] CORS configurado corretamente
- [ ] Documentação de APIs atualizada

## Rollback

**Em caso de problemas**:

```bash
# Voltar deploy
serverless rollback --timestamp <previous-timestamp>

# Ou Vercel
vercel rollback <deployment-url>

# Reverter migrations
npx prisma migrate resolve --rolled-back <migration-name>
```

## Suporte

**Logs em tempo real**:
```bash
# AWS
serverless logs -f query -t

# Vercel
vercel logs <deployment-url> --follow
```

**Métricas**:
```bash
# Dashboard CloudWatch
aws cloudwatch get-dashboard --dashboard-name AtomizeRAG

# Ou criar dashboard custom com Grafana + Prometheus
```

---

**Ambiente de Produção Pronto!** 🚀

Com esta configuração, o sistema suporta:
- ✅ Milhares de queries por dia
- ✅ Alta disponibilidade
- ✅ Escalabilidade automática
- ✅ Monitoramento completo
- ✅ Custos controlados
