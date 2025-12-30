-- Step 1: Add user_id column to categories table
ALTER TABLE "categories" ADD COLUMN "user_id" TEXT;

-- Step 2: Update user_id with lineUserId from users table
UPDATE "categories" c
SET "user_id" = u."lineUserId"
FROM "users" u
WHERE c."userId" = u."id";

-- Step 3: Make user_id NOT NULL after data migration
ALTER TABLE "categories" ALTER COLUMN "user_id" SET NOT NULL;

-- Step 4: Drop old foreign key constraint
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_userId_fkey";

-- Step 5: Drop old index
DROP INDEX IF EXISTS "categories_userId_idx";

-- Step 6: Drop userId column
ALTER TABLE "categories" DROP COLUMN "userId";

-- Step 7: Create new index for user_id
CREATE INDEX "categories_user_id_idx" ON "categories"("user_id");


