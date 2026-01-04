-- Rename column from userId to user_id
ALTER TABLE "transactions" RENAME COLUMN "userId" TO "user_id";

-- Drop old indexes
DROP INDEX IF EXISTS "transactions_userId_idx";
DROP INDEX IF EXISTS "transactions_userId_date_idx";
DROP INDEX IF EXISTS "transactions_userId_type_idx";
DROP INDEX IF EXISTS "transactions_userId_status_idx";

-- Create new indexes with user_id
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");
CREATE INDEX "transactions_user_id_date_idx" ON "transactions"("user_id", "date");
CREATE INDEX "transactions_user_id_type_idx" ON "transactions"("user_id", "type");
CREATE INDEX "transactions_user_id_status_idx" ON "transactions"("user_id", "status");

-- Drop old foreign key constraint if it exists
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_userId_fkey";

-- Add new foreign key constraint with user_id
ALTER TABLE "transactions" 
ADD CONSTRAINT "transactions_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;




