import OpenAI from 'openai';

/**
 * Cliente OpenAI para geração de embeddings
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Modelo de embedding padrão
 */
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Gera embedding para um texto usando OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    throw new Error(`Falha ao gerar embedding: ${error}`);
  }
}

/**
 * Gera embeddings em batch para múltiplos textos
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  batchSize: number = 100
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batch,
        encoding_format: 'float',
      });

      embeddings.push(...response.data.map(d => d.embedding));
      
      console.log(`✓ Processados ${Math.min(i + batchSize, texts.length)}/${texts.length} embeddings`);
    } catch (error) {
      console.error(`Erro no batch ${i}-${i + batchSize}:`, error);
      throw error;
    }

    // Rate limiting: pequena pausa entre batches
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return embeddings;
}

/**
 * Calcula similaridade de cosseno entre dois vetores
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
