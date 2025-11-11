import Anthropic from '@anthropic-ai/sdk';
import { AgentConfig } from '@/types/rag.types';
import { RetrievedDocument } from '@/types/rag.types';
import { formatRetrievedDocuments } from '../retriever/retriever';

/**
 * Cliente Anthropic para Claude
 */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Modelo Claude padrão
 */
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5';

/**
 * Interface para o resultado da geração
 */
export interface GenerationResult {
  answer: string;
  tokensUsed: number;
  modelUsed: string;
}

/**
 * Monta o prompt completo com contexto RAG
 */
function buildRAGPrompt(
  agentConfig: AgentConfig,
  query: string,
  retrievedDocs: RetrievedDocument[]
): { system: string; user: string } {
  // System prompt com instruções do agente
  const systemPrompt = agentConfig.systemPrompt;

  // Context com documentos recuperados
  const context = formatRetrievedDocuments(retrievedDocs);

  // User prompt combinando contexto + pergunta
  const userPrompt = `${context}

---

PERGUNTA DO ALUNO:
${query}

Por favor, responda à pergunta do aluno utilizando APENAS as informações do contexto fornecido acima. Se a informação não estiver no contexto, seja honesto sobre isso e ofereça orientação geral quando apropriado.`;

  return {
    system: systemPrompt,
    user: userPrompt,
  };
}

/**
 * Gera resposta usando Claude Sonnet 3.5 com contexto RAG
 */
export async function generateAnswer(
  agentConfig: AgentConfig,
  query: string,
  retrievedDocs: RetrievedDocument[],
  maxTokens: number = 2048
): Promise<GenerationResult> {
  try {
    const { system, user } = buildRAGPrompt(agentConfig, query, retrievedDocs);

    console.log(`\n🤖 Gerando resposta com ${CLAUDE_MODEL}...`);
    console.log(`   Agente: ${agentConfig.name}`);
    console.log(`   Documentos no contexto: ${retrievedDocs.length}`);

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      temperature: 0.7,
      system: system,
      messages: [
        {
          role: 'user',
          content: user,
        },
      ],
    });

    // Extrair texto da resposta
    const answer = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as any).text)
      .join('\n');

    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    console.log(`   ✓ Resposta gerada (${tokensUsed} tokens)`);

    return {
      answer,
      tokensUsed,
      modelUsed: CLAUDE_MODEL,
    };
  } catch (error) {
    console.error('Erro ao gerar resposta:', error);
    throw new Error(`Falha na geração: ${error}`);
  }
}

/**
 * Gera resposta com streaming (para implementação futura em tempo real)
 */
export async function generateAnswerStream(
  agentConfig: AgentConfig,
  query: string,
  retrievedDocs: RetrievedDocument[],
  onChunk: (chunk: string) => void,
  maxTokens: number = 2048
): Promise<GenerationResult> {
  try {
    const { system, user } = buildRAGPrompt(agentConfig, query, retrievedDocs);

    const stream = await anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      temperature: 0.7,
      system: system,
      messages: [
        {
          role: 'user',
          content: user,
        },
      ],
    });

    let fullAnswer = '';

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        const text = chunk.delta.text;
        fullAnswer += text;
        onChunk(text);
      }
    }

    const finalMessage = await stream.finalMessage();
    const tokensUsed =
      finalMessage.usage.input_tokens + finalMessage.usage.output_tokens;

    return {
      answer: fullAnswer,
      tokensUsed,
      modelUsed: CLAUDE_MODEL,
    };
  } catch (error) {
    console.error('Erro ao gerar resposta com streaming:', error);
    throw new Error(`Falha na geração em stream: ${error}`);
  }
}

/**
 * Valida se a resposta está adequada
 */
export function validateAnswer(answer: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!answer || answer.trim().length === 0) {
    issues.push('Resposta vazia');
  }

  if (answer.length < 50) {
    issues.push('Resposta muito curta');
  }

  // Detectar respostas genéricas que ignoraram o contexto
  const genericPhrases = [
    'não tenho acesso',
    'como modelo de linguagem',
    'não posso acessar',
  ];

  for (const phrase of genericPhrases) {
    if (answer.toLowerCase().includes(phrase)) {
      issues.push(`Resposta genérica detectada: "${phrase}"`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
