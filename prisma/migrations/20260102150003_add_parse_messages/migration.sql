-- CreateTable
CREATE TABLE "parse_messages" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parse_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parse_messages_keyword_key" ON "parse_messages"("keyword");

-- CreateIndex
CREATE INDEX "parse_messages_keyword_idx" ON "parse_messages"("keyword");

-- CreateIndex
CREATE INDEX "parse_messages_type_idx" ON "parse_messages"("type");

-- CreateIndex
CREATE INDEX "parse_messages_category_idx" ON "parse_messages"("category");
