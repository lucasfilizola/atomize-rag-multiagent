import { AgentConfig } from '@/types/rag.types';
import { professorPitagoras } from './professorPitagoras';
import { draClariceLispector } from './draClariceLispector';

/**
 * Registro central de todos os agentes disponíveis
 */
export const AGENTS: Record<string, AgentConfig> = {
  professor_pitagoras: professorPitagoras,
  dra_clarice_lispector: draClariceLispector,
};

/**
 * Lista de IDs de agentes disponíveis
 */
export const AGENT_IDS = Object.keys(AGENTS);

/**
 * Obtém a configuração de um agente pelo ID
 */
export function getAgentConfig(agentId: string): AgentConfig | null {
  return AGENTS[agentId] || null;
}

/**
 * Valida se um ID de agente existe
 */
export function isValidAgentId(agentId: string): boolean {
  return agentId in AGENTS;
}

/**
 * Retorna lista de todos os agentes disponíveis
 */
export function getAllAgents(): AgentConfig[] {
  return Object.values(AGENTS);
}
