/**
 * Tipos e interfaces para o sistema RAG multi-agente
 */

/**
 * Configuração de um agente especializado
 */
export interface AgentConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  avatar: string;
  specialty: string[];
  tone: string;
  systemPrompt: string;
  exampleQuestions: string[];
  metadata: {
    targetAudience: string;
    educationLevel: string[];
    focus: string[];
  };
}

/**
 * Query enviada para o sistema RAG
 */
export interface RAGQuery {
  agentId: string;
  userId?: string;
  message: string;
  maxDocuments?: number;
}

/**
 * Documento recuperado do vector store
 */
export interface RetrievedDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

/**
 * Resultado de uma query RAG
 */
export interface RAGResult {
  agentId: string;
  answer: string;
  sources: RetrievedDocument[];
  responseTimeMs: number;
  tokensUsed?: number;
  modelUsed: string;
}

/**
 * Chunk de documento para ingestão
 */
export interface DocumentChunk {
  agentId: string;
  content: string;
  metadata: {
    source: string;
    topic?: string;
    difficulty?: string;
    type?: 'teoria' | 'exercicio' | 'questao' | 'exemplo';
    [key: string]: any;
  };
}

/**
 * Configuração de embedding
 */
export interface EmbeddingConfig {
  model: string;
  dimensions: number;
  provider: 'openai' | 'anthropic';
}
