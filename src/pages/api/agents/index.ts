import { NextApiRequest, NextApiResponse } from 'next';
import { getAllAgents } from '@/agents/config';

/**
 * Endpoint para listar todos os agentes disponíveis
 * GET /api/agents
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const agents = getAllAgents();
    
    const agentsList = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      displayName: agent.displayName,
      description: agent.description,
      avatar: agent.avatar,
      specialty: agent.specialty,
      exampleQuestions: agent.exampleQuestions,
      metadata: agent.metadata,
    }));

    return res.status(200).json({ agents: agentsList });
  } catch (error: any) {
    console.error('Erro ao listar agentes:', error);
    return res.status(500).json({
      error: 'Erro ao carregar agentes',
      message: error.message,
    });
  }
}
