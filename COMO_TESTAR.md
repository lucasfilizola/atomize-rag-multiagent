# 🚀 Guia Completo: Como Testar o Chatbot RAG na Prática

## 📋 Pré-requisitos (Instalar Primeiro)

### 1️⃣ Instalar Node.js

**Download**: https://nodejs.org/

1. Baixe a versão **LTS** (recomendada)
2. Execute o instalador
3. Clique em "Next, Next, Install"
4. **Importante**: Marque a opção "Automatically install necessary tools"
5. Reinicie o PowerShell após instalar

**Verificar instalação**:
```powershell
node --version
# Deve mostrar: v18.x.x ou v20.x.x

npm --version
# Deve mostrar: 9.x.x ou 10.x.x
```

### 2️⃣ Instalar PostgreSQL

**Download**: https://www.postgresql.org/download/windows/

1. Baixe o instalador
2. Durante a instalação:
   - **Senha**: Escolha uma senha (ex: `postgres123`)
   - **Porta**: Deixe 5432 (padrão)
   - Marque todas as opções
3. Após instalar, abra **pgAdmin 4**

### 3️⃣ Obter Chaves de API

**Anthropic (Claude)**:
- Acesse: https://console.anthropic.com/
- Crie conta
- Settings → API Keys → Create Key
- Copie a chave: `sk-ant-...`

**OpenAI**:
- Acesse: https://platform.openai.com/api-keys
- Crie conta
- Create new secret key
- Copie a chave: `sk-...`

---

## 🔧 Setup do Projeto (Passo a Passo)

### PASSO 1: Instalar Dependências

```powershell
# No diretório do projeto
cd "c:\Users\lucas filizola\Downloads\RAG-POC"

# Instalar pacotes
npm install
```

Isso vai baixar todas as bibliotecas necessárias (~5 minutos).

### PASSO 2: Configurar Variáveis de Ambiente

```powershell
# Copiar arquivo de exemplo
copy .env.example .env

# Editar o arquivo
notepad .env
```

**Cole no .env**:
```env
# Banco de dados (ajuste usuário e senha)
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/atomize_rag?schema=public"

# API Keys (cole suas chaves aqui)
ANTHROPIC_API_KEY="sk-ant-sua-chave-aqui"
OPENAI_API_KEY="sk-sua-chave-aqui"

# Configurações RAG
EMBEDDING_MODEL="text-embedding-3-small"
CLAUDE_MODEL="claude-sonnet-3-5-20241022"
TOP_K_DOCUMENTS=5
CHUNK_SIZE=800
CHUNK_OVERLAP=200
```

Salve e feche o Notepad.

### PASSO 3: Criar Banco de Dados

```powershell
# Abrir psql (terminal do PostgreSQL)
# Senha: a que você escolheu na instalação

psql -U postgres

# Dentro do psql, execute:
CREATE DATABASE atomize_rag;
\c atomize_rag
CREATE EXTENSION vector;
\q
```

Ou use o **pgAdmin**:
1. Abra pgAdmin 4
2. Conecte ao servidor (senha que escolheu)
3. Clique direito em "Databases" → Create → Database
4. Nome: `atomize_rag`
5. Clique em "Save"
6. Abra Query Tool e execute:
```sql
CREATE EXTENSION vector;
```

### PASSO 4: Executar Migrations

```powershell
# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate
```

### PASSO 5: Ingerir Documentos

```powershell
# Ingerir dados de exemplo
npm run ingest
```

Você verá:
```
🚀 Iniciando ingestão de documentos RAG...

📚 Processando documentos para: professor_pitagoras
   ✓ 3 documentos carregados
   ✓ 9 chunks criados
   ⏳ Gerando embeddings...
   ✓ 9 embeddings gerados
   ✓ 9 documentos inseridos com sucesso!

📚 Processando documentos para: dra_clarice_lispector
   ✓ 3 documentos carregados
   ✓ 8 chunks criados
   ⏳ Gerando embeddings...
   ✓ 8 embeddings gerados
   ✓ 8 documentos inseridos com sucesso!

🎉 Ingestão concluída com sucesso!
```

---

## 🧪 OPÇÃO 1: Testar via Script (Rápido)

```powershell
npm run test:query
```

Você verá algo assim:
```
🧪 Teste de Query RAG

Agent: professor_pitagoras
Query: "Como resolver equações do primeiro grau?"

✓ Agente carregado: Professor Pitágoras

⏳ Gerando embedding da query...
✓ Embedding gerado: 1536 dimensões

⏳ Buscando documentos relevantes...
✓ Recuperados 3 documentos:
   1. Similaridade: 87.3%
      Tópico: Álgebra
      Conteúdo: Equações do Primeiro Grau...

⏳ Gerando resposta com Claude...
✓ Resposta gerada (456 tokens):

────────────────────────────────────────────────
Para resolver uma equação do primeiro grau, 
seguimos estes passos:

1. Isolar os termos com a incógnita de um lado
2. Isolar os termos numéricos do outro lado
3. Realizar as operações necessárias
4. Dividir ambos os lados pelo coeficiente

Exemplo prático:
Resolva: 3x + 5 = 14
...
────────────────────────────────────────────────

✅ Teste concluído com sucesso!
```

---

