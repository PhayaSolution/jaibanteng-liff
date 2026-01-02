-- Migration: Fix userId column renaming for categories and transactions
-- This migration handles the case where user_id exists instead of line_id
-- Goal: Ensure all tables use userId column that references users.id

-- ============================================
-- CATEGORIES TABLE
-- ============================================
-- Step 1: Drop old foreign key constraint and indexes
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_userId_fkey";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_user_id_fkey";
DROP INDEX IF EXISTS "categories_userId_idx";
DROP INDEX IF EXISTS "categories_user_id_idx";

-- Step 2: Rename user_id to userId if user_id exists
-- If userId already exists, just drop user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'user_id'
    ) THEN
        -- Check if userId also exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'categories' 
            AND column_name = 'userId'
        ) THEN
            -- Both exist, drop user_id
            ALTER TABLE "categories" DROP COLUMN "user_id";
        ELSE
            -- Only user_id exists, rename it to userId
            ALTER TABLE "categories" RENAME COLUMN "user_id" TO "userId";
        END IF;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'userId'
    ) THEN
        -- Neither exists, create userId (shouldn't happen, but safe)
        ALTER TABLE "categories" ADD COLUMN "userId" TEXT;
    END IF;
END $$;

-- Step 3: Set userId as NOT NULL
ALTER TABLE "categories" ALTER COLUMN "userId" SET NOT NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE "categories" 
ADD CONSTRAINT "categories_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Create index
CREATE INDEX "categories_userId_idx" ON "categories"("userId");

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
-- Step 1: Drop old foreign key constraint and indexes
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_userId_fkey";
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_user_id_fkey";
DROP INDEX IF EXISTS "transactions_userId_idx";
DROP INDEX IF EXISTS "transactions_userId_date_idx";
DROP INDEX IF EXISTS "transactions_userId_type_idx";
DROP INDEX IF EXISTS "transactions_userId_status_idx";
DROP INDEX IF EXISTS "transactions_user_id_idx";
DROP INDEX IF EXISTS "transactions_user_id_date_idx";
DROP INDEX IF EXISTS "transactions_user_id_type_idx";
DROP INDEX IF EXISTS "transactions_user_id_status_idx";

-- Step 2: Rename user_id to userId if user_id exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'user_id'
    ) THEN
        -- Check if userId also exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'transactions' 
            AND column_name = 'userId'
        ) THEN
            -- Both exist, drop user_id
            ALTER TABLE "transactions" DROP COLUMN "user_id";
        ELSE
            -- Only user_id exists, rename it to userId
            ALTER TABLE "transactions" RENAME COLUMN "user_id" TO "userId";
        END IF;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'userId'
    ) THEN
        -- Neither exists, create userId (shouldn't happen, but safe)
        ALTER TABLE "transactions" ADD COLUMN "userId" TEXT;
    END IF;
END $$;

-- Step 3: Set userId as NOT NULL
ALTER TABLE "transactions" ALTER COLUMN "userId" SET NOT NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE "transactions" 
ADD CONSTRAINT "transactions_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Create indexes
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");
CREATE INDEX "transactions_userId_date_idx" ON "transactions"("userId", "date");
CREATE INDEX "transactions_userId_type_idx" ON "transactions"("userId", "type");
CREATE INDEX "transactions_userId_status_idx" ON "transactions"("userId", "status");

-- ============================================
-- TAGS TABLE
-- ============================================
-- Tags should already have userId, just ensure constraints are correct
-- Step 1: Set userId as NOT NULL (if it's currently nullable)
ALTER TABLE "tags" ALTER COLUMN "userId" SET NOT NULL;

-- Step 2: Drop old foreign key constraint if it exists
ALTER TABLE "tags" DROP CONSTRAINT IF EXISTS "tags_userId_fkey";
DROP INDEX IF EXISTS "tags_userId_idx";

-- Step 3: Add foreign key constraint
ALTER TABLE "tags" 
ADD CONSTRAINT "tags_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 4: Create index
CREATE INDEX "tags_userId_idx" ON "tags"("userId");

