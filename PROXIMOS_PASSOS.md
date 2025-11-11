# 🎯 Próximos Passos - Checklist Rápido

## ✅ O que já foi feito

- ✅ Projeto RAG multi-agente completo criado
- ✅ Estrutura de pastas para olimpíadas (`data/olimpiadas/`)
- ✅ Script de ingestão de arquivos (`npm run ingest:files`)
- ✅ Git inicializado e primeiro commit realizado
- ✅ Exemplo de material de olimpíadas (Combinatória)

## 📝 Próximos Passos

### 1. Criar Repositório no GitHub

Opção mais fácil - via navegador:

1. Acesse: https://github.com/new
2. Nome: `atomize-rag-multiagent` (ou outro de sua escolha)
3. Descrição: `Sistema RAG multi-agente para Atomize - Olimpíadas e SAEB`
4. Escolha: **Private** (recomendado)
5. **NÃO marque** "Initialize with README"
6. Clique em **Create repository**

### 2. Conectar seu repositório local ao GitHub

Após criar no GitHub, execute (substitua SEU-USUARIO):

```powershell
git remote add origin https://github.com/SEU-USUARIO/atomize-rag-multiagent.git
git branch -M main
git push -u origin main
```

### 3. Adicionar seus materiais de Olimpíadas

Você tem duas formas de adicionar conteúdo:

#### Forma 1: Arquivos Markdown/Texto (Recomendado)

Crie arquivos `.md` ou `.txt` em:
- `data/olimpiadas/matematica/` - Para conteúdo de matemática
- `data/olimpiadas/ciencias/` - Para ciências em geral
- `data/olimpiadas/astronomia/` - Para astronomia

**Exemplo de estrutura de arquivo**:

```markdown
---
disciplina: Matemática
olimpiada: OBMEP
nivel: 2
topico: Geometria
dificuldade: intermediario
---

# Título do Conteúdo

## Conceito

Explicação do conceito...

## Exemplos

Exemplos práticos...

## Questões Típicas

Questões de olimpíadas...
```

Depois execute:
```powershell
npm run ingest:files
```

#### Forma 2: Falar de Forma Geral

Se preferir não criar arquivos agora, você pode:

1. Descrever o conteúdo de forma textual
2. Eu posso gerar os arquivos markdown para você
3. Você revisa e ajusta
4. Executa a ingestão

**Por exemplo, me diga**:
- "Preciso de conteúdo sobre Teoria dos Números para OBMEP nível 3"
- "Quero material sobre Experimentos de Física para OBF"
- "Preciso de estratégias para questões de Astronomia da OBA"

E eu crio os arquivos estruturados para você!

### 4. Configurar ambiente de desenvolvimento

```powershell
# Instalar dependências
npm install

# Copiar arquivo de ambiente
copy .env.example .env

# Editar .env com suas chaves
notepad .env
```

Configure no `.env`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/atomize_rag"
ANTHROPIC_API_KEY="sua-chave-anthropic"
OPENAI_API_KEY="sua-chave-openai"
```

### 5. Configurar banco de dados

```powershell
# Criar banco PostgreSQL
# (via pgAdmin ou psql)

# Instalar pgvector
psql -U postgres -d atomize_rag -c "CREATE EXTENSION vector;"

# Executar migrations
npm run prisma:generate
npm run prisma:migrate
```

### 6. Executar primeira ingestão

```powershell
# Ingerir dados de exemplo
npm run ingest

# Ou ingerir seus arquivos da pasta data/olimpiadas
npm run ingest:files
```

### 7. Testar o sistema

```powershell
# Teste via script
npm run test:query

# Ou iniciar servidor
npm run dev
# Acesse: http://localhost:3000
```

## 🎓 Como adicionar mais conteúdo de Olimpíadas

### Opção A: Você tem os arquivos

1. Copie seus materiais (PDFs, Word, etc.) para `data/olimpiadas/`
2. Se não estiverem em Markdown, posso converter para você
3. Execute `npm run ingest:files`

### Opção B: Você descreve o conteúdo

Me informe o que precisa, por exemplo:

**Para Matemática (Professor Pitágoras)**:
- "Equações quadráticas para OBMEP nível 2"
- "Geometria espacial para Olimpíadas"
- "Problemas de contagem e probabilidade"
- "Teoria dos números: divisibilidade e primos"

**Para Ciências (futuro agente)**:
- "Mecânica básica para OBF"
- "Reações químicas para olimpíadas"
- "Sistema Solar para OBA"
- "Microscopia para OBFEP"

Eu crio os arquivos estruturados e você revisa!

### Opção C: Você tem um banco de questões

Se você tem questões em banco de dados ou JSON, posso criar um script específico para importar.

## 📊 Estrutura Recomendada dos Materiais

```
data/olimpiadas/
├── matematica/
│   ├── algebra/
│   │   ├── equacoes-primeiro-grau.md
│   │   ├── equacoes-segundo-grau.md
│   │   └── sistemas-lineares.md
│   ├── geometria/
│   │   ├── triangulos-basico.md
│   │   ├── teorema-pitagoras.md
│   │   └── areas-volumes.md
│   └── combinatoria/
│       ├── principio-fundamental.md
│       └── combinatoria-nivel2.md (✅ já existe)
│
├── ciencias/
│   ├── fisica/
│   ├── quimica/
│   └── biologia/
│
└── astronomia/
    ├── sistema-solar.md
    └── movimentos-celestes.md
```

## 🤔 Perguntas Frequentes

**P: Posso misturar conteúdo de várias fontes?**
R: Sim! O sistema aceita qualquer arquivo .md ou .txt. Basta adicionar na pasta correta.

**P: Como sei se a ingestão funcionou?**
R: Execute `npm run prisma:studio` e verifique a tabela `agent_documents`.

**P: Posso re-ingerir documentos?**
R: Sim! O script `ingest:files` adiciona novos documentos sem deletar os antigos.

**P: E se eu quiser limpar tudo e começar de novo?**
R: Execute SQL: `DELETE FROM agent_documents WHERE agent_id = 'professor_pitagoras';`

## 🚀 Comandos Úteis

```powershell
# Ver status do Git
git status

# Adicionar novos arquivos
git add .
git commit -m "docs: adiciona materiais de olimpíadas de matemática"
git push

# Ver o que está no banco
npm run prisma:studio

# Re-ingerir tudo
npm run ingest:files

# Testar uma query específica
npm run test:query
```

## 📞 Próxima Interação

Me informe:

1. **Você já tem materiais prontos?** 
   - Se sim: Qual formato? (PDF, Word, texto, etc.)
   - Me envie ou descreva brevemente

2. **Prefere que eu crie conteúdo?**
   - Me diga os tópicos que precisa
   - Especifique olimpíada e nível

3. **Quer ajuda com GitHub?**
   - Precisa de ajuda para criar o repositório?
   - Dúvidas sobre comandos Git?

---

**Estou pronto para ajudar no que precisar!** 🎯

Pode me enviar materiais, descrever conteúdos, ou tirar dúvidas sobre qualquer parte do sistema!
