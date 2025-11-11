-- CreateExtension para pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "agent_documents" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "embedding" vector(1536),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "query_logs" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "user_id" TEXT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "retrieved_doc_ids" JSONB NOT NULL,
    "retrieval_scores" JSONB NOT NULL,
    "response_time_ms" INTEGER NOT NULL,
    "model_used" TEXT NOT NULL,
    "tokens_used" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_documents_agent_id_idx" ON "agent_documents"("agent_id");

-- CreateIndex
CREATE INDEX "query_logs_agent_id_idx" ON "query_logs"("agent_id");

-- CreateIndex
CREATE INDEX "query_logs_user_id_idx" ON "query_logs"("user_id");

-- CreateIndex
CREATE INDEX "query_logs_created_at_idx" ON "query_logs"("created_at");

-- Criar índice IVFFlat para busca vetorial eficiente
CREATE INDEX agent_documents_embedding_idx ON agent_documents 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
