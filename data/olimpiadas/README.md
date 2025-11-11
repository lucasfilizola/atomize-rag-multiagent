# 📚 Materiais sobre Olimpíadas Científicas

Esta pasta contém materiais didáticos sobre olimpíadas científicas para ingestão no sistema RAG.

## 📁 Estrutura

```
data/
└── olimpiadas/
    ├── matematica/         # Olimpíada Brasileira de Matemática (OBM, OBMEP)
    ├── ciencias/           # Olimpíada Brasileira de Ciências (OBFEP)
    ├── astronomia/         # Olimpíada Brasileira de Astronomia (OBA)
    └── README.md          # Este arquivo
```

## 📝 Como Adicionar Conteúdo

### Formato dos Arquivos

Crie arquivos `.md` (Markdown) ou `.txt` com o conteúdo. Exemplo:

```markdown
# Título do Tópico

## Conceito

Explicação clara do conceito...

## Exemplos de Questões

### Nível 1 (Fácil)
...

### Nível 2 (Médio)
...

### Nível 3 (Difícil)
...

## Dicas e Estratégias

- Dica 1
- Dica 2
```

### Exemplos de Arquivos

**matematica/combinatoria.md**
```markdown
# Combinatória para Olimpíadas

## Princípio Fundamental da Contagem

Se um evento A pode ocorrer de m maneiras diferentes e, para cada uma delas, 
um evento B pode ocorrer de n maneiras diferentes, então o número de maneiras 
de ocorrer A seguido de B é m × n.

## Questões Típicas de OBMEP

[Adicione questões e resoluções aqui]
```

**ciencias/metodo-cientifico.md**
```markdown
# Método Científico nas Olimpíadas

## O que é o Método Científico

Passo a passo para resolver problemas científicos...
```

## 🔄 Ingestão Automática

Após adicionar seus arquivos, execute:

```bash
npm run ingest:files
```

Este comando processará todos os arquivos `.md` e `.txt` desta pasta.

## 📋 Metadados Recomendados

Adicione um cabeçalho YAML nos arquivos (opcional):

```markdown
---
disciplina: Matemática
olimpiada: OBMEP
nivel: 2
topico: Combinatória
dificuldade: intermediario
---

# Seu conteúdo aqui...
```

## 🎯 Organização Sugerida

### Matemática
- Álgebra para olimpíadas
- Geometria avançada
- Teoria dos números
- Combinatória
- Problemas clássicos OBMEP

### Ciências
- Experimentos práticos
- Física do cotidiano
- Química básica
- Biologia aplicada

### Astronomia
- Sistema Solar
- Movimentos celestes
- Instrumentos de observação
- Questões típicas OBA

## 📤 Formatos Aceitos

- ✅ Markdown (`.md`)
- ✅ Texto puro (`.txt`)
- ✅ JSON estruturado (`.json`)
- ⏳ PDF (implementação futura)
- ⏳ Word (implementação futura)

## 💡 Dicas

1. **Use exemplos práticos**: Olimpíadas valorizam aplicação
2. **Inclua estratégias**: Dicas de como abordar problemas
3. **Cite a fonte**: Indique ano e olimpíada quando aplicável
4. **Separe por nível**: Facilita a busca por dificuldade

## 🔗 Recursos Externos

- [OBMEP - Site Oficial](http://www.obmep.org.br/)
- [OBA - Olimpíada Brasileira de Astronomia](http://www.oba.org.br/)
- [OBF - Olimpíada Brasileira de Física](http://www.sbfisica.org.br/v1/olimpiada/)

---

**Comece adicionando seus materiais nas subpastas!** 📖
