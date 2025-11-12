import AtomizeRAGClient from './atomize-rag-client';

/**
 * Exemplos de uso do SDK AtomizeRAG
 */

// ========================================
// 1. SETUP BÁSICO
// ========================================

// Desenvolvimento (sem API Key)
const clientDev = new AtomizeRAGClient('http://localhost:3000');

// Produção (com API Key)
const clientProd = new AtomizeRAGClient(
  'https://seu-dominio.com',
  'sua-api-key-aqui'
);

// ========================================
// 2. FAZENDO PERGUNTAS
// ========================================

async function exemploBasico() {
  try {
    // Pergunta ao Professor Pitágoras
    const resposta = await clientDev.askPitagoras(
      'O que é uma função quadrática?'
    );

    console.log('📚 Resposta:', resposta.answer);
    console.log('🔍 Fontes utilizadas:', resposta.sources.length);
    console.log('⏱️  Tempo:', resposta.responseTimeMs, 'ms');
    console.log('🤖 Modelo:', resposta.modelUsed);

    // Mostrar fontes
    resposta.sources.forEach((fonte, index) => {
      console.log(`\nFonte ${index + 1}:`);
      console.log(`  Relevância: ${(fonte.similarity * 100).toFixed(1)}%`);
      console.log(`  Origem: ${fonte.metadata.source}`);
    });
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

// ========================================
// 3. USANDO DIFERENTES AGENTES
// ========================================

async function exemploMultiplosAgentes() {
  // Matemática
  const respostaMatematica = await clientDev.askPitagoras(
    'Como calcular a área de um triângulo?'
  );

  // Português
  const respostaPortugues = await clientDev.askClarice(
    'O que é uma metáfora?'
  );

  console.log('🧮 Matemática:', respostaMatematica.answer.substring(0, 100) + '...');
  console.log('📝 Português:', respostaPortugues.answer.substring(0, 100) + '...');
}

// ========================================
// 4. OPÇÕES AVANÇADAS
// ========================================

async function exemploComOpcoes() {
  const resposta = await clientDev.query('professor_pitagoras', 'Explique logaritmos', {
    userId: 'user-12345', // Para tracking
    maxDocuments: 10, // Buscar mais documentos
  });

  console.log('Resposta com 10 documentos:', resposta);
}

// ========================================
// 5. LISTAR AGENTES DISPONÍVEIS
// ========================================

async function exemploListarAgentes() {
  const agentes = await clientDev.listAgents();

  console.log('📋 Agentes disponíveis:');
  agentes.forEach((agente) => {
    console.log(`\n🎓 ${agente.name}`);
    console.log(`   ID: ${agente.id}`);
    console.log(`   Especialidade: ${agente.specialty}`);
    console.log(`   Tópicos: ${agente.topics.join(', ')}`);
  });
}

// ========================================
// 6. TRATAMENTO DE ERROS
// ========================================

async function exemploTratamentoErros() {
  try {
    const resposta = await clientDev.query('agente_invalido', 'teste');
  } catch (error) {
    if (error.statusCode === 404) {
      console.error('❌ Agente não encontrado!');
      console.error('Agentes disponíveis:', error.details.availableAgents);
    } else if (error.statusCode === 429) {
      console.error('⏳ Muitas requisições! Tente novamente mais tarde.');
    } else if (error.statusCode === 401) {
      console.error('🔒 API Key inválida!');
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

// ========================================
// 7. INTEGRAÇÃO COM REACT
// ========================================

// Hook customizado para React
import { useState } from 'react';

export function useAtomizeRAG() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resposta, setResposta] = useState<any>(null);

  const client = new AtomizeRAGClient('http://localhost:3000');

  const perguntar = async (agentId: string, message: string) => {
    setLoading(true);
    setError(null);
    setResposta(null);

    try {
      const resultado = await client.query(agentId, message);
      setResposta(resultado);
      return resultado;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { perguntar, loading, error, resposta };
}

// Componente React
function ChatComponent() {
  const { perguntar, loading, error, resposta } = useAtomizeRAG();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pergunta = (e.target as any).pergunta.value;
    await perguntar('professor_pitagoras', pergunta);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="pergunta" placeholder="Faça sua pergunta..." />
        <button disabled={loading}>
          {loading ? 'Carregando...' : 'Perguntar'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {resposta && (
        <div className="resposta">
          <h3>Resposta:</h3>
          <p>{resposta.answer}</p>

          <h4>Fontes ({resposta.sources.length}):</h4>
          <ul>
            {resposta.sources.map((fonte: any, i: number) => (
              <li key={i}>
                {fonte.metadata.source} - {(fonte.similarity * 100).toFixed(1)}% relevante
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ========================================
// 8. INTEGRAÇÃO COM BACKEND (Express)
// ========================================

/*
import express from 'express';
import AtomizeRAGClient from './atomize-rag-client';

const app = express();
app.use(express.json());

const ragClient = new AtomizeRAGClient(
  'https://seu-dominio.com',
  process.env.ATOMIZE_API_KEY
);

app.post('/api/chat', async (req, res) => {
  try {
    const { message, agentId } = req.body;
    const resposta = await ragClient.query(agentId, message);
    res.json(resposta);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message
    });
  }
});

app.listen(3001, () => {
  console.log('Server rodando na porta 3001');
});
*/

// ========================================
// EXECUTAR EXEMPLOS
// ========================================

async function main() {
  console.log('🚀 Exemplos de uso do SDK AtomizeRAG\n');

  await exemploBasico();
  console.log('\n' + '='.repeat(50) + '\n');

  await exemploListarAgentes();
}

// Executar se for o arquivo principal
if (require.main === module) {
  main().catch(console.error);
}

export {
  exemploBasico,
  exemploMultiplosAgentes,
  exemploComOpcoes,
  exemploListarAgentes,
  exemploTratamentoErros,
};
