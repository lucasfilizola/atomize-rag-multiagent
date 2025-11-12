import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { generateEmbeddingsBatch } from '../src/rag/embeddings/embeddings';
import { chunkText } from '../src/rag/ingest/chunker';

const prisma = new PrismaClient();

/**
 * Script para ingerir documentos da pasta data/olimpiadas
 * Lê arquivos .md e .txt e processa automaticamente
 */

interface FileMetadata {
  disciplina?: string;
  olimpiada?: string;
  nivel?: string;
  topico?: string;
  dificuldade?: string;
}

/**
 * Extrai metadados YAML do início do arquivo (se existir)
 */
function extractYAMLMetadata(content: string): { metadata: FileMetadata; content: string } {
  const yamlRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(yamlRegex);

  if (!match) {
    return { metadata: {}, content };
  }

  const yamlContent = match[1];
  const metadata: FileMetadata = {};

  // Parse simples de YAML (key: value)
  yamlContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      metadata[key.trim() as keyof FileMetadata] = value;
    }
  });

  // Remove YAML do conteúdo
  const cleanContent = content.replace(yamlRegex, '').trim();

  return { metadata, content: cleanContent };
}

/**
 * Determina o agentId baseado na disciplina
 */
function getAgentIdFromDisciplina(disciplina: string): string {
  const normalized = disciplina.toLowerCase();
  
  if (normalized.includes('matemática') || normalized.includes('matematica')) {
    return 'professor_pitagoras';
  }
  
  if (normalized.includes('português') || normalized.includes('portugues') || 
      normalized.includes('redação') || normalized.includes('redacao')) {
    return 'dra_clarice_lispector';
  }
  
  // Default para novos agentes de ciências
  if (normalized.includes('ciências') || normalized.includes('ciencias') ||
      normalized.includes('física') || normalized.includes('fisica') ||
      normalized.includes('química') || normalized.includes('quimica') ||
      normalized.includes('biologia') || normalized.includes('astronomia')) {
    // Se você criar o agente de ciências, retorne aqui
    // Por enquanto, vamos para Matemática como fallback
    return 'professor_pitagoras';
  }
  
  return 'professor_pitagoras'; // Default
}

/**
 * Lê recursivamente todos os arquivos .md e .txt de um diretório
 */
function readFilesRecursively(dir: string): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...readFilesRecursively(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      files.push({ path: fullPath, content });
    }
  }

  return files;
}

/**
 * Ingestão principal
 */
async function ingestFromFiles() {
  console.log('🚀 Iniciando ingestão de arquivos da pasta data/olimpiadas...\n');

  const dataDir = path.join(process.cwd(), 'data', 'olimpiadas');

  // Verificar se o diretório existe
  if (!fs.existsSync(dataDir)) {
    console.error('❌ Diretório data/olimpiadas não encontrado!');
    console.log('💡 Crie o diretório e adicione seus materiais.');
    process.exit(1);
  }

  // Ler todos os arquivos
  console.log(`📂 Lendo arquivos de: ${dataDir}`);
  const files = readFilesRecursively(dataDir);

  if (files.length === 0) {
    console.log('⚠️  Nenhum arquivo .md ou .txt encontrado!');
    console.log('💡 Adicione seus materiais em data/olimpiadas/');
    process.exit(0);
  }

  console.log(`✓ ${files.length} arquivos encontrados\n`);

  // Agrupar por agente
  const documentsByAgent: Record<string, Array<{ content: string; metadata: any }>> = {};

  for (const file of files) {
    const { metadata, content } = extractYAMLMetadata(file.content);
    
    // Determinar agente
    const agentId = metadata.disciplina 
      ? getAgentIdFromDisciplina(metadata.disciplina)
      : 'professor_pitagoras'; // Default

    // Extrair info do caminho
    const relativePath = path.relative(dataDir, file.path);
    const [categoria] = relativePath.split(path.sep);

    const fullMetadata = {
      source: `Olimpíadas - ${relativePath}`,
      categoria: categoria || 'geral',
      filename: path.basename(file.path),
      type: 'olimpiada' as const,
      ...metadata,
    };

    if (!documentsByAgent[agentId]) {
      documentsByAgent[agentId] = [];
    }

    documentsByAgent[agentId].push({
      content,
      metadata: fullMetadata,
    });

    console.log(`  📄 ${relativePath} → ${agentId}`);
  }

  console.log('\n');

  // Processar por agente
  for (const [agentId, documents] of Object.entries(documentsByAgent)) {
    console.log(`\n📚 Processando ${documents.length} documentos para: ${agentId}`);

    // Criar chunks
    const allChunks: Array<{ content: string; metadata: any }> = [];
    
    for (const doc of documents) {
      const chunks = chunkText(doc.content);
      chunks.forEach((chunk, index) => {
        allChunks.push({
          content: chunk,
          metadata: {
            ...doc.metadata,
            chunkIndex: index,
            totalChunks: chunks.length,
          },
        });
      });
    }

    console.log(`   ✓ ${allChunks.length} chunks criados`);

    // Gerar embeddings
    console.log(`   ⏳ Gerando embeddings...`);
    const texts = allChunks.map((c) => c.content);
    const embeddings = await generateEmbeddingsBatch(texts);
    console.log(`   ✓ ${embeddings.length} embeddings gerados`);

    // Inserir no banco (sem deletar documentos antigos - apenas adiciona)
    console.log(`   ⏳ Inserindo no banco de dados...`);
    for (let i = 0; i < allChunks.length; i++) {
      const chunk = allChunks[i];
      const embedding = embeddings[i];

      // Converter embedding para string no formato pgvector
      const embeddingString = `[${embedding.join(',')}]`;

      await prisma.$executeRawUnsafe(`
        INSERT INTO agent_documents (id, agent_id, content, metadata, embedding, created_at, updated_at)
        VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3::jsonb,
          $4::vector,
          NOW(),
          NOW()
        )
      `, agentId, chunk.content, JSON.stringify(chunk.metadata), embeddingString);
    }

    console.log(`   ✅ ${allChunks.length} documentos inseridos!`);
  }

  console.log('\n\n🎉 Ingestão concluída com sucesso!');
  console.log('\n📊 Resumo final:');

  // Mostrar contagem total por agente
  for (const agentId of Object.keys(documentsByAgent)) {
    const count = await prisma.agentDocument.count({
      where: { agentId },
    });
    console.log(`   - ${agentId}: ${count} documentos no total`);
  }

  await prisma.$disconnect();
}

// Executar
if (require.main === module) {
  ingestFromFiles()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erro:', error);
      process.exit(1);
    });
}

export { ingestFromFiles };
