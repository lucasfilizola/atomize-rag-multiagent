# 🚀 Configuração do Repositório Git/GitHub

## Passo 1: Inicializar Git Localmente

```powershell
# No diretório do projeto
cd "c:\Users\lucas filizola\Downloads\RAG-POC"

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "feat: Sistema RAG multi-agente com Claude Sonnet 3.5 para Atomize"
```

## Passo 2: Criar Repositório no GitHub

### Opção A: Via Interface Web (Mais Fácil)

1. Acesse https://github.com/new
2. Preencha:
   - **Repository name**: `atomize-rag-multiagent` (ou nome de sua escolha)
   - **Description**: Sistema RAG multi-agente para apoio pedagógico - Olimpíadas e SAEB
   - **Visibilidade**: 
     - ✅ **Private** (recomendado - contém estratégia da Atomize)
     - ou Public (se quiser compartilhar)
3. **NÃO** marque "Initialize with README" (já temos um)
4. Clique em **Create repository**

### Opção B: Via GitHub CLI (Mais Rápido)

```powershell
# Instalar GitHub CLI (se não tiver)
# https://cli.github.com/

# Criar repositório
gh repo create atomize-rag-multiagent --private --source=. --remote=origin

# Push automático
gh repo push
```

## Passo 3: Conectar ao GitHub

Após criar o repositório no GitHub, você verá comandos similares a estes:

```powershell
# Adicionar remote (substitua SEU-USUARIO pelo seu username)
git remote add origin https://github.com/SEU-USUARIO/atomize-rag-multiagent.git

# Renomear branch para main (se necessário)
git branch -M main

# Push inicial
git push -u origin main
```

## Passo 4: Verificar

```powershell
# Verificar status
git status

# Verificar remotes
git remote -v

# Ver histórico
git log --oneline
```

## ⚠️ IMPORTANTE: Proteger Informações Sensíveis

O arquivo `.gitignore` já está configurado para **NÃO** commitar:
- ✅ `.env` (suas chaves de API)
- ✅ `node_modules/`
- ✅ Arquivos de build

**Sempre verifique** antes de fazer push:
```powershell
git status
```

Se acidentalmente adicionar `.env`:
```powershell
git rm --cached .env
git commit -m "Remove .env from tracking"
```

## 🔄 Workflow Diário

```powershell
# Ver mudanças
git status

# Adicionar arquivos específicos
git add src/agents/config/novoAgente.ts

# Ou adicionar tudo
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona agente de Ciências"

# Push para GitHub
git push
```

## 📝 Boas Práticas de Commit

Use prefixos semânticos:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças em documentação
- `refactor:` - Refatoração de código
- `test:` - Adicionar testes
- `chore:` - Tarefas de manutenção

**Exemplos**:
```
feat: adiciona retrieval com filtros de metadata
fix: corrige busca vetorial para queries longas
docs: atualiza README com instruções de deploy
refactor: melhora estrutura do generator
chore: atualiza dependências do projeto
```

## 🌿 Branches Recomendadas

```powershell
# Branch para desenvolvimento
git checkout -b development

# Branch para feature específica
git checkout -b feat/agente-ciencias

# Voltar para main
git checkout main

# Merge de feature
git merge feat/agente-ciencias
```

## 👥 Colaboração

### Clonar o Repositório (Outros Devs)

```powershell
git clone https://github.com/SEU-USUARIO/atomize-rag-multiagent.git
cd atomize-rag-multiagent
npm install
```

### Pull Latest Changes

```powershell
git pull origin main
```

## 🔐 Secrets no GitHub (CI/CD)

Para GitHub Actions, adicione secrets:

1. Settings → Secrets and variables → Actions
2. New repository secret
3. Adicionar:
   - `DATABASE_URL`
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`

## 📦 Releases

Quando tiver uma versão estável:

```powershell
# Tag de versão
git tag -a v1.0.0 -m "Release 1.0.0 - POC RAG Multi-Agente"

# Push da tag
git push origin v1.0.0
```

No GitHub: Releases → Create a new release

## 🚫 O que NÃO commitar

Já está no `.gitignore`, mas fique atento:
- ❌ `.env` e variáveis de ambiente
- ❌ `node_modules/`
- ❌ Chaves de API
- ❌ Dados sensíveis de alunos
- ❌ Backups de banco de dados

## ✅ Checklist de Setup

- [ ] Git inicializado localmente
- [ ] Repositório criado no GitHub
- [ ] Remote configurado
- [ ] Primeiro push realizado
- [ ] `.gitignore` verificado
- [ ] `.env` NÃO está no repositório
- [ ] README atualizado com seu nome/organização

---

**Pronto! Seu código está no GitHub!** 🎉

Compartilhe com sua equipe: `https://github.com/SEU-USUARIO/atomize-rag-multiagent`
