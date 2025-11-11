---
disciplina: Matemática
olimpiada: OBMEP
nivel: 2
topico: Combinatória
dificuldade: intermediario
---

# Combinatória para Olimpíadas - Nível 2

## Princípio Fundamental da Contagem

O Princípio Fundamental da Contagem (PFC) é a base da combinatória. Ele nos diz:

> Se um evento A pode ocorrer de **m** maneiras diferentes e, para cada uma delas, um evento B pode ocorrer de **n** maneiras diferentes, então o número de maneiras de ocorrer A seguido de B é **m × n**.

### Exemplo Prático

**Situação**: Uma pizzaria oferece 5 tipos de massa e 8 tipos de recheio. De quantas maneiras diferentes posso montar uma pizza?

**Solução**:
- Evento A (escolher massa): 5 maneiras
- Evento B (escolher recheio): 8 maneiras
- Total: 5 × 8 = **40 pizzas diferentes**

## Tipos de Problemas na OBMEP

### Tipo 1: Formação de Números

**Questão típica**: Quantos números de 3 algarismos diferentes podemos formar usando os algarismos 1, 2, 3, 4 e 5?

**Raciocínio**:
- 1º algarismo: 5 escolhas
- 2º algarismo: 4 escolhas (não pode repetir)
- 3º algarismo: 3 escolhas

**Resposta**: 5 × 4 × 3 = **60 números**

### Tipo 2: Caminhos em Malhas

**Questão típica**: Quantos caminhos diferentes existem para ir do ponto A ao ponto B em uma grade 3×3, andando apenas para direita ou para cima?

**Estratégia**:
- Para ir de A a B, preciso fazer 3 movimentos para direita (D) e 3 para cima (C)
- Total de movimentos: 6
- Preciso escolher em quais posições coloco os 3 "D"
- Isso é uma combinação: C(6,3) = 20

### Tipo 3: Distribuição e Partição

**Questão típica**: De quantas maneiras posso distribuir 5 bolas diferentes em 3 caixas diferentes?

**Solução**:
- Cada bola pode ir para qualquer uma das 3 caixas
- Bola 1: 3 opções
- Bola 2: 3 opções
- Bola 3: 3 opções
- Bola 4: 3 opções
- Bola 5: 3 opções

**Resposta**: 3⁵ = **243 maneiras**

## Permutações

Permutação é o número de maneiras de **organizar** elementos.

### Permutação Simples

Número de maneiras de organizar **n** elementos: **n!** (fatorial de n)

**Exemplo**: De quantas maneiras 5 pessoas podem sentar em uma fila?
- Resposta: 5! = 5 × 4 × 3 × 2 × 1 = **120 maneiras**

### Permutação com Repetição

Se temos elementos repetidos, dividimos pelo fatorial das repetições.

**Exemplo**: Quantos anagramas tem a palavra BANANA?
- Total de letras: 6
- A se repete 3 vezes
- N se repete 2 vezes

**Resposta**: 6! ÷ (3! × 2!) = 720 ÷ (6 × 2) = **60 anagramas**

## Combinações

Combinação é escolher elementos quando a **ordem não importa**.

Fórmula: C(n,k) = n! ÷ [k! × (n-k)!]

**Exemplo**: De quantas maneiras posso escolher 3 alunos de uma turma de 10 para formar uma comissão?

C(10,3) = 10! ÷ (3! × 7!) = (10 × 9 × 8) ÷ (3 × 2 × 1) = **120 maneiras**

## Dicas de Ouro para OBMEP

1. **Identifique o tipo**: A ordem importa? (Permutação/Arranjo) ou não importa? (Combinação)

2. **Use o PFC**: Multiplique as etapas quando são independentes

3. **Divida em casos**: Problemas complexos ficam mais fáceis divididos em situações

4. **Desenhe**: Em problemas de caminhos, desenhe a grade

5. **Teste com números pequenos**: Se não tiver certeza, teste com 2 ou 3 elementos primeiro

## Questão de Treino

**Desafio OBMEP 2022 - Nível 2**

Em uma festa, há 8 meninos e 6 meninas. De quantas maneiras podemos formar uma equipe de 5 pessoas com exatamente 3 meninos e 2 meninas?

**Solução**:
- Escolher 3 meninos de 8: C(8,3) = 56
- Escolher 2 meninas de 6: C(6,2) = 15
- Total: 56 × 15 = **840 maneiras**

## Para Praticar Mais

- Faça listas de exercícios anteriores da OBMEP
- Procure padrões em problemas similares
- Sempre verifique se sua resposta faz sentido (não pode ser negativa, por exemplo!)
- Treine identificar rapidamente se é Permutação, Arranjo ou Combinação

**Lembre-se**: A prática leva à perfeição! 🏆
