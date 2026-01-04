-- Step 1: Add userId column to transactions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'userId'
    ) THEN
        ALTER TABLE "transactions" ADD COLUMN "userId" TEXT;
    END IF;
END $$;

-- Step 2: Add userId column to categories table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'userId'
    ) THEN
        ALTER TABLE "categories" ADD COLUMN "userId" TEXT;
    END IF;
END $$;

-- Step 3: Get or create a default user and assign existing data to it
DO $$
DECLARE
    default_user_id TEXT;
BEGIN
    -- Get the first user, or create a default one if none exists
    SELECT id INTO default_user_id FROM "users" LIMIT 1;
    
    IF default_user_id IS NULL THEN
        -- Create a default user if none exists
        INSERT INTO "users" ("id", "lineUserId", "displayName", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, 'default-user', 'Default User', NOW(), NOW())
        RETURNING id INTO default_user_id;
    END IF;
    
    -- Update all transactions without userId
    UPDATE "transactions" 
    SET "userId" = default_user_id 
    WHERE "userId" IS NULL;
    
    -- Update all categories without userId
    UPDATE "categories" 
    SET "userId" = default_user_id 
    WHERE "userId" IS NULL;
END $$;

-- Step 4: Make userId columns non-nullable
ALTER TABLE "transactions" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "categories" ALTER COLUMN "userId" SET NOT NULL;

-- Step 5: Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transactions_userId_fkey'
    ) THEN
        ALTER TABLE "transactions" 
        ADD CONSTRAINT "transactions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'categories_userId_fkey'
    ) THEN
        ALTER TABLE "categories" 
        ADD CONSTRAINT "categories_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 6: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "transactions_userId_idx" ON "transactions"("userId");
CREATE INDEX IF NOT EXISTS "categories_userId_idx" ON "categories"("userId");
CREATE INDEX IF NOT EXISTS "transactions_userId_date_idx" ON "transactions"("userId", "date");
CREATE INDEX IF NOT EXISTS "transactions_userId_type_idx" ON "transactions"("userId", "type");
CREATE INDEX IF NOT EXISTS "transactions_userId_status_idx" ON "transactions"("userId", "status");




