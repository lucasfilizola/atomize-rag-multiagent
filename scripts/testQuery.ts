import { generateEmbedding } from '../src/rag/embeddings/embeddings';
import { retrieveDocuments } from '../src/rag/retriever/retriever';
import { generateAnswer } from '../src/rag/generator/generator';
import { getAgentConfig } from '../src/agents/config';

/**
 * Script para testar o fluxo RAG completo
 * Simula uma query end-to-end
 */
async function testQuery() {
  const agentId = 'professor_pitagoras';
  const query = 'Como resolver equações do primeiro grau?';

  console.log('🧪 Teste de Query RAG\n');
  console.log(`Agent: ${agentId}`);
  console.log(`Query: "${query}"\n`);

  try {
    // 1. Obter configuração do agente
    const agentConfig = getAgentConfig(agentId);
    if (!agentConfig) {
      throw new Error('Agente não encontrado');
    }
    console.log(`✓ Agente carregado: ${agentConfig.name}\n`);

    // 2. Testar geração de embedding
    console.log('⏳ Gerando embedding da query...');
    const embedding = await generateEmbedding(query);
    console.log(`✓ Embedding gerado: ${embedding.length} dimensões\n`);

    // 3. Testar retrieval
    console.log('⏳ Buscando documentos relevantes...');
    const docs = await retrieveDocuments(agentId, query, 3);
    console.log(`✓ Recuperados ${docs.length} documentos:`);
    docs.forEach((doc, i) => {
      console.log(`   ${i + 1}. Similaridade: ${(doc.similarity * 100).toFixed(1)}%`);
      console.log(`      Tópico: ${doc.metadata.topic || 'N/A'}`);
      console.log(`      Conteúdo: ${doc.content.substring(0, 100)}...\n`);
    });

    // 4. Testar geração
    console.log('⏳ Gerando resposta com Claude...');
    const result = await generateAnswer(agentConfig, query, docs);
    console.log(`✓ Resposta gerada (${result.tokensUsed} tokens):\n`);
    console.log('─'.repeat(80));
    console.log(result.answer);
    console.log('─'.repeat(80));

    console.log('\n\n✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro no teste:', error);
    process.exit(1);
  }
}

testQuery()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
