'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '@/styles/Agents.module.css';

interface Agent {
  id: string;
  name: string;
  displayName: string;
  description: string;
  avatar: string;
  specialty: string[];
  exampleQuestions: string[];
}

interface Message {
  role: 'user' | 'agent';
  content: string;
  agentName?: string;
  sources?: any[];
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar agentes disponíveis
  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => {
        setAgents(data.agents);
        if (data.agents.length > 0) {
          setSelectedAgent(data.agents[0]);
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar agentes:', err);
        setError('Erro ao carregar agentes');
      });
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedAgent || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agents/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: input,
          userId: 'demo-user', // Em produção, viria do auth
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao processar pergunta');
      }

      const result = await response.json();

      const agentMessage: Message = {
        role: 'agent',
        content: result.answer,
        agentName: selectedAgent.name,
        sources: result.sources,
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao processar pergunta');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleQuestion = (question: string) => {
    setInput(question);
  };

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([]);
    setInput('');
  };

  return (
    <>
      <Head>
        <title>Agentes Atomize - RAG Multi-Agente</title>
        <meta name="description" content="Assistentes especializados da Atomize" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>🎓 Agentes Atomize</h1>
          <p>Assistentes especializados para apoiar seus estudos</p>
        </header>

        <div className={styles.mainContent}>
          {/* Sidebar com seleção de agentes */}
          <aside className={styles.sidebar}>
            <h2>Escolha seu assistente</h2>
            <div className={styles.agentsList}>
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`${styles.agentCard} ${
                    selectedAgent?.id === agent.id ? styles.active : ''
                  }`}
                  onClick={() => handleSelectAgent(agent)}
                >
                  <div className={styles.agentAvatar}>{agent.avatar}</div>
                  <div className={styles.agentInfo}>
                    <h3>{agent.displayName}</h3>
                    <p>{agent.description}</p>
                    <div className={styles.specialties}>
                      {agent.specialty.slice(0, 2).map((s) => (
                        <span key={s} className={styles.specialty}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Área de chat */}
          <main className={styles.chatArea}>
            {selectedAgent ? (
              <>
                <div className={styles.chatHeader}>
                  <div className={styles.agentAvatar}>
                    {selectedAgent.avatar}
                  </div>
                  <div>
                    <h2>{selectedAgent.displayName}</h2>
                    <p>{selectedAgent.description}</p>
                  </div>
                </div>

                {/* Mensagens */}
                <div className={styles.messagesContainer}>
                  {messages.length === 0 && (
                    <div className={styles.emptyState}>
                      <h3>👋 Olá! Como posso ajudar?</h3>
                      <p>Experimente perguntar:</p>
                      <div className={styles.exampleQuestions}>
                        {selectedAgent.exampleQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            className={styles.exampleButton}
                            onClick={() => handleExampleQuestion(q)}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`${styles.message} ${
                        msg.role === 'user' ? styles.userMessage : styles.agentMessage
                      }`}
                    >
                      {msg.role === 'agent' && (
                        <div className={styles.messageAvatar}>
                          {selectedAgent.avatar}
                        </div>
                      )}
                      <div className={styles.messageContent}>
                        {msg.role === 'agent' && (
                          <div className={styles.messageName}>{msg.agentName}</div>
                        )}
                        <div className={styles.messageText}>{msg.content}</div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className={styles.sources}>
                            <details>
                              <summary>
                                📚 {msg.sources.length} fonte(s) utilizada(s)
                              </summary>
                              <div className={styles.sourcesList}>
                                {msg.sources.map((source, i) => (
                                  <div key={i} className={styles.source}>
                                    <strong>
                                      {source.metadata.topic || 'Material Atomize'}
                                    </strong>
                                    <span>
                                      Relevância:{' '}
                                      {(source.similarity * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className={styles.message + ' ' + styles.agentMessage}>
                      <div className={styles.messageAvatar}>
                        {selectedAgent.avatar}
                      </div>
                      <div className={styles.messageContent}>
                        <div className={styles.loading}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className={styles.inputArea}>
                  {error && <div className={styles.error}>{error}</div>}
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Digite sua pergunta..."
                      disabled={loading}
                      className={styles.input}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={loading || !input.trim()}
                      className={styles.sendButton}
                    >
                      {loading ? '⏳' : '📤'}
                    </button>
                  </div>
                  <p className={styles.disclaimer}>
                    💡 As respostas são baseadas nos materiais oficiais da
                    Atomize
                  </p>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <h3>Selecione um agente para começar</h3>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
