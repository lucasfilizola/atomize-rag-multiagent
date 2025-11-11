---
title: "Princípio Fundamental da Contagem"
agent: professor_pitagoras
topic: "Análise Combinatória"
difficulty: "básico"
source: "OBM Nível 2"
---

# Princípio Fundamental da Contagem (PFC)

## Definição

O Princípio Fundamental da Contagem (PFC) é uma regra básica da análise combinatória que permite calcular o número total de possibilidades quando temos uma sequência de escolhas.

**Regra:** Se uma tarefa pode ser realizada em **n** etapas sucessivas, onde:
- A 1ª etapa pode ser feita de **n₁** maneiras
- A 2ª etapa pode ser feita de **n₂** maneiras
- A 3ª etapa pode ser feita de **n₃** maneiras
- E assim por diante...

Então o número total de maneiras de realizar a tarefa é:
**n₁ × n₂ × n₃ × ... × nₖ**

## Exemplos Simples

### Exemplo 1: Escolha de Roupas
João tem:
- 3 camisetas (azul, vermelha, verde)
- 2 calças (jeans, preta)

**Quantas combinações diferentes pode fazer?**

Solução:
- 1ª escolha (camiseta): 3 opções
- 2ª escolha (calça): 2 opções
- Total: **3 × 2 = 6 combinações**

### Exemplo 2: Placas de Carro
Uma placa antiga tinha 3 letras seguidas de 4 números.
- 26 letras no alfabeto
- 10 algarismos (0 a 9)

**Quantas placas diferentes podem ser formadas?**

Solução:
- 1ª posição: 26 letras
- 2ª posição: 26 letras
- 3ª posição: 26 letras
- 4ª posição: 10 números
- 5ª posição: 10 números
- 6ª posição: 10 números
- 7ª posição: 10 números

Total: **26 × 26 × 26 × 10 × 10 × 10 × 10 = 175.760.000 placas**

### Exemplo 3: Senhas
Quantas senhas de 4 dígitos podem ser formadas com os números de 0 a 9, sem repetir dígitos?

Solução:
- 1º dígito: 10 opções
- 2º dígito: 9 opções (não pode repetir)
- 3º dígito: 8 opções
- 4º dígito: 7 opções

Total: **10 × 9 × 8 × 7 = 5.040 senhas**

## Quando Usar o PFC?

Use o PFC quando:
1. Há uma **sequência de escolhas** independentes
2. Cada etapa tem um **número fixo de possibilidades**
3. Você quer saber o **total de combinações possíveis**

## Problemas Típicos de Olimpíadas

### Problema 1: Caminhos em Malha
Em uma malha quadriculada 4×3, quantos caminhos existem para ir do canto inferior esquerdo ao canto superior direito, movendo-se apenas para direita ou para cima?

**Dica:** Pense em quantos movimentos "D" (direita) e "C" (cima) são necessários e como organizá-los.

### Problema 2: Formação de Números
Quantos números de 5 algarismos distintos podemos formar usando os dígitos 1, 2, 3, 4, 5, 6, 7, 8, 9 (sem usar 0) de modo que o número seja par?

**Dica:** Comece pelo último dígito (deve ser par: 2, 4, 6 ou 8).

## Erros Comuns

❌ **Erro 1:** Esquecer de considerar restrições
- Exemplo: "sem repetição", "deve ser par", etc.

❌ **Erro 2:** Multiplicar quando deveria somar
- Multiplica quando as escolhas são sequenciais
- Soma quando são alternativas (OU)

✅ **Dica:** Sempre desenhe uma "árvore de possibilidades" para problemas pequenos!

## Conexão com Outros Tópicos

O PFC é a base para:
- **Arranjos** (Aₙ,ₚ = n!/(n-p)!)
- **Permutações** (Pₙ = n!)
- **Combinações** (Cₙ,ₚ = n!/(p!(n-p)!))

Na OBM, questões de PFC costumam aparecer misturadas com lógica e raciocínio!
