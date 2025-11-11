/**
 * Script de ingestão simplificado - SEM embeddings
 * Apenas salva os documentos no banco para busca textual
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface DocumentMetadata {
  title?: string;
  agent?: string;
  topic?: string;
  difficulty?: string;
  source?: string;
  [key: string]: any;
}

/**
 * Extrai metadados YAML do início do arquivo markdown
 */
function extractYAMLMetadata(content: string): {
  metadata: DocumentMetadata;
  contentWithoutMetadata: string;
} {
  const yamlRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(yamlRegex);

  if (!match) {
    return { metadata: {}, contentWithoutMetadata: content };
  }

  const yamlContent = match[1];
  const contentWithoutMetadata = content.replace(match[0], '');

  // Parse manual simples do YAML
  const metadata: DocumentMetadata = {};
  const lines = yamlContent.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Remove aspas
    value = value.replace(/^["']|["']$/g, '');

    metadata[key] = value;
  }

  return { metadata, contentWithoutMetadata };
}

/**
 * Divide o texto em chunks menores
 */
function chunkText(text: string, chunkSize: number = 800, overlap: number = 200): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = '';

  for (const para of paragraphs) {
    if ((currentChunk + para).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Overlap: mantém últimas palavras
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 5)).join(' ');
      currentChunk = overlapWords + '\n\n' + para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Lê arquivos recursivamente de uma pasta
 */
function readFilesRecursively(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      readFilesRecursively(filePath, fileList);
    } else if (file.endsWith('.md') || file.endsWith('.txt')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Processa e ingere documentos SEM gerar embeddings
 */
async function ingestFromFilesSimple() {
  const dataPath = path.join(process.cwd(), 'data', 'olimpiadas');

  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Pasta não encontrada: ${dataPath}`);
    return;
  }

  const files = readFilesRecursively(dataPath);
  console.log(`\n📚 Encontrados ${files.length} arquivos para processar\n`);

  let totalChunks = 0;

  for (const filePath of files) {
    console.log(`📄 Processando: ${path.basename(filePath)}`);

    const content = fs.readFileSync(filePath, 'utf-8');
    const { metadata, contentWithoutMetadata } = extractYAMLMetadata(content);

    // Usar agentId do metadata ou inferir do caminho
    let agentId = metadata.agent || 'professor_pitagoras';
    if (filePath.includes('portugues')) {
      agentId = 'dra_clarice_lispector';
    }

    // Dividir em chunks
    const chunks = chunkText(contentWithoutMetadata);

    console.log(`   → ${chunks.length} chunks`);
    console.log(`   → Agente: ${agentId}`);

    // Salvar cada chunk no banco (SEM embedding)
    for (let i = 0; i < chunks.length; i++) {
      await prisma.agentDocument.create({
        data: {
          agentId: agentId,
          content: chunks[i],
          metadata: {
            ...metadata,
            source: path.basename(filePath),
            chunkIndex: i,
            totalChunks: chunks.length,
          },
          embedding: null, // SEM embedding por enquanto
        },
      });

      totalChunks++;
    }

    console.log(`   ✅ Salvo no banco\n`);
  }

  console.log(`\n🎉 Ingestão concluída!`);
  console.log(`   Total de chunks salvos: ${totalChunks}`);
  console.log(`\n⚠️  Modo DEMO: Documentos salvos sem embeddings`);
  console.log(`   Para busca vetorial completa, adicione créditos OpenAI e rode: npm run ingest:files\n`);
}

// Executar
ingestFromFilesSimple()
  .catch((error) => {
    console.error('❌ Erro na ingestão:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