## 🌐 OPÇÃO 2: Testar via Interface Web (Completo)

### Iniciar o Servidor

```powershell
npm run dev
```

Você verá:
```
> atomize-rag-multiagent@1.0.0 dev
> next dev

 ▲ Next.js 14.2.0
 - Local:        http://localhost:3000
 - Environments: .env

 ✓ Ready in 3.2s
```

### Acessar no Navegador

1. Abra seu navegador
2. Acesse: **http://localhost:3000**

Você verá a interface:

```
┌─────────────────────────────────────────────┐
│         🎓 Agentes Atomize                  │
│   Assistentes especializados para estudos   │
├─────────────────────────────────────────────┤
│                                             │
│  SIDEBAR              │  CHAT AREA         │
│  ┌─────────────────┐  │  ┌──────────────┐ │
│  │ 👨‍🏫 Prof.        │  │  │              │ │
│  │ Pitágoras       │  │  │  Escolha um  │ │
│  │ Matemática      │  │  │  agente      │ │
│  └─────────────────┘  │  │              │ │
│                       │  └──────────────┘ │
│  ┌─────────────────┐  │                   │
│  │ 👩‍🏫 Dra.         │  │                   │
│  │ Clarice         │  │                   │
│  │ Português       │  │                   │
│  └─────────────────┘  │                   │
│                       │                   │
└─────────────────────────────────────────────┘
```

### Como Usar:

1. **Clique em um agente** (ex: Prof. Pitágoras)
2. **Digite uma pergunta** no campo de texto
3. **Pressione Enter** ou clique em 📤
4. **Aguarde a resposta** (2-5 segundos)
5. **Veja as fontes** utilizadas embaixo da resposta

### Perguntas de Teste:

**Para Professor Pitágoras**:
- "Como resolver equações do primeiro grau?"
- "Explique o Teorema de Pitágoras"
- "Como calcular porcentagem?"
- "Dicas para combinatória em olimpíadas"

**Para Dra. Clarice**:
- "Como identificar a ideia principal de um texto?"
- "Quais conectivos usar em redação?"
- "Explique concordância verbal"
- "Como interpretar charges no SAEB?"

---

## 📡 OPÇÃO 3: Testar via API (cURL)

Em outro terminal:

```powershell
# Testar endpoint de agentes
curl http://localhost:3000/api/agents

# Testar query
curl -X POST http://localhost:3000/api/agents/query `
  -H "Content-Type: application/json" `
  -d '{\"agentId\": \"professor_pitagoras\", \"message\": \"Como resolver equações?\", \"userId\": \"teste\"}'
```

---

## 🐛 Problemas Comuns

### ❌ "npm não é reconhecido"
**Solução**: Instale Node.js e reinicie o PowerShell

### ❌ "Cannot connect to database"
**Solução**: 
- Verifique se PostgreSQL está rodando
- Confirme usuário/senha no `.env`
- Teste conexão:
```powershell
psql -U postgres -d atomize_rag
```

### ❌ "API key invalid"
**Solução**: 
- Verifique se copiou a chave completa
- Confira se não há espaços extras no `.env`
- Teste as chaves nos sites oficiais

### ❌ "No documents found"
**Solução**: Execute a ingestão:
```powershell
npm run ingest
```

### ❌ Erro de CORS no navegador
**Solução**: Use `http://localhost:3000` (não use IP)

---

## 📊 Verificar se Está Funcionando

### Ver Documentos no Banco

```powershell
npm run prisma:studio
```

Navegue para a tabela `agent_documents` e você verá:
- Documentos ingeridos
- Embeddings (vetores)
- Metadata

### Ver Logs de Queries

Na tabela `query_logs` você verá:
- Perguntas feitas
- Respostas geradas
- Documentos recuperados
- Scores de similaridade (PROVA do RAG!)

---

## 🎯 Fluxo Completo de Teste

```
1. Ingerir documentos
   ↓
2. Iniciar servidor (npm run dev)
   ↓
3. Abrir http://localhost:3000
   ↓
4. Selecionar agente
   ↓
5. Fazer pergunta
   ↓
6. Ver resposta + fontes
   ↓
7. Conferir logs no Prisma Studio
```

---

## 🚀 Próximo Nível: Adicionar Conteúdo de Olimpíadas

Após testar com os dados de exemplo, você pode:

```powershell
# Adicionar seus materiais em data/olimpiadas/
# Depois executar:
npm run ingest:files
```

---

## ✅ Checklist de Teste

- [ ] Node.js instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Chaves de API configuradas no `.env`
- [ ] Banco `atomize_rag` criado
- [ ] Extensão `vector` instalada
- [ ] Dependências instaladas (`npm install`)
- [ ] Migrations executadas
- [ ] Ingestão concluída
- [ ] Servidor rodando (`npm run dev`)
- [ ] Testei pergunta no navegador
- [ ] Vi resposta com fontes
- [ ] Verifiquei logs no Prisma Studio

---

**Qual opção você quer testar primeiro?**

1. 🔧 Preciso instalar Node.js e PostgreSQL
2. 🧪 Quero fazer o teste rápido via script
3. 🌐 Quero ver a interface web funcionando
4. ❓ Tenho dúvidas sobre algum passo

Me diga e eu te guio! 🚀
