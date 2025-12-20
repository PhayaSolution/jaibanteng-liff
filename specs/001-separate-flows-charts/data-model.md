# Data Model: Separate Flows & Charts

## Entities

### Category (Modified)
Represents a grouping of transactions. Now strictly typed.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | String | Yes | UUID | Primary Key |
| name | String | Yes | - | Display name |
| type | String | Yes | "EXPENSE" | "INCOME" or "EXPENSE" (New Field) |
| ... | ... | ... | ... | Existing fields |

### Transaction (Modified)
Represents a financial record.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | String | Yes | "INCOME" or "EXPENSE" (Enforce match with Category.type) |
| categoryId | String | Yes | Foreign Key to Category |

## Schema Updates

```prisma
model Category {
  id        String   @id @default(cuid())
  name      String
  type      String   @default("EXPENSE") // New field
  // ... relations
}

// Transaction model already likely has 'type' or similar, we must ensure consistency.
```

## Validation Rules

1. **Category Creation**: `type` must be provided.
2. **Transaction Creation**: `Transaction.type` must match `Category.type`.
3. **Migration**: Run `UPDATE "Category" SET "type" = 'EXPENSE' WHERE "type" IS NULL;` (handled by Prisma default).
