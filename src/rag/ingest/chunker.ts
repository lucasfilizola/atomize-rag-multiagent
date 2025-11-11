import { DocumentChunk } from '@/types/rag.types';

/**
 * Configuração de chunking
 */
const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || '800');
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || '200');

/**
 * Divide um texto em chunks com overlap
 */
export function chunkText(
  text: string,
  chunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): string[] {
  const chunks: string[] = [];
  
  // Remove espaços extras e quebras de linha múltiplas
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  if (cleanText.length <= chunkSize) {
    return [cleanText];
  }

  let start = 0;
  while (start < cleanText.length) {
    let end = start + chunkSize;
    
    // Se não é o último chunk, tenta quebrar em uma pontuação ou espaço
    if (end < cleanText.length) {
      const searchSpace = cleanText.substring(end - 100, end + 100);
      const breakPoints = ['. ', '! ', '? ', '\n', '; '];
      
      let bestBreak = -1;
      for (const bp of breakPoints) {
        const idx = searchSpace.lastIndexOf(bp);
        if (idx > 0 && idx < 150) {
          bestBreak = end - 100 + idx + bp.length;
          break;
        }
      }
      
      if (bestBreak > 0) {
        end = bestBreak;
      }
    }
    
    const chunk = cleanText.substring(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    start = end - overlap;
  }
  
  return chunks;
}

/**
 * Processa documentos e cria chunks prontos para ingestão
 */
export function createDocumentChunks(
  agentId: string,
  documents: Array<{
    content: string;
    metadata: Record<string, any>;
  }>
): DocumentChunk[] {
  const allChunks: DocumentChunk[] = [];

  for (const doc of documents) {
    const chunks = chunkText(doc.content);
    
    chunks.forEach((chunk, index) => {
      allChunks.push({
        agentId,
        content: chunk,
        metadata: {
          ...doc.metadata,
          chunkIndex: index,
          totalChunks: chunks.length,
        },
      });
    });
  }

  return allChunks;
}

/**
 * Carrega documentos de exemplo para um agente
 * Na prática real, isso viria de S3, banco de dados, ou arquivos
 */
export function loadSampleDocuments(agentId: string): Array<{
  content: string;
  metadata: Record<string, any>;
}> {
  // Placeholder - em produção, isso carregaria de uma fonte real
  const documents: Record<string, Array<{ content: string; metadata: Record<string, any> }>> = {
    professor_pitagoras: [
      {
        content: `Equações do Primeiro Grau

Uma equação do primeiro grau é uma igualdade matemática que contém uma incógnita (geralmente x) elevada à potência 1. A forma geral é: ax + b = 0, onde a e b são números reais e a ≠ 0.

Para resolver uma equação do primeiro grau, seguimos estes passos:

1. Isolar os termos com a incógnita de um lado da igualdade
2. Isolar os termos numéricos do outro lado
3. Realizar as operações necessárias
4. Dividir ambos os lados pelo coeficiente da incógnita

Exemplo prático:
Resolva: 3x + 5 = 14

Passo 1: Subtrair 5 de ambos os lados
3x + 5 - 5 = 14 - 5
3x = 9

Passo 2: Dividir ambos os lados por 3
3x ÷ 3 = 9 ÷ 3
x = 3

Verificação: Substitua x por 3 na equação original
3(3) + 5 = 9 + 5 = 14 ✓

Dica importante: Sempre verifique sua resposta substituindo o valor encontrado na equação original!`,
        metadata: {
          source: 'Material Teórico Atomize - Matemática',
          topic: 'Álgebra',
          subtopic: 'Equações do Primeiro Grau',
          difficulty: 'básico',
          type: 'teoria',
          targetGrade: ['7º ano', '8º ano'],
        },
      },
      {
        content: `Teorema de Pitágoras

O Teorema de Pitágoras é uma das descobertas mais importantes da geometria. Ele estabelece uma relação entre os lados de um triângulo retângulo.

Enunciado: Em todo triângulo retângulo, o quadrado da hipotenusa é igual à soma dos quadrados dos catetos.

Fórmula: a² = b² + c²

Onde:
- a = hipotenusa (lado oposto ao ângulo reto, o maior lado)
- b e c = catetos (lados que formam o ângulo reto)

Exemplo prático:
Um triângulo retângulo tem catetos medindo 3 cm e 4 cm. Qual é a medida da hipotenusa?

Aplicando o teorema:
a² = 3² + 4²
a² = 9 + 16
a² = 25
a = √25
a = 5 cm

Aplicação no cotidiano:
Imagine que você quer saber a distância em linha reta entre dois pontos em um quarteirão. Se você anda 30 metros para o norte e depois 40 metros para o leste, a distância direta seria:

d² = 30² + 40²
d² = 900 + 1600
d² = 2500
d = 50 metros

Dica para memorizar: O famoso trio 3-4-5 é um exemplo perfeito. Outros trios pitagóricos comuns: 5-12-13, 8-15-17.`,
        metadata: {
          source: 'Material Teórico Atomize - Geometria',
          topic: 'Geometria',
          subtopic: 'Teorema de Pitágoras',
          difficulty: 'intermediário',
          type: 'teoria',
          targetGrade: ['8º ano', '9º ano'],
        },
      },
      {
        content: `Porcentagem - Conceitos e Aplicações

Porcentagem é uma forma de representar uma razão cujo denominador é 100. O símbolo % significa "por cento" ou "dividido por 100".

Conceitos fundamentais:
- 50% = 50/100 = 0,5 = metade
- 25% = 25/100 = 0,25 = um quarto
- 100% = 100/100 = 1 = o todo

Como calcular porcentagem:
Para calcular x% de um valor V:
Resultado = (x/100) × V

Exemplos práticos:

1) Calcular 20% de 250:
   20% de 250 = (20/100) × 250 = 0,2 × 250 = 50

2) Uma loja oferece 15% de desconto em um produto de R$ 80. Qual o valor final?
   Desconto = 15% de 80 = (15/100) × 80 = 12
   Valor final = 80 - 12 = R$ 68

3) Um aluno acertou 17 de 20 questões. Qual sua porcentagem de acertos?
   Porcentagem = (17/20) × 100 = 0,85 × 100 = 85%

Questões de SAEB frequentemente envolvem:
- Desconto e acréscimo
- Proporções em gráficos
- Interpretação de dados percentuais

Dica de ouro: Para calcular mentalmente, use referências:
- 10% → divida por 10
- 5% → metade de 10%
- 1% → divida por 100`,
        metadata: {
          source: 'Material SAEB - Matemática',
          topic: 'Matemática Básica',
          subtopic: 'Porcentagem',
          difficulty: 'básico',
          type: 'teoria',
          targetGrade: ['6º ano', '7º ano', '8º ano'],
          exam: 'SAEB',
        },
      },
    ],
    dra_clarice_lispector: [
      {
        content: `Interpretação de Texto - Estratégias Fundamentais

A interpretação de texto é uma das competências mais importantes cobradas no SAEB e em outras avaliações. Para interpretar bem um texto, você precisa ir além de apenas ler as palavras.

Estratégias essenciais:

1. Identificar o Tema Central
O tema é o assunto principal do texto. Pergunte-se: "Sobre o que o texto está falando?"

2. Reconhecer a Ideia Principal
A ideia principal é a mensagem central que o autor quer transmitir. Geralmente está no início ou no final de parágrafos.

3. Localizar Informações Explícitas
São informações que estão claramente escritas no texto. Você consegue encontrá-las relendo com atenção.

4. Fazer Inferências
Inferir é "ler nas entrelinhas", ou seja, compreender informações que não estão diretamente escritas, mas que podem ser deduzidas pelo contexto.

5. Identificar o Gênero Textual
Notícia, conto, poema, charge, receita... cada gênero tem características próprias que ajudam na interpretação.

Exemplo prático:
"Maria olhou pela janela e viu as nuvens escuras se aproximando. Rapidamente, recolheu as roupas do varal."

Informação explícita: Maria recolheu as roupas do varal.
Inferência: Provavelmente vai chover.

Dica para o SAEB: Sempre volte ao texto! As respostas estão baseadas no que está escrito, não na sua opinião pessoal.`,
        metadata: {
          source: 'Material Teórico Atomize - Português',
          topic: 'Interpretação de Texto',
          subtopic: 'Estratégias de Leitura',
          difficulty: 'básico',
          type: 'teoria',
          targetGrade: ['6º ano', '7º ano', '8º ano', '9º ano'],
          exam: 'SAEB',
        },
      },
      {
        content: `Produção de Texto - Estrutura da Redação

Uma boa redação tem estrutura clara e coerente. A estrutura clássica é dividida em três partes:

INTRODUÇÃO (1 parágrafo)
- Apresente o tema
- Mostre qual será seu posicionamento ou abordagem
- Desperte o interesse do leitor
Dica: Use uma frase impactante, pergunta ou dado relevante

DESENVOLVIMENTO (2 ou 3 parágrafos)
- Apresente seus argumentos
- Use exemplos e dados para sustentar suas ideias
- Cada parágrafo deve tratar de um aspecto diferente
- Use conectivos para ligar as ideias

CONCLUSÃO (1 parágrafo)
- Retome o tema brevemente
- Reforce seu ponto de vista
- Pode propor uma solução ou reflexão final

Conectivos essenciais para uma boa redação:

Para adicionar ideias:
além disso, também, ainda, ademais

Para contrastar:
porém, contudo, entretanto, no entanto, mas

Para explicar/exemplificar:
por exemplo, ou seja, isto é, como

Para concluir:
portanto, assim, logo, em suma, por fim

Exemplo de estrutura:

Introdução: "A educação é a base para o desenvolvimento de uma sociedade. No Brasil, porém, ainda enfrentamos grandes desafios nessa área."

Desenvolvimento: "Em primeiro lugar, a falta de investimento... Além disso, a formação dos professores..."

Conclusão: "Portanto, é fundamental que haja maior investimento e políticas públicas efetivas para garantir educação de qualidade a todos."

Lembre-se: Uma redação bem estruturada facilita a leitura e torna seus argumentos mais convincentes!`,
        metadata: {
          source: 'Material Teórico Atomize - Redação',
          topic: 'Produção Textual',
          subtopic: 'Estrutura de Redação',
          difficulty: 'intermediário',
          type: 'teoria',
          targetGrade: ['8º ano', '9º ano'],
        },
      },
      {
        content: `Concordância Verbal - Regras Essenciais

Concordância verbal é a relação entre o verbo e o sujeito da oração. O verbo deve concordar em número (singular/plural) e pessoa (1ª, 2ª, 3ª) com o sujeito.

Regra básica:
Sujeito singular → verbo singular
Sujeito plural → verbo plural

Exemplos:
✓ O aluno estuda. (singular)
✓ Os alunos estudam. (plural)

Casos especiais que aparecem no SAEB:

1. Sujeito composto (mais de um núcleo)
Quando o sujeito composto vem ANTES do verbo → verbo no plural
"Maria e João estudam juntos."

2. Expressões partitivas (a maioria de, a maior parte de)
O verbo pode concordar com a expressão OU com o complemento
✓ "A maioria dos alunos estuda" 
✓ "A maioria dos alunos estudam"

3. Porcentagem
Concorda com o numeral ou com o complemento
✓ "20% da turma faltou"
✓ "20% dos alunos faltaram"

4. Pronome relativo "que"
O verbo concorda com o antecedente do pronome
"Fui eu que fiz" (eu fiz)
"Fomos nós que fizemos" (nós fizemos)

Erros comuns para evitar:
✗ "Os menino joga bola" → ✓ "Os meninos jogam bola"
✗ "Haviam muitos alunos" → ✓ "Havia muitos alunos" (haver impessoal)

Dica prática: Sempre identifique o sujeito e pergunte "Quem?" ou "O que?" pratica a ação do verbo.`,
        metadata: {
          source: 'Material Teórico Atomize - Gramática',
          topic: 'Gramática',
          subtopic: 'Concordância Verbal',
          difficulty: 'intermediário',
          type: 'teoria',
          targetGrade: ['8º ano', '9º ano'],
        },
      },
    ],
  };

  return documents[agentId] || [];
}
