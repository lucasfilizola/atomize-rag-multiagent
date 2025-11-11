# 🚀 Script de Setup GitHub - Execute Após Criar o Repositório

## ⚠️ IMPORTANTE: Proteger Informações Sensíveis

Antes de fazer o push, certifique-se que seu arquivo `.env` NÃO está sendo rastreado:

```powershell
# Verificar o que será enviado
git status

# Se aparecer .env na lista, remova:
git rm --cached .env
```

O arquivo `.gitignore` já está configurado para proteger:
- ✅ `.env` (suas chaves de API)
- ✅ `node_modules/`
- ✅ Dados sensíveis

---

## 📝 Comandos para Executar (COPIE E COLE)

### 1. Adicionar o Remote do GitHub

Substitua `SEU-USUARIO` pelo seu username do GitHub:

```powershell
git remote add origin https://github.com/SEU-USUARIO/atomize-rag-multiagent.git
```

**Exemplo**:
Se seu username for `lucasfilizola`, seria:
```powershell
git remote add origin https://github.com/lucasfilizola/atomize-rag-multiagent.git
```

### 2. Renomear Branch para Main

```powershell
git branch -M main
```

### 3. Fazer o Push (Enviar seu código)

```powershell
git push -u origin main
```

---

## ✅ Verificar se Funcionou

Após executar os comandos acima:

1. Acesse: `https://github.com/SEU-USUARIO/atomize-rag-multiagent`
2. Você verá todos os seus arquivos lá!
3. O repositório estará **PÚBLICO** (qualquer pessoa pode ver)

---

## 🔐 E Minhas Chaves de API?

**Não se preocupe!** 

O arquivo `.env` (que contém suas chaves) NÃO será enviado ao GitHub porque está no `.gitignore`.

Para verificar:
```powershell
# Ver o que o Git está rastreando
git ls-files | Select-String ".env"
```

Se não aparecer nada, está seguro! ✅

---

## 🌐 Compartilhar o Repositório

Depois que fizer o push, você pode compartilhar:

**URL do Repositório**: `https://github.com/SEU-USUARIO/atomize-rag-multiagent`

Qualquer pessoa poderá:
- ✅ Ver o código
- ✅ Clonar o repositório
- ✅ Fazer fork
- ✅ Contribuir (se você permitir)

---

## 🔄 Fluxo Completo (Resumo)

```powershell
# 1. Verificar status
git status

# 2. Adicionar remote (SUBSTITUA SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/atomize-rag-multiagent.git

# 3. Renomear branch
git branch -M main

# 4. Push
git push -u origin main

# 5. Verificar
git remote -v
```

---

## ❓ E se der erro?

### Erro: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/atomize-rag-multiagent.git
```

### Erro: "failed to push"
```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Erro: "authentication failed"
O GitHub não aceita mais senha. Use um dos métodos:

**Opção A: GitHub CLI** (recomendado)
```powershell
# Instalar: https://cli.github.com/
gh auth login
```

**Opção B: Personal Access Token**
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Marcar: `repo`
4. Usar o token como senha

---

## 🎯 Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Marcado como **Public**
- [ ] Comando `git remote add origin` executado
- [ ] Comando `git push` executado com sucesso
- [ ] Repositório visível em `github.com/SEU-USUARIO/atomize-rag-multiagent`
- [ ] Arquivo `.env` NÃO aparece no GitHub
- [ ] README.md aparece na página inicial do repo

---

## 📢 Divulgar seu Projeto

Depois que estiver no ar, você pode:

1. **Adicionar um README Badge**:
```markdown
![GitHub](https://img.shields.io/github/license/SEU-USUARIO/atomize-rag-multiagent)
![GitHub stars](https://img.shields.io/github/stars/SEU-USUARIO/atomize-rag-multiagent)
```

2. **Compartilhar nas redes**:
   - LinkedIn
   - Twitter
   - Comunidades de dev

3. **Adicionar Topics no GitHub**:
   - `rag`
   - `claude-ai`
   - `education`
   - `artificial-intelligence`
   - `next-js`
   - `typescript`

---

**Pronto para executar!** 🚀

Após criar o repositório no GitHub, volte aqui e execute os comandos do passo "Comandos para Executar".
