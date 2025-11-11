import { PrismaClient } from '@prisma/client';
import { generateEmbedding } from '../embeddings/embeddings';
import { RetrievedDocument } from '@/types/rag.types';

const prisma = new PrismaClient();

/**
 * Número padrão de documentos a recuperar
 */
const DEFAULT_TOP_K = parseInt(process.env.TOP_K_DOCUMENTS || '5');

/**
 * Interface para resultado da busca vetorial bruta
 */
interface VectorSearchResult {
  id: string;
  agent_id: string;
  content: string;
  metadata: any;
  similarity: number;
}

/**
 * Busca os top-k documentos mais similares usando pgvector
 * Utiliza similaridade de cosseno (vector_cosine_ops)
 */
export async function retrieveDocuments(
  agentId: string,
  query: string,
  topK: number = DEFAULT_TOP_K
): Promise<RetrievedDocument[]> {
  try {
    // 1. Gerar embedding da query
    const queryEmbedding = await generateEmbedding(query);
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // 2. Buscar documentos similares usando pgvector
    // Usa operador de distância de cosseno (<=>)
    // Quanto menor a distância, maior a similaridade
    const results = await prisma.$queryRaw<VectorSearchResult[]>`
      SELECT 
        id,
        agent_id,
        content,
        metadata,
        1 - (embedding <=> ${embeddingString}::vector) as similarity
      FROM agent_documents
      WHERE agent_id = ${agentId}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${embeddingString}::vector
      LIMIT ${topK}
    `;

    // 3. Transformar resultados para o formato esperado
    const documents: RetrievedDocument[] = results.map((result) => ({
      id: result.id,
      content: result.content,
      metadata: result.metadata,
      similarity: result.similarity,
    }));

    console.log(`✓ Recuperados ${documents.length} documentos para agente ${agentId}`);
    console.log(`  Similarities: ${documents.map(d => d.similarity.toFixed(3)).join(', ')}`);

    return documents;
  } catch (error) {
    console.error('Erro ao recuperar documentos:', error);
    throw new Error(`Falha no retrieval: ${error}`);
  }
}

/**
 * Busca híbrida: combina busca vetorial com filtros de metadata
 */
export async function retrieveDocumentsWithFilters(
  agentId: string,
  query: string,
  filters: {
    topic?: string;
    difficulty?: string;
    type?: string;
    targetGrade?: string[];
  },
  topK: number = DEFAULT_TOP_K
): Promise<RetrievedDocument[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // Construir cláusula WHERE dinâmica baseada nos filtros
    let whereConditions = [`agent_id = '${agentId}'`, 'embedding IS NOT NULL'];

    if (filters.topic) {
      whereConditions.push(`metadata->>'topic' = '${filters.topic}'`);
    }
    if (filters.difficulty) {
      whereConditions.push(`metadata->>'difficulty' = '${filters.difficulty}'`);
    }
    if (filters.type) {
      whereConditions.push(`metadata->>'type' = '${filters.type}'`);
    }

    const whereClause = whereConditions.join(' AND ');

    const results = await prisma.$queryRaw<VectorSearchResult[]>`
      SELECT 
        id,
        agent_id,
        content,
        metadata,
        1 - (embedding <=> ${embeddingString}::vector) as similarity
      FROM agent_documents
      WHERE ${prisma.$queryRawUnsafe(whereClause)}
      ORDER BY embedding <=> ${embeddingString}::vector
      LIMIT ${topK}
    `;

    return results.map((result) => ({
      id: result.id,
      content: result.content,
      metadata: result.metadata,
      similarity: result.similarity,
    }));
  } catch (error) {
    console.error('Erro ao recuperar documentos com filtros:', error);
    throw new Error(`Falha no retrieval filtrado: ${error}`);
  }
}

/**
 * Formata documentos recuperados para inclusão no prompt
 */
export function formatRetrievedDocuments(documents: RetrievedDocument[]): string {
  if (documents.length === 0) {
    return 'Nenhum documento relevante encontrado na base de conhecimento.';
  }

  let formatted = 'CONTEXTO RECUPERADO DOS MATERIAIS ATOMIZE:\n\n';

  documents.forEach((doc, index) => {
    const source = doc.metadata.source || 'Fonte não especificada';
    const topic = doc.metadata.topic || '';
    const subtopic = doc.metadata.subtopic || '';

    formatted += `--- Documento ${index + 1} ---\n`;
    formatted += `Fonte: ${source}\n`;
    if (topic) formatted += `Tópico: ${topic}\n`;
    if (subtopic) formatted += `Subtópico: ${subtopic}\n`;
    formatted += `Relevância: ${(doc.similarity * 100).toFixed(1)}%\n\n`;
    formatted += `${doc.content}\n\n`;
  });

  return formatted;
}

export { prisma as retrieverPrisma };
