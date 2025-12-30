-- Step 1: Create a temporary column to store User.id
ALTER TABLE "categories" ADD COLUMN "user_id_temp" TEXT;

-- Step 2: Update user_id_temp with User.id from users table based on lineUserId
UPDATE "categories" c
SET "user_id_temp" = u."id"
FROM "users" u
WHERE c."user_id" = u."lineUserId";

-- Step 3: Drop the old user_id column
ALTER TABLE "categories" DROP COLUMN "user_id";

-- Step 4: Rename user_id_temp to user_id
ALTER TABLE "categories" RENAME COLUMN "user_id_temp" TO "user_id";

-- Step 5: Make user_id NOT NULL
ALTER TABLE "categories" ALTER COLUMN "user_id" SET NOT NULL;

-- Step 6: Drop old index if exists
DROP INDEX IF EXISTS "categories_user_id_idx";

-- Step 7: Create new index
CREATE INDEX "categories_user_id_idx" ON "categories"("user_id");

-- Step 8: Add foreign key constraint
ALTER TABLE "categories" 
ADD CONSTRAINT "categories_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


