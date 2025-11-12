/**
 * SDK Client para integração com API RAG Atomize
 * @version 1.0.0
 */

export interface QueryOptions {
  userId?: string;
  maxDocuments?: number;
}

export interface Source {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
  responseTimeMs: number;
  modelUsed: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  specialty: string;
  topics: string[];
}

export class AtomizeRAGClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  /**
   * Faz uma pergunta a um agente
   */
  async query(
    agentId: string,
    message: string,
    options?: QueryOptions
  ): Promise<QueryResponse> {
    const response = await this.request('/api/agents/query', {
      method: 'POST',
      body: JSON.stringify({
        agentId,
        message,
        ...options,
      }),
    });

    return response;
  }

  /**
   * Consulta o Professor Pitágoras (Matemática)
   */
  async askPitagoras(
    message: string,
    options?: QueryOptions
  ): Promise<QueryResponse> {
    return this.query('professor_pitagoras', message, options);
  }

  /**
   * Consulta a Dra. Clarice (Português)
   */
  async askClarice(
    message: string,
    options?: QueryOptions
  ): Promise<QueryResponse> {
    return this.query('dra_clarice_lispector', message, options);
  }

  /**
   * Lista agentes disponíveis
   */
  async listAgents(): Promise<AgentInfo[]> {
    try {
      const response = await this.request('/api/agents');
      return response.agents;
    } catch (error) {
      // Fallback caso o endpoint não exista
      return [
        {
          id: 'professor_pitagoras',
          name: 'Professor Pitágoras',
          specialty: 'Matemática para Ensino Fundamental II, SAEB e Olimpíadas',
          topics: ['geometria', 'algebra', 'aritmetica', 'combinatoria'],
        },
        {
          id: 'dra_clarice_lispector',
          name: 'Dra. Clarice Lispector',
          specialty: 'Língua Portuguesa: leitura, interpretação, produção textual',
          topics: ['interpretacao', 'gramatica', 'redacao', 'literatura'],
        },
      ];
    }
  }

  /**
   * Método interno para fazer requisições
   */
  private async request(endpoint: string, options?: RequestInit): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AtomizeRAGError(
        data.error || 'Erro desconhecido',
        response.status,
        data
      );
    }

    return data;
  }
}

/**
 * Classe de erro customizada
 */
export class AtomizeRAGError extends Error {
  public statusCode: number;
  public details: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'AtomizeRAGError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Export default para facilitar importação
export default AtomizeRAGClient;
