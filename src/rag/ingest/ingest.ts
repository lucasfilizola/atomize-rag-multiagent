import { PrismaClient } from '@prisma/client';
import { generateEmbeddingsBatch } from '../embeddings/embeddings';
import { createDocumentChunks, loadSampleDocuments } from './chunker';
import { AGENT_IDS } from '@/agents/config';

const prisma = new PrismaClient();

/**
 * Script principal de ingestão de documentos RAG
 * Processa documentos, gera embeddings e armazena no PostgreSQL com pgvector
 */
async function ingestDocuments() {
  console.log('🚀 Iniciando ingestão de documentos RAG...\n');

  try {
    for (const agentId of AGENT_IDS) {
      console.log(`\n📚 Processando documentos para: ${agentId}`);
      
      // 1. Carregar documentos fonte
      const sourceDocuments = loadSampleDocuments(agentId);
      console.log(`   ✓ ${sourceDocuments.length} documentos carregados`);

      // 2. Criar chunks
      const chunks = createDocumentChunks(agentId, sourceDocuments);
      console.log(`   ✓ ${chunks.length} chunks criados`);

      // 3. Gerar embeddings
      console.log(`   ⏳ Gerando embeddings...`);
      const texts = chunks.map(c => c.content);
      const embeddings = await generateEmbeddingsBatch(texts);
      console.log(`   ✓ ${embeddings.length} embeddings gerados`);

      // 4. Limpar documentos antigos deste agente
      const deleted = await prisma.agentDocument.deleteMany({
        where: { agentId },
      });
      console.log(`   ✓ ${deleted.count} documentos antigos removidos`);

      // 5. Inserir novos documentos
      console.log(`   ⏳ Inserindo no banco de dados...`);
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = embeddings[i];

        await prisma.$executeRaw`
          INSERT INTO agent_documents (id, agent_id, content, metadata, embedding, created_at, updated_at)
          VALUES (
            gen_random_uuid(),
            ${chunk.agentId},
            ${chunk.content},
            ${JSON.stringify(chunk.metadata)}::jsonb,
            ${`[${embedding.join(',')}]`}::vector,
            NOW(),
            NOW()
          )
        `;
      }
      console.log(`   ✅ ${chunks.length} documentos inseridos com sucesso!`);
    }

    console.log('\n\n🎉 Ingestão concluída com sucesso!');
    console.log('\n📊 Resumo:');
    
    for (const agentId of AGENT_IDS) {
      const count = await prisma.agentDocument.count({
        where: { agentId },
      });
      console.log(`   - ${agentId}: ${count} documentos`);
    }

  } catch (error) {
    console.error('\n❌ Erro durante ingestão:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  ingestDocuments()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { ingestDocuments };
