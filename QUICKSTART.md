# ⚡ Quick Start - Sistema RAG Multi-Agente

Guia rápido para rodar o sistema em **5 minutos**.

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+ instalado localmente
- Chaves de API: Anthropic (Claude) e OpenAI

## 🚀 Setup Rápido

### 1. Instalar Dependências

```powershell
npm install
```

### 2. Configurar Banco de Dados

```powershell
# Criar banco
psql -U postgres
CREATE DATABASE atomize_rag;
\c atomize_rag
CREATE EXTENSION vector;
\q
```

### 3. Configurar Variáveis de Ambiente

```powershell
# Copiar exemplo
copy .env.example .env

# Editar .env com suas credenciais
notepad .env
```

Configurar:
```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/atomize_rag?schema=public"
ANTHROPIC_API_KEY="sk-ant-sua-chave"
OPENAI_API_KEY="sk-sua-chave"
```

### 4. Executar Migrations

```powershell
npm run prisma:generate
npm run prisma:migrate
```

### 5. Ingerir Documentos

```powershell
npm run ingest
```

Saída esperada:
```
🚀 Iniciando ingestão de documentos RAG...

📚 Processando documentos para: professor_pitagoras
   ✓ 3 documentos carregados
   ✓ 9 chunks criados
   ✓ 9 embeddings gerados
   ✓ 9 documentos inseridos com sucesso!

📚 Processando documentos para: dra_clarice_lispector
   ✓ 3 documentos carregados
   ✓ 8 chunks criados
   ✓ 8 embeddings gerados
   ✓ 8 documentos inseridos com sucesso!

🎉 Ingestão concluída com sucesso!
```

### 6. Testar

```powershell
# Teste via script
npm run test:query

# Ou iniciar servidor
npm run dev
```

Acesse: http://localhost:3000

## ✅ Verificação

### Testar via cURL

```powershell
curl -X POST http://localhost:3000/api/agents/query `
  -H "Content-Type: application/json" `
  -d '{\"agentId\": \"professor_pitagoras\", \"message\": \"Como resolver equações do primeiro grau?\", \"userId\": \"teste\"}'
```

### Verificar Banco

```powershell
npm run prisma:studio
```

Navegue para:
- `agent_documents`: Deve ter ~17 registros
- `query_logs`: Logs das queries

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"

```powershell
npm run prisma:generate
```

### "pgvector extension not found"

```powershell
psql -U postgres -d atomize_rag -c "CREATE EXTENSION vector;"
```

### "API key invalid"

Verifique se copiou as chaves corretamente no `.env`:
```powershell
notepad .env
```

### "No documents found"

Execute a ingestão:
```powershell
npm run ingest
```

## 📚 Próximos Passos

1. ✅ Explorar a interface em http://localhost:3000
2. ✅ Testar com diferentes perguntas
3. ✅ Ver logs em `prisma:studio`
4. ✅ Ler documentação em `docs/ARCHITECTURE.md`
5. ✅ Adicionar novos agentes (ver exemplo no README)

## 🎯 Comandos Úteis

```powershell
# Desenvolvimento
npm run dev                # Servidor Next.js
npm run build              # Build produção
npm run start              # Servidor produção

# Banco
npm run prisma:studio      # Interface visual
npm run prisma:migrate     # Nova migration

# RAG
npm run ingest             # Re-ingerir documentos
npm run test:query         # Teste end-to-end
```

## 💡 Dicas

- Use **Professor Pitágoras** para questões de matemática
- Use **Dra. Clarice** para português e redação
- As respostas incluem fontes utilizadas
- Logs mostram scores de similaridade (prova do RAG!)

---

**Pronto para usar!** 🎉

Se algo não funcionou, veja o README principal ou abra uma issue.
