import { PrismaClient } from '@prisma/client';
import { RetrievedDocument } from '@/types/rag.types';

const prisma = new PrismaClient();

/**
 * Número padrão de documentos a recuperar
 */
const DEFAULT_TOP_K = parseInt(process.env.TOP_K_DOCUMENTS || '5');

/**
 * Busca simplificada por palavras-chave (sem embeddings)
 * Usa busca textual do PostgreSQL (ILIKE)
 */
export async function retrieveDocumentsSimple(
  agentId: string,
  query: string,
  topK: number = DEFAULT_TOP_K
): Promise<RetrievedDocument[]> {
  try {
    console.log(`🔍 Buscando documentos para "${query}" (busca textual simples)`);

    // Extrair palavras-chave da query (palavras com mais de 3 letras)
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5); // Limita a 5 palavras-chave

    console.log(`  Palavras-chave: ${keywords.join(', ')}`);

    // Buscar documentos que contenham qualquer uma das palavras-chave
    const documents = await prisma.agentDocument.findMany({
      where: {
        agentId: agentId,
        OR: keywords.map(keyword => ({
          content: {
            contains: keyword,
            mode: 'insensitive' as const,
          }
        })),
      },
      take: topK,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular "similaridade" simples baseada em quantas palavras-chave aparecem
    const documentsWithScore: RetrievedDocument[] = documents.map(doc => {
      const contentLower = doc.content.toLowerCase();
      const matchCount = keywords.filter(kw => contentLower.includes(kw)).length;
      const similarity = matchCount / keywords.length;

      return {
        id: doc.id,
        content: doc.content,
        metadata: doc.metadata as Record<string, any>,
        similarity: similarity,
      };
    });

    // Ordenar por similaridade
    documentsWithScore.sort((a, b) => b.similarity - a.similarity);

    console.log(`✓ Recuperados ${documentsWithScore.length} documentos (modo textual)`);
    if (documentsWithScore.length > 0) {
      console.log(`  Similarities: ${documentsWithScore.map(d => d.similarity.toFixed(2)).join(', ')}`);
    }

    return documentsWithScore;
  } catch (error) {
    console.error('Erro ao recuperar documentos:', error);
    throw new Error(`Falha no retrieval: ${error}`);
  }
}
