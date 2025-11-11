import { PrismaClient } from '@prisma/client';
import { RAGQuery, RAGResult, RetrievedDocument } from '@/types/rag.types';

const prisma = new PrismaClient();

/**
 * Registra uma query RAG no banco para auditoria
 */
export async function logQuery(
  query: RAGQuery,
  result: RAGResult,
  retrievedDocs: RetrievedDocument[]
): Promise<void> {
  try {
    await prisma.queryLog.create({
      data: {
        agentId: query.agentId,
        userId: query.userId || null,
        question: query.message,
        answer: result.answer,
        retrievedDocIds: retrievedDocs.map((d) => d.id),
        retrievalScores: retrievedDocs.map((d) => d.similarity),
        responseTimeMs: result.responseTimeMs,
        modelUsed: result.modelUsed,
        tokensUsed: result.tokensUsed || null,
      },
    });

    console.log('✓ Query registrada no log');
  } catch (error) {
    console.error('Erro ao registrar log:', error);
    // Não throw - logging não deve quebrar o fluxo principal
  }
}

/**
 * Obtém estatísticas de uso de um agente
 */
export async function getAgentStats(agentId: string) {
  try {
    const stats = await prisma.queryLog.aggregate({
      where: { agentId },
      _count: true,
      _avg: {
        responseTimeMs: true,
        tokensUsed: true,
      },
    });

    const recentQueries = await prisma.queryLog.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        question: true,
        createdAt: true,
        responseTimeMs: true,
      },
    });

    return {
      totalQueries: stats._count,
      avgResponseTime: stats._avg.responseTimeMs,
      avgTokens: stats._avg.tokensUsed,
      recentQueries,
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    throw error;
  }
}

/**
 * Obtém queries recentes de um usuário
 */
export async function getUserQueryHistory(
  userId: string,
  limit: number = 20
) {
  try {
    return await prisma.queryLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        agentId: true,
        question: true,
        answer: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error('Erro ao obter histórico do usuário:', error);
    throw error;
  }
}

export { prisma as loggerPrisma };
