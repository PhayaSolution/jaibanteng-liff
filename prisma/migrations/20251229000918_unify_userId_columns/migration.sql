-- Migration: Unify userId columns across categories, transactions, and tags
-- Goal: Use single userId column (TEXT from users.id) for all user ownership
-- Note: users.id is TEXT type, not UUID, so we keep userId as TEXT/VarChar

-- ============================================
-- CATEGORIES TABLE
-- ============================================
-- Step 1: Drop old foreign key constraint and indexes for user_id
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_userId_fkey";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_user_id_fkey";
DROP INDEX IF EXISTS "categories_userId_idx";
DROP INDEX IF EXISTS "categories_user_id_idx";

-- Step 2: Drop old user_id column (if it exists)
ALTER TABLE "categories" DROP COLUMN IF EXISTS "user_id";

-- Step 3: Rename line_id to userId
ALTER TABLE "categories" RENAME COLUMN "line_id" TO "userId";

-- Step 4: Ensure userId column type is TEXT/VarChar (to match users.id which is text)
-- Keep as VarChar/TEXT, don't convert to UUID since users.id is text

-- Step 5: Set userId as NOT NULL
ALTER TABLE "categories" ALTER COLUMN "userId" SET NOT NULL;

-- Step 6: Add foreign key constraint
ALTER TABLE "categories" 
ADD CONSTRAINT "categories_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Create index
CREATE INDEX "categories_userId_idx" ON "categories"("userId");

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
-- Step 1: Drop old foreign key constraint and indexes for user_id
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_userId_fkey";
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_user_id_fkey";
DROP INDEX IF EXISTS "transactions_userId_idx";
DROP INDEX IF EXISTS "transactions_userId_date_idx";
DROP INDEX IF EXISTS "transactions_userId_type_idx";
DROP INDEX IF EXISTS "transactions_userId_status_idx";

-- Step 2: Handle the case where userId column might exist (from Prisma @map to user_id)
-- and line_id column exists - we need to consolidate them
DO $$
BEGIN
    -- If userId column exists (from Prisma @map), we need to copy data from line_id first
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'userId'
    ) THEN
        -- Copy data from line_id to userId if line_id has data and userId is null/empty
        UPDATE "transactions" 
        SET "userId" = "line_id" 
        WHERE "line_id" IS NOT NULL 
        AND ("userId" IS NULL OR "userId" = '');
        
        -- Drop line_id column since we've copied the data
        ALTER TABLE "transactions" DROP COLUMN IF EXISTS "line_id";
    ELSE
        -- If userId doesn't exist, rename line_id to userId
        ALTER TABLE "transactions" RENAME COLUMN "line_id" TO "userId";
    END IF;
END $$;

-- Step 3: Drop old user_id column (the one that userId was mapped to, if it still exists)
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "user_id";

-- Step 4: Ensure userId column type is TEXT/VarChar (to match users.id which is text)
-- Keep as VarChar/TEXT, don't convert to UUID since users.id is text

-- Step 5: Set userId as NOT NULL
ALTER TABLE "transactions" ALTER COLUMN "userId" SET NOT NULL;

-- Step 6: Add foreign key constraint
ALTER TABLE "transactions" 
ADD CONSTRAINT "transactions_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Create indexes
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");
CREATE INDEX "transactions_userId_date_idx" ON "transactions"("userId", "date");
CREATE INDEX "transactions_userId_type_idx" ON "transactions"("userId", "type");
CREATE INDEX "transactions_userId_status_idx" ON "transactions"("userId", "status");

-- ============================================
-- TAGS TABLE
-- ============================================
-- Step 1: Ensure userId column type is TEXT/VarChar (to match users.id which is text)
-- Keep as VarChar/TEXT, don't convert to UUID since users.id is text

-- Step 2: Set userId as NOT NULL (if it's currently nullable)
ALTER TABLE "tags" ALTER COLUMN "userId" SET NOT NULL;

-- Step 3: Drop old foreign key constraint if it exists (might have different name)
ALTER TABLE "tags" DROP CONSTRAINT IF EXISTS "tags_userId_fkey";
DROP INDEX IF EXISTS "tags_userId_idx";

-- Step 4: Add foreign key constraint
ALTER TABLE "tags" 
ADD CONSTRAINT "tags_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Create index
CREATE INDEX "tags_userId_idx" ON "tags"("userId");
