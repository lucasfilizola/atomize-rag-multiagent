import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getAgentConfig, isValidAgentId } from '@/agents/config';
import { retrieveDocuments } from '@/rag/retriever/retriever';
import { generateAnswer } from '@/rag/generator/generator';
import { logQuery } from '@/rag/logger/logger';
import { RAGQuery, RAGResult } from '@/types/rag.types';

/**
 * Schema de validação da requisição
 */
const QueryRequestSchema = z.object({
  agentId: z.string().min(1),
  userId: z.string().optional(),
  message: z.string().min(1).max(2000),
  maxDocuments: z.number().int().positive().max(10).optional(),
});

/**
 * Endpoint principal para queries RAG
 * POST /api/agents/query
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const startTime = Date.now();

  try {
    // 1. Validar entrada
    const validation = QueryRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validation.error.errors,
      });
    }

    const query: RAGQuery = validation.data;

    // 2. Validar agente
    if (!isValidAgentId(query.agentId)) {
      return res.status(404).json({
        error: 'Agente não encontrado',
        availableAgents: ['professor_pitagoras', 'dra_clarice_lispector'],
      });
    }

    const agentConfig = getAgentConfig(query.agentId)!;
    console.log(`\n🎯 Nova query para: ${agentConfig.name}`);
    console.log(`   Pergunta: "${query.message}"`);

    // 3. RETRIEVAL - Buscar documentos relevantes
    const topK = query.maxDocuments || 5;
    const retrievedDocs = await retrieveDocuments(
      query.agentId,
      query.message,
      topK
    );

    if (retrievedDocs.length === 0) {
      return res.status(503).json({
        error: 'Base de conhecimento vazia',
        message: 'Nenhum documento encontrado para este agente. Execute a ingestão primeiro.',
      });
    }

    // 4. GENERATION - Gerar resposta com Claude
    const generation = await generateAnswer(
      agentConfig,
      query.message,
      retrievedDocs
    );

    // 5. Preparar resultado
    const responseTimeMs = Date.now() - startTime;
    const result: RAGResult = {
      agentId: query.agentId,
      answer: generation.answer,
      sources: retrievedDocs.map((doc) => ({
        id: doc.id,
        content: doc.content.substring(0, 200) + '...', // Truncar para response
        metadata: doc.metadata,
        similarity: doc.similarity,
      })),
      responseTimeMs,
      tokensUsed: generation.tokensUsed,
      modelUsed: generation.modelUsed,
    };

    // 6. LOG (assíncrono, não bloqueia resposta)
    logQuery(query, result, retrievedDocs).catch((err) =>
      console.error('Erro ao logar:', err)
    );

    console.log(`✅ Resposta enviada em ${responseTimeMs}ms\n`);

    // 7. Retornar resultado
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Erro no handler:', error);

    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message || 'Erro desconhecido',
    });
  }
}
